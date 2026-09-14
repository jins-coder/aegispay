# ADR-003: Isolated Signer Boundary and Watch-Only Address Derivation

## Status
Accepted

## Context
Exposing private keys to web services or databases is a catastrophic security vulnerability in custodial architectures.

## Decision
1. Online services use watch-only Extended Public Keys (xpub) for address generation.
2. The Signer is deployed as a standalone, network-isolated service behind mTLS.
3. The Signer accepts only approved transaction intents, verifies cryptographic and destination policy, and signs the transaction in memory without leaking key material.

## Consequences
- Total compromise of web servers or databases cannot compromise private keys.
- Production signing path is seamlessly swappable with Hardware Security Modules (HSMs) or MPC providers (Fireblocks, Qredo).
