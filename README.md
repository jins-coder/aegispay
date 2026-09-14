# AegisPay — Multi-Network Crypto Deposit & Settlement Gateway

AegisPay is a production-oriented, custodial multi-network cryptocurrency deposit and settlement gateway with immutable double-entry ledger accounting, watch-only test address allocation, isolated signer boundaries, and separate customer/admin interfaces.

---

## Quick Start (Local Development)

### 1. Requirements
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker & Docker Compose (for PostgreSQL & Redis)

### 2. Installation
```bash
pnpm install
```

### 3. Run Test Suite
```bash
pnpm test
```

### 4. Start Local Services
```bash
# Start Docker infrastructure (Postgres, Redis, Mock Signer)
docker compose -f infra/docker-compose.yml up -d

# Start backend services & web apps
pnpm dev
```

---

## Architectural Principles
- **No Float Math:** All balance amounts are stored and calculated as exact integer atomic units (`BigInt` / `NUMERIC(78, 0)`).
- **Double-Entry Balance Constraint:** Every journal balances Debits == Credits per economic asset.
- **Fail-Closed Safety:** `MAINNET_ENABLED=false` and `WITHDRAWALS_ENABLED=false` are strict defaults.
- **Zero Online Secrets:** Addresses are allocated via public watch-only keys; private keys remain offline or inside HSM boundaries.
