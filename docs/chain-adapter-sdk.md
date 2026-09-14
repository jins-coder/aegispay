# Chain Adapter SDK & Extension Guide

## 1. Extension Levels
AegisPay is architected for zero-risk multi-chain extensibility:

1. **Adding a New Token on an Existing Network (e.g. USDT on EVM):**
   - Add asset-network YAML/JSON manifest with verified contract address & decimals.
   - Run conformance test fixtures.
   - **Zero domain/ledger code changes required.**

2. **Adding a New EVM-Compatible Network (e.g. Polygon, Arbitrum, Base):**
   - Register network manifest with chain ID, RPC pool, and finality policy.
   - Conformance test runs against generic EVM adapter.
   - **Zero ledger code changes required.**

3. **Adding a New Chain Family (e.g. Solana, Bitcoin UTXO):**
   - Implement `@aegispay/adapter-solana` implementing `ChainAdapter` and `SignerPort`.
   - Implement address normalization & range scanner.
   - Pass conformance test suite.

## 2. Core Adapter Interface Contract
```typescript
export interface ChainAdapter {
  readonly family: 'evm' | 'tron' | 'utxo' | 'solana';
  readonly capabilities: ReadonlySet<string>;

  normalizeAddress(address: string): string;
  validateAddress(address: string): boolean;
  deriveWatchAddress(input: WatchDerivationInput): Promise<DerivedAddress>;
  getFinalizedCursor(): Promise<ChainCursor>;
  scanRange(startBlock: bigint, endBlock: bigint): AsyncIterable<NormalizedTransfer>;
  estimateTransferFee(intent: UnsignedTransferIntent): Promise<FeeEstimate>;
  buildUnsignedTransfer(intent: UnsignedTransferIntent): Promise<UnsignedPayload>;
  broadcastSignedTransfer(signedPayload: SignedPayload): Promise<BroadcastResult>;
}
```
