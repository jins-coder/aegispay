export type NetworkId = string;
export type AssetId = string;
export type AssetNetworkId = string;
export type AtomicAmount = string; // Canonical unsigned base-10 integer string at all boundaries

export type FinalityStatus = 'observed' | 'confirming' | 'safe' | 'finalized' | 'solidified';

export interface Finality {
  status: FinalityStatus;
  confirmations: number;
}

export interface NormalizedTransfer {
  eventId: string;
  networkId: NetworkId;
  assetNetworkId: AssetNetworkId;
  txHash: string;
  blockHash: string;
  blockHeight: string;
  eventIndex: string;
  fromAddress: string;
  toAddress: string;
  amountAtomic: AtomicAmount;
  executionSucceeded: boolean;
  finality: Finality;
  observedAt: string;
  rawReferenceHash: string;
}

export interface NetworkManifest {
  id: NetworkId;
  name: string;
  family: 'evm' | 'tron' | 'utxo' | 'solana';
  chainId: string;
  environment: 'local' | 'testnet' | 'mainnet';
  nativeAssetSymbol: string;
  confirmationDepth: number;
  isPaused: boolean;
  isEnabled: boolean;
}

export interface AssetNetworkManifest {
  id: AssetNetworkId;
  assetId: AssetId;
  networkId: NetworkId;
  type: 'native' | 'erc20' | 'trc20';
  contractAddress?: string;
  decimals: number;
  minimumDepositAtomic: AtomicAmount;
  sweepThresholdAtomic: AtomicAmount;
  isEnabled: boolean;
}

export interface DerivedAddress {
  networkId: NetworkId;
  address: string;
  normalizedAddress: string;
  derivationIndex: number;
}

export interface WatchDerivationInput {
  networkId: NetworkId;
  derivationIndex: number;
}

export interface ChainCursor {
  networkId: NetworkId;
  lastScannedBlock: bigint;
  finalizedBlock: bigint;
}

export interface UnsignedTransferIntent {
  intentId: string;
  networkId: NetworkId;
  assetNetworkId: AssetNetworkId;
  sourceAddress: string;
  destinationAddress: string;
  amountAtomic: AtomicAmount;
  feeLimitAtomic?: AtomicAmount;
}

export interface UnsignedPayload {
  intentId: string;
  networkId: NetworkId;
  rawPayload: string;
}

export interface SignedPayload {
  intentId: string;
  networkId: NetworkId;
  signedTxHex: string;
  txHash: string;
}

export interface BroadcastResult {
  networkId: NetworkId;
  txHash: string;
  broadcastAccepted: boolean;
  broadcastTimestamp: string;
}

export interface ChainAdapter {
  readonly family: 'evm' | 'tron' | 'utxo' | 'solana';
  readonly capabilities: ReadonlySet<string>;

  normalizeAddress(address: string): string;
  validateAddress(address: string): boolean;
  deriveWatchAddress(input: WatchDerivationInput): Promise<DerivedAddress>;
  getFinalizedCursor(): Promise<ChainCursor>;
  estimateTransferFee(intent: UnsignedTransferIntent): Promise<AtomicAmount>;
  buildUnsignedTransfer(intent: UnsignedTransferIntent): Promise<UnsignedPayload>;
  broadcastSignedTransfer(signed: SignedPayload): Promise<BroadcastResult>;
}

export interface SignerPort {
  getPublicMaterial(keyRef: string): Promise<{ publicKeyHex: string; xpub?: string }>;
  signApprovedIntent(intent: UnsignedTransferIntent, unsignedPayload: UnsignedPayload): Promise<SignedPayload>;
}
