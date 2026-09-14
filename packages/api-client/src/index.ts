import {
  NetworkId,
  AssetId,
  AssetNetworkId,
  AtomicAmount,
  NetworkManifest,
  AssetNetworkManifest
} from '@aegispay/chain-sdk';

export interface UserProfileDto {
  id: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_KYC';
  kycLevel: string;
  sanctionsStatus: string;
}

export interface UserBalanceDto {
  assetId: AssetId;
  symbol: string;
  name: string;
  fundingAtomic: AtomicAmount;
  tradingAtomic: AtomicAmount;
  lockedAtomic: AtomicAmount;
  fundingDecimal: string;
  tradingDecimal: string;
  lockedDecimal: string;
  decimals: number;
}

export interface DepositAddressDto {
  id: string;
  networkId: NetworkId;
  networkName: string;
  address: string;
  derivationIndex: number;
  isActive: boolean;
}

export interface InternalTransferRequestDto {
  fromAccountType: 'FUNDING' | 'TRADING';
  toAccountType: 'FUNDING' | 'TRADING';
  assetId: AssetId;
  amountDecimal: string;
  idempotencyKey: string;
}

export interface DepositDto {
  id: string;
  networkId: NetworkId;
  networkName: string;
  assetId: AssetId;
  assetSymbol: string;
  txHash: string;
  amountAtomic: AtomicAmount;
  amountDecimal: string;
  status: 'OBSERVED' | 'CONFIRMING' | 'FINALIZED' | 'CREDITED' | 'HELD';
  confirmations: number;
  requiredConfirmations: number;
  observedAt: string;
}

export interface AdminOverviewDto {
  totalUsers: number;
  totalDepositsVolumeUsd: string;
  pendingDepositsCount: number;
  activeSweepJobsCount: number;
  scannerLagBlocks: Record<NetworkId, number>;
  solvencyStatus: 'HEALTHY' | 'ALERT';
  mainnetEnabled: boolean;
  withdrawalsEnabled: boolean;
}

export interface AuditEventDto {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
}
