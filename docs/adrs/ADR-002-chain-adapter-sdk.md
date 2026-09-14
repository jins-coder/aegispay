# ADR-002: Chain Adapter SDK & Normalized Transfer Interfaces

## Status
Accepted

## Context
Different blockchain families (EVM, TRON, UTXO, Solana) operate with fundamentally different data structures, fee mechanisms, and receipt semantics.

## Decision
We enforce a capability-based `ChainAdapter` interface. Adapters return standardized `NormalizedTransfer` objects with normalized addresses, atomic amounts, and finality tags. Ledger and deposit domains never consume blockchain-specific SDK types.

## Consequences
- Clean plug-in architecture for adding tokens and networks.
- Core business logic remains 100% agnostic of blockchain nuances.
