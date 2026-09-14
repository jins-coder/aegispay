import { NetworkManifest, AssetNetworkManifest } from '@aegispay/chain-sdk';

export const INITIAL_NETWORKS: NetworkManifest[] = [
  {
    id: 'tron-nile',
    name: 'TRON Nile Testnet',
    family: 'tron',
    chainId: '201910292',
    environment: 'testnet',
    nativeAssetSymbol: 'TRX',
    confirmationDepth: 19,
    isPaused: false,
    isEnabled: true
  },
  {
    id: 'ethereum-sepolia',
    name: 'Ethereum Sepolia Testnet',
    family: 'evm',
    chainId: '11155111',
    environment: 'testnet',
    nativeAssetSymbol: 'ETH',
    confirmationDepth: 12,
    isPaused: false,
    isEnabled: true
  },
  {
    id: 'bsc-testnet',
    name: 'BNB Smart Chain Testnet',
    family: 'evm',
    chainId: '97',
    environment: 'testnet',
    nativeAssetSymbol: 'BNB',
    confirmationDepth: 15,
    isPaused: false,
    isEnabled: true
  }
];

export const INITIAL_ASSET_NETWORKS: AssetNetworkManifest[] = [
  {
    id: 'usdt-tron-nile',
    assetId: 'usdt',
    networkId: 'tron-nile',
    type: 'trc20',
    contractAddress: 'TXYZopTRC20MockNileContractAddress99',
    decimals: 6,
    minimumDepositAtomic: '1000000', // 1.000000 USDT minimum
    sweepThresholdAtomic: '10000000', // 10.000000 USDT sweep threshold
    isEnabled: true
  },
  {
    id: 'trx-tron-nile',
    assetId: 'trx',
    networkId: 'tron-nile',
    type: 'native',
    decimals: 6,
    minimumDepositAtomic: '10000000', // 10 TRX
    sweepThresholdAtomic: '50000000',
    isEnabled: true
  },
  {
    id: 'usdc-eth-sepolia',
    assetId: 'usdc',
    networkId: 'ethereum-sepolia',
    type: 'erc20',
    contractAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    decimals: 6,
    minimumDepositAtomic: '1000000',
    sweepThresholdAtomic: '10000000',
    isEnabled: true
  },
  {
    id: 'eth-sepolia-native',
    assetId: 'eth',
    networkId: 'ethereum-sepolia',
    type: 'native',
    decimals: 18,
    minimumDepositAtomic: '10000000000000000', // 0.01 ETH
    sweepThresholdAtomic: '50000000000000000',
    isEnabled: true
  }
];
