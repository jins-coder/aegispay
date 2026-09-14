# Security Policy & Vulnerability Disclosure

## 1. Security Architecture Summary
AegisPay adheres to strict defense-in-depth principles:
- **Zero Online Private Keys for Address Allocation:** All deposit addresses are derived via public watch-only keys.
- **Isolated Signer Microservice:** Signing operations are isolated behind mTLS with strict intent policy verification.
- **Immutable Financial Ledger:** All balance alterations require balanced double-entry journals with audit history.
- **Fail-Closed Defaults:** `MAINNET_ENABLED=false` and `WITHDRAWALS_ENABLED=false` are hard-coded runtime defaults.

## 2. Reporting a Vulnerability
Please report potential security vulnerabilities to `security@aegispay.internal`. Do not open public issues. All valid submissions will be acknowledged within 24 hours.
