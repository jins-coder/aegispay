# AegisPay Worklog

## Completed Phases

### Phase 0: Architecture & Safety Baseline
- Scaffolded workspace monorepo layout (`packages/*`, `services/*`, `apps/*`).
- Authored system architecture, STRIDE threat model, double-entry ledger equations, key management rules, compliance boundaries, and continuous reconciliation specifications.
- Established Architectural Decision Records (ADRs): Modular Monolith Ledger (`ADR-001`), Chain Adapter SDK (`ADR-002`), and Signer Isolation (`ADR-003`).
- Authored `SECURITY.md` and `PRODUCTION_READINESS_CHECKLIST.md`.

### Phase 2: Generic EVM Testnet Path & ERC-20 Ingestion
- Built `services/chain-workers`: `EvmRangeScanner` with startup chain-id verification and resumable cursor management.
- Implemented ERC-20 `Transfer` log filtering strictly by allowlisted contract address (anti-spoofing).
- Implemented `DepositPipeline`: state machine transitions, balanced credit journal posting, and outbox event emissions.
- Verified 100-event replay idempotency, fake token rejection, and reverted transaction receipt handling (33 passing tests total).

---

## Open Risks & Mitigations
- **Production Key Storage:** Mock signer is strictly for local/testnet environments. Production requires HSM/MPC deployment as detailed in `PRODUCTION_READINESS_CHECKLIST.md`.
- **Mainnet Activation:** Shipped with `MAINNET_ENABLED=false` and `WITHDRAWALS_ENABLED=false` by default.

---

## Next Phase
- **Phase 3:** Live TRON Nile range scanner, solidified block verification, and mock TRC-20 `10.000000` Nile acceptance flow.
