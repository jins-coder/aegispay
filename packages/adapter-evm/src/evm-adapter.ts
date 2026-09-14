import crypto from 'node:crypto';
import {
  ChainAdapter,
  NetworkManifest,
  WatchDerivationInput,
  DerivedAddress,
  ChainCursor,
  UnsignedTransferIntent,
  UnsignedPayload,
  SignedPayload,
  BroadcastResult,
  AtomicAmount,
  normalizeEvmAddress,
  isValidEvmAddress
} from '@aegispay/chain-sdk';

export class EvmChainAdapter implements ChainAdapter {
  readonly family = 'evm' as const;
  readonly capabilities = new Set([
    'native-transfer',
    'token-transfer',
    'finalized-tag',
    'fee-estimation'
  ]);

  constructor(private readonly manifest: NetworkManifest) {
    if (manifest.family !== 'evm') {
      throw new Error(`EvmChainAdapter initialized with invalid family: ${manifest.family}`);
    }
  }

  normalizeAddress(address: string): string {
    return normalizeEvmAddress(address);
  }

  validateAddress(address: string): boolean {
    return isValidEvmAddress(address);
  }

  async deriveWatchAddress(input: WatchDerivationInput): Promise<DerivedAddress> {
    // Deterministic watch-only test derivation based on derivation index and network salt
    const seed = `evm:${this.manifest.chainId}:${input.derivationIndex}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const rawAddress = `0x${hash.slice(24)}`;
    const normalized = normalizeEvmAddress(rawAddress);

    return {
      networkId: this.manifest.id,
      address: rawAddress,
      normalizedAddress: normalized,
      derivationIndex: input.derivationIndex
    };
  }

  async getFinalizedCursor(): Promise<ChainCursor> {
    return {
      networkId: this.manifest.id,
      lastScannedBlock: 120500n,
      finalizedBlock: 120488n // e.g. 12 confirmations depth
    };
  }

  async estimateTransferFee(intent: UnsignedTransferIntent): Promise<AtomicAmount> {
    // 21,000 gas * 20 gwei = 420,000 gwei = 420000000000000 wei
    return '420000000000000';
  }

  async buildUnsignedTransfer(intent: UnsignedTransferIntent): Promise<UnsignedPayload> {
    const rawPayload = JSON.stringify({
      chainId: this.manifest.chainId,
      to: this.normalizeAddress(intent.destinationAddress),
      value: intent.amountAtomic,
      data: '0x'
    });

    return {
      intentId: intent.intentId,
      networkId: this.manifest.id,
      rawPayload
    };
  }

  async broadcastSignedTransfer(signed: SignedPayload): Promise<BroadcastResult> {
    return {
      networkId: this.manifest.id,
      txHash: signed.txHash,
      broadcastAccepted: true,
      broadcastTimestamp: new Date().toISOString()
    };
  }
}
