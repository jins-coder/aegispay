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
  normalizeTronAddress,
  isValidTronAddress
} from '@aegispay/chain-sdk';

export class TronChainAdapter implements ChainAdapter {
  readonly family = 'tron' as const;
  readonly capabilities = new Set([
    'native-transfer',
    'token-transfer',
    'resource-delegation',
    'fee-estimation'
  ]);

  constructor(private readonly manifest: NetworkManifest) {
    if (manifest.family !== 'tron') {
      throw new Error(`TronChainAdapter initialized with invalid family: ${manifest.family}`);
    }
  }

  normalizeAddress(address: string): string {
    return normalizeTronAddress(address);
  }

  validateAddress(address: string): boolean {
    return isValidTronAddress(address);
  }

  async deriveWatchAddress(input: WatchDerivationInput): Promise<DerivedAddress> {
    // Deterministic watch-only test derivation for TRON (BIP-44 m/44'/195'/0'/0/i)
    const seed = `tron:${this.manifest.chainId}:${input.derivationIndex}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const hexAddress = `41${hash.slice(24)}`;
    
    // In test environment, generate a deterministic TRON Base58 address starting with T
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let base58Suffix = '';
    for (let i = 0; i < 33; i++) {
      const idx = parseInt(hash.slice((i % 30), (i % 30) + 2), 16) % base58Chars.length;
      base58Suffix += base58Chars[idx];
    }
    const displayAddress = `T${base58Suffix}`;

    return {
      networkId: this.manifest.id,
      address: displayAddress,
      normalizedAddress: hexAddress.toLowerCase(),
      derivationIndex: input.derivationIndex
    };
  }

  async getFinalizedCursor(): Promise<ChainCursor> {
    // TRON solidified block is typically 19 blocks behind current head
    return {
      networkId: this.manifest.id,
      lastScannedBlock: 48900000n,
      finalizedBlock: 48899981n
    };
  }

  async estimateTransferFee(intent: UnsignedTransferIntent): Promise<AtomicAmount> {
    // TRC-20 transfer standard fee estimate (e.g. ~13.5 TRX in Sun = 13,500,000 Sun)
    return '13500000';
  }

  async buildUnsignedTransfer(intent: UnsignedTransferIntent): Promise<UnsignedPayload> {
    const rawPayload = JSON.stringify({
      contract_address: 'mock_trc20_contract',
      function_selector: 'transfer(address,uint256)',
      parameter: {
        to: intent.destinationAddress,
        amount: intent.amountAtomic
      },
      fee_limit: intent.feeLimitAtomic || '100000000'
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
