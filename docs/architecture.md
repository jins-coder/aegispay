# AegisPay System Architecture

## 1. Overview & Principles
AegisPay is a production-oriented, custodial multi-network cryptocurrency deposit and settlement gateway built for high-throughput trading platforms and enterprise payment flows. It is architected with defense-in-depth, strictly decoupled deployment boundaries, and mathematically balanced double-entry accounting.

```
+------------------+         +------------------+
| Customer Portal  |         | Operations GUI   |
+--------+---------+         +--------+---------+
         | (Public HTTPS)             | (mTLS / IAM Auth)
+--------v---------+         +--------v---------+
|    Public API    |         |    Admin API     |
+--------+---------+         +--------+---------+
         |                            |
         +-------------+--------------+
                       |
     +-----------------v-----------------+
     |      Core Domain & Ledger         |
     |  (Address Alloc, Journals, Holds) |
     +-----------------+-----------------+
                       |
        +--------------+--------------+
        |                             |
+-------v---------+           +-------v---------+
| PostgreSQL (DB) |           |  Chain Workers  |
| Source of Truth |           | (EVM, TRON SDK) |
+-----------------+           +-------+---------+
                                      |
                              +-------v---------+
                              | Isolated Signer |
                              |  (HSM / Mock)   |
                              +-----------------+
```

## 2. Deployment Separation & Trust Boundaries

| Component | Security Tier | Access Surface | Network Ingress | Outbound Egress |
|---|---|---|---|---|
| `Customer Portal` | Tier 3 (Public UI) | Browser | CDN / Public HTTPS | Public API origin only |
| `Operations Console` | Tier 2 (Privileged UI) | Internal Operator | VPN / IdP SSO / WebAuthn | Admin API origin only |
| `Public API` | Tier 2 (Public Edge) | Authenticated Users | Internet via WAF / API GW | Core DB, Redis, Outbox |
| `Admin API` | Tier 1 (Internal Ops) | Operations Staff | Internal Subnet / Tailscale | Core DB, Audit Sink |
| `Chain Workers` | Tier 1 (Background) | Background daemons | None (Worker polling) | Blockchain RPC nodes, Core DB |
| `Treasury Worker` | Tier 1 (Treasury) | Background daemons | None | Signer Service (mTLS), RPC nodes, DB |
| `Signer Service` | Tier 0 (Isolated Vault) | Isolated Microservice | mTLS from Treasury Worker only | None (Zero Internet access) |
| `PostgreSQL` | Tier 0 (Data Core) | Authoritative DB | Internal VPC Only | None |

## 3. Strict Safety Gates
1. `MAINNET_ENABLED=false`: Hard failure in runtime configuration if set to true without signed ceremony artifacts.
2. `WITHDRAWALS_ENABLED=false`: Withdrawals remain dormant by default; requires dual-approval unlocking ceremony.
3. No Raw Key Material: Private keys never enter web processes, database tables, Redis, logs, or error traces.
4. Watch-Only Address Derivation: Online address service uses only public master keys (xpub/ypub) to allocate user deposit addresses.
