# ADR-001: Modular Monolith Core with PostgreSQL Double-Entry Ledger

## Status
Accepted

## Context
A financial gateway requires strict atomicity, serialization isolation, and mathematical balance across all transactions. Microservices with distributed 2-phase commit introduce split-brain risks, partial failures, and high operational complexity.

## Decision
We implement a modular-monolith domain core with explicit module boundaries, PostgreSQL transactional guarantees, row-level locking (`FOR UPDATE SKIP LOCKED`), and outbox events for asynchronous workers.

## Consequences
- Single source of truth in PostgreSQL.
- Eliminates balance drifting and distributed transaction failures.
- Workers and signing services remain decoupled via outbox/inbox queues.
