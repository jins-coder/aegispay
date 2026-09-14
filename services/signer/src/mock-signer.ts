import crypto from 'node:crypto';
import {
  SignerPort,
  UnsignedTransferIntent,
  UnsignedPayload,
  SignedPayload
} from '@aegispay/chain-sdk';

export class MockSignerService implements SignerPort {
  private readonly isMainnetEnabled: boolean;

  constructor(options?: { isMainnetEnabled?: boolean }) {
    this.isMainnetEnabled = options?.isMainnetEnabled ?? false;
  }

  async getPublicMaterial(keyRef: string): Promise<{ publicKeyHex: string; xpub?: string }> {
    const mockHash = crypto.createHash('sha256').update(`pub:${keyRef}`).digest('hex');
    return {
      publicKeyHex: `04${mockHash}`,
      xpub: `xpub661MyMwAqRbcFmockKeyReferenceMaterial${mockHash.slice(0, 32)}`
    };
  }

  async signApprovedIntent(
    intent: UnsignedTransferIntent,
    unsignedPayload: UnsignedPayload
  ): Promise<SignedPayload> {
    // Strict Safety Guardrail: Mock Signer MUST NEVER sign for mainnet environments
    if (this.isMainnetEnabled || intent.networkId.includes('mainnet')) {
      throw new Error('FATAL: MockSignerService is blocked from signing mainnet transactions');
    }

    if (intent.intentId !== unsignedPayload.intentId) {
      throw new Error('Intent ID mismatch between request and unsigned payload');
    }

    const payloadHash = crypto
      .createHash('sha256')
      .update(`${intent.intentId}:${intent.amountAtomic}:${unsignedPayload.rawPayload}`)
      .digest('hex');

    const signedTxHex = `0xf86c${payloadHash}mock_signed_bytes`;
    const txHash = `0x${crypto.createHash('sha256').update(signedTxHex).digest('hex')}`;

    return {
      intentId: intent.intentId,
      networkId: intent.networkId,
      signedTxHex,
      txHash
    };
  }
}
