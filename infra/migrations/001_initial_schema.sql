-- AegisPay Core PostgreSQL Schema DDL (PostgreSQL 16+)
-- All monetary values are strictly numeric integer strings (NUMERIC(78, 0)) to eliminate float imprecision.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. Identity & Compliance Tables
-- =============================================================================
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, PENDING_KYC, CLOSED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_compliance_state (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id),
    kyc_level VARCHAR(32) NOT NULL DEFAULT 'TIER_1', -- UNVERIFIED, TIER_1, TIER_2, TIER_3
    sanctions_status VARCHAR(32) NOT NULL DEFAULT 'CLEARED', -- CLEARED, PENDING_REVIEW, BLOCKED
    jurisdiction VARCHAR(8) NOT NULL DEFAULT 'US',
    risk_score INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_security_state (
    user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_type VARCHAR(32) NOT NULL DEFAULT 'TOTP', -- PASSKEY, TOTP, SMS
    failed_login_count INT NOT NULL DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE roles (
    name VARCHAR(64) PRIMARY KEY,
    description TEXT NOT NULL
);

CREATE TABLE user_roles (
    user_id VARCHAR(64) REFERENCES users(id),
    role_name VARCHAR(64) REFERENCES roles(name),
    PRIMARY KEY (user_id, role_name)
);

-- =============================================================================
-- 2. Networks & Assets Registry
-- =============================================================================
CREATE TABLE networks (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    family VARCHAR(32) NOT NULL, -- evm, tron, utxo, solana
    chain_id VARCHAR(64) NOT NULL,
    environment VARCHAR(32) NOT NULL DEFAULT 'testnet', -- local, testnet, mainnet
    native_asset_symbol VARCHAR(32) NOT NULL,
    confirmation_depth INT NOT NULL DEFAULT 12,
    is_paused BOOLEAN NOT NULL DEFAULT FALSE,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assets (
    id VARCHAR(64) PRIMARY KEY,
    symbol VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_networks (
    id VARCHAR(64) PRIMARY KEY,
    asset_id VARCHAR(64) NOT NULL REFERENCES assets(id),
    network_id VARCHAR(64) NOT NULL REFERENCES networks(id),
    type VARCHAR(32) NOT NULL, -- native, erc20, trc20
    contract_address VARCHAR(128),
    decimals INT NOT NULL,
    minimum_deposit NUMERIC(78, 0) NOT NULL DEFAULT 0,
    sweep_threshold NUMERIC(78, 0) NOT NULL DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (network_id, contract_address)
);

-- =============================================================================
-- 3. Watch-Only Address Allocation
-- =============================================================================
CREATE TABLE derivation_counters (
    network_id VARCHAR(64) PRIMARY KEY REFERENCES networks(id),
    next_index BIGINT NOT NULL DEFAULT 1
);

CREATE TABLE deposit_addresses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    network_id VARCHAR(64) NOT NULL REFERENCES networks(id),
    address VARCHAR(128) NOT NULL,
    normalized_address VARCHAR(128) NOT NULL,
    derivation_index BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (network_id, derivation_index),
    UNIQUE (network_id, normalized_address),
    UNIQUE (user_id, network_id)
);

-- =============================================================================
-- 4. Immutable Double-Entry Ledger
-- =============================================================================
CREATE TABLE ledger_accounts (
    id VARCHAR(128) PRIMARY KEY, -- e.g. asset:onchain:deposit:tron-nile:usdt, liability:user:usr1:funding:usdt
    account_type VARCHAR(32) NOT NULL, -- asset, liability, equity, expense, revenue
    asset_id VARCHAR(64) NOT NULL REFERENCES assets(id),
    user_id VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ledger_transactions (
    id VARCHAR(64) PRIMARY KEY,
    description TEXT NOT NULL,
    reference_type VARCHAR(64) NOT NULL, -- DEPOSIT, INTERNAL_TRANSFER, SWEEP, WITHDRAWAL
    reference_id VARCHAR(128) NOT NULL,
    idempotency_key VARCHAR(128) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ledger_entries (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL REFERENCES ledger_transactions(id),
    account_id VARCHAR(128) NOT NULL REFERENCES ledger_accounts(id),
    direction VARCHAR(8) NOT NULL, -- DEBIT, CREDIT
    amount NUMERIC(78, 0) NOT NULL CHECK (amount > 0),
    asset_id VARCHAR(64) NOT NULL REFERENCES assets(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_entries_account ON ledger_entries(account_id);
CREATE INDEX idx_ledger_entries_tx ON ledger_entries(transaction_id);

CREATE TABLE balance_holds (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    asset_id VARCHAR(64) NOT NULL REFERENCES assets(id),
    account_id VARCHAR(128) NOT NULL REFERENCES ledger_accounts(id),
    amount NUMERIC(78, 0) NOT NULL CHECK (amount > 0),
    reason VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, RELEASED, SETTLED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_at TIMESTAMPTZ
);

-- =============================================================================
-- 5. Deposits & Chain Ingestion
-- =============================================================================
CREATE TABLE chain_cursors (
    network_id VARCHAR(64) PRIMARY KEY REFERENCES networks(id),
    last_scanned_block BIGINT NOT NULL,
    finalized_block BIGINT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deposits (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    network_id VARCHAR(64) NOT NULL REFERENCES networks(id),
    asset_network_id VARCHAR(64) NOT NULL REFERENCES asset_networks(id),
    deposit_address_id VARCHAR(64) NOT NULL REFERENCES deposit_addresses(id),
    tx_hash VARCHAR(128) NOT NULL,
    event_index INT NOT NULL DEFAULT 0,
    block_number BIGINT NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OBSERVED', -- OBSERVED, CONFIRMING, FINALIZED, RISK_CHECK, CREDITED, HELD, MANUAL_REVIEW
    raw_reference_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (network_id, tx_hash, event_index, asset_network_id)
);

CREATE TABLE deposit_exceptions (
    id VARCHAR(64) PRIMARY KEY,
    network_id VARCHAR(64) NOT NULL REFERENCES networks(id),
    tx_hash VARCHAR(128) NOT NULL,
    reason VARCHAR(128) NOT NULL, -- UNKNOWN_TOKEN, BELOW_MINIMUM, BLACKLISTED, REORG
    raw_payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 6. Treasury, Sweeps & Signer Intents
-- =============================================================================
CREATE TABLE treasury_wallets (
    id VARCHAR(64) PRIMARY KEY,
    network_id VARCHAR(64) NOT NULL REFERENCES networks(id),
    type VARCHAR(32) NOT NULL, -- HOT, COLD
    address VARCHAR(128) NOT NULL,
    normalized_address VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(network_id, type, normalized_address)
);

CREATE TABLE sweep_jobs (
    id VARCHAR(64) PRIMARY KEY,
    deposit_id VARCHAR(64) NOT NULL REFERENCES deposits(id),
    network_id VARCHAR(64) NOT NULL REFERENCES networks(id),
    asset_network_id VARCHAR(64) NOT NULL REFERENCES asset_networks(id),
    source_address VARCHAR(128) NOT NULL,
    destination_address VARCHAR(128) NOT NULL,
    amount NUMERIC(78, 0) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ELIGIBLE', -- ELIGIBLE, RESOURCE_READY, SIGNING, BROADCAST, CONFIRMING, FINALIZED, CANCELLED
    tx_hash VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 7. Outbox, Inbox, Idempotency & Audit Trails
-- =============================================================================
CREATE TABLE idempotency_keys (
    key VARCHAR(128) PRIMARY KEY,
    actor_id VARCHAR(64) NOT NULL,
    request_hash VARCHAR(128) NOT NULL,
    response_payload JSONB,
    status_code INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE outbox_events (
    id VARCHAR(64) PRIMARY KEY,
    event_type VARCHAR(128) NOT NULL,
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, PUBLISHED, FAILED
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE TABLE audit_events (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128) NOT NULL,
    changes JSONB,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
