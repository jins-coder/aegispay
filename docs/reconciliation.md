# Continuous Reconciliation & Invariant Engine

## 7-Point Continuous Reconciliation System

1. **Chain Cursor Reconciliation:** Continuous block range assertions to verify zero missing blocks or block height skips between scanner state and node height.
2. **Event-to-Deposit Reconciliation:** Every finalized blockchain event maps to exactly one registered deposit or an audited exception record.
3. **Deposit-to-Ledger Reconciliation:** Every credited deposit maps to exactly one balanced ledger journal matching the exact asset and atomic amount.
4. **Sweep Reconciliation:** On-chain sweep movements match the corresponding asset-location ledger journal.
5. **On-Chain Custody Reconciliation:** Total on-chain wallet balances (Deposit + Hot + Cold) equal the ledger `asset:onchain:*` account balances.
6. **User Liability Control Reconciliation:** Sum of user Funding + Trading + Locked liability accounts equals total platform customer liabilities.
7. **Solvency Assertion:** Total controlled reserves strictly equal or exceed total customer liabilities at all times:
   $$\text{Controlled Reserves} \ge \text{Total Liabilities}$$

A detected break automatically generates an alert, pauses the affected withdrawal/crediting rails, and creates an audit incident.
