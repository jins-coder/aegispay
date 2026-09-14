# Production Readiness Checklist & Gates

Before enabling `MAINNET_ENABLED=true` or `WITHDRAWALS_ENABLED=true`, all items below MUST be completed, signed off, and recorded in version control:

- [ ] **External Smart Contract & Security Audit:** Comprehensive penetration testing of all services and formal audit of signer boundary by tier-1 security firm.
- [ ] **Key Generation Ceremony:** Offline air-gapped root key generation ceremony for cold vaults and production HSM initialization with multi-custodian sign-offs.
- [ ] **Legal & Regulatory Licensing:** Formal written legal opinions and required regulatory registrations/licenses for every target operational jurisdiction (e.g. VASP / FIU).
- [ ] **HSM / MPC Production Signer Integration:** Production deployment of AWS KMS / CloudHSM / Fireblocks MPC replacing the mock signer boundary.
- [ ] **Disaster Recovery & Point-in-Time Restore Drill:** Verified database failover and PITR restoration exercise with documented RPO < 1 min, RTO < 15 min.
- [ ] **Continuous 7-Point Reconciliation Verification:** Live reconciliation engine active with automated alerting on any ledger/custody break.
- [ ] **Dual-Approval Maker-Checker Controls:** Configured dual-authorization policies for treasury destination modifications and manual holds.
