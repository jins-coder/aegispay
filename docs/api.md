# AegisPay API Reference (v1)

All endpoints accept and return JSON with RFC 3339 timestamps and stringified integer amounts at boundaries.

## Customer Endpoints
- `POST /v1/users/onboarding` — Register user & initiate compliance verification
- `GET  /v1/account` — Current user profile & compliance status
- `GET  /v1/assets` — Enabled economic assets
- `GET  /v1/networks` — Active blockchain networks & health status
- `GET  /v1/asset-networks` — Token/coin manifestations per network
- `POST /v1/deposit-addresses/ensure` — Allocate or fetch network deposit address
- `GET  /v1/deposit-addresses` — List user's assigned deposit addresses
- `GET  /v1/balances` — User balances (Funding, Trading, Locked)
- `POST /v1/internal-transfers` — Move funds between Funding and Trading ledger accounts
- `GET  /v1/deposits` — Inbound deposit history and confirmation status
- `GET  /v1/transactions` — Unified ledger statement

## Operations / Admin Endpoints
- `GET  /v1/admin/overview` — Platform volume, scanner lag, sweep backlog, treasury exposure
- `GET  /v1/admin/users` — List platform users & security states
- `POST /v1/admin/users/:id/hold` — Place compliance hold on user account
- `GET  /v1/admin/deposits` — All network deposits with raw reference hashes
- `GET  /v1/admin/treasury` — Vault balances, hot wallet liquidity, gas reserves
- `POST /v1/admin/networks/:id/pause` — Emergency circuit-breaker pause
- `GET  /v1/admin/audit-events` — Tamper-evident append-only audit trail
