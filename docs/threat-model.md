# STRIDE Threat Model & Defense Matrix

| Threat Category | Specific Attack Vector | Target Surface | Architectural Mitigation | Residual Risk | Owner |
|---|---|---|---|---|---|
| **Spoofing** | Fake token sent with identical symbol `USDT` | Deposit Scanner | Scanner filters strictly by allowlisted immutable smart contract address; token symbol is ignored. | None | Blockchain Eng |
| **Spoofing** | Address substitution in frontend UI | Customer Portal / API | Address served via authenticated API with checksum, rendered from server state, QR code matches verified address string. | Client malware | Security Eng |
| **Tampering** | Reorg / unfinalized block credit | Chain Ingestion | Ingestion enforces configured finality depth (e.g. TRON solidification, EVM safe tag) before posting credit journal. | Catastrophic 51% chain attack | Blockchain Eng |
| **Tampering** | Double Credit / Event replay | Core Ledger | Unique database constraint on `(network_id, tx_hash, event_index, asset_network_id)` and idempotency keys. | Zero | Backend Eng |
| **Repudiation** | Admin claims balance was adjusted without consent | Admin API / DB | Raw balance mutation disabled in schema; all adjustments require signed dual-approval compensating journals recorded in immutable audit log. | DB root operator breach | Audit / DevOps |
| **Information Disclosure** | Private key leakage in logs or crash traces | Signer / Workers | Watch-only public key derivation used online; Signer is isolated with zero outbound network access and strict PII/secret scrubbing. | Memory dump of HSM container | SecOps |
| **Denial of Service** | Micro-deposit spam to drain sweep gas | Treasury Worker | Minimum deposit threshold enforced before credit; batch sweep policies with dynamic fee profitability checks. | Dust UTXO accumulation | Treasury Eng |
| **Elevation of Privilege** | Compromised API key initiates withdrawal | Admin / Public API | Maker-checker dual approval required for high-risk operations; withdrawals disabled by default (`WITHDRAWALS_ENABLED=false`). | Rogue insider collusion | Compliance |
