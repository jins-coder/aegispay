# AegisPay Immutable Double-Entry Ledger

## 1. Accounting Equation & Sign Convention
The ledger enforces that every journal has sum(debits) = sum(credits) per economic asset:

$$\sum \text{Debits} = \sum \text{Credits}$$

### Account Hierarchy Chart
- `asset:onchain:deposit:<network>:<asset_network_id>` (Platform asset in transit at deposit address)
- `asset:onchain:hot:<network>:<asset_network_id>` (Platform liquid hot wallet asset)
- `asset:onchain:cold:<network>:<asset_network_id>` (Platform cold vault reserve asset)
- `liability:user:<user_id>:funding:<asset_id>` (Platform debt owed to user in Funding balance)
- `liability:user:<user_id>:trading:<asset_id>` (Platform debt owed to user in Trading balance)
- `liability:user:<user_id>:locked:<asset_id>` (Funds held for pending withdrawal or risk check)
- `expense:network-fees:<network>:<asset_id>` (Network miner/gas fees paid)
- `revenue:service-fees:<asset_id>` (Platform fee revenue)

---

## 2. Core Journal Lifecycle Patterns

### A. Confirmed Deposit Credit (e.g. 10.000000 Mock USDT on TRON)
```text
Journal ID: jnl_dep_019283
Description: Credit confirmed deposit dep_abc123
Entries:
  1. DEBIT  asset:onchain:deposit:tron-nile:mock-usdt-nile    10_000_000
  2. CREDIT liability:user:usr_999:funding:usdt               10_000_000
Net: 0 (Balanced)
```

### B. Funding to Trading Internal Ledger Transfer
```text
Journal ID: jnl_xfer_019284
Description: Internal transfer to trading engine
Entries:
  1. DEBIT  liability:user:usr_999:funding:usdt               10_000_000
  2. CREDIT liability:user:usr_999:trading:usdt               10_000_000
Net: 0 (Balanced)
```

### C. Treasury Sweep to Cold Vault
```text
Journal ID: jnl_swp_019285
Description: On-chain sweep from deposit address to cold vault
Entries:
  1. DEBIT  asset:onchain:cold:tron-nile:mock-usdt-nile       10_000_000
  2. CREDIT asset:onchain:deposit:tron-nile:mock-usdt-nile    10_000_000
Net: 0 (Balanced)
* USER LIABILITIES REMAIN COMPLETELY UNTOUCHED *
```

---

## 3. Immutability & Concurrency Rules
1. **Append-Only:** `ledger_transactions` and `ledger_entries` do not permit UPDATE or DELETE.
2. **Idempotency Keys:** Every journal is posted with a unique `idempotency_key` linked to the command/event ID.
3. **Integer Atomics:** All ledger amounts are stored as `BIGINT` / `NUMERIC(78, 0)` string integers. Floating point math is banned.
