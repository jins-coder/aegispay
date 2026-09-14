import {
  NetworkManifest,
  AssetNetworkManifest,
  NormalizedTransfer,
  ChainCursor,
  normalizeEvmAddress
} from '@aegispay/chain-sdk';

export interface EvmRawLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  logIndex: string;
  removed?: boolean;
}

export interface EvmTransactionReceipt {
  transactionHash: string;
  status: '0x1' | '0x0' | 1 | 0;
  blockNumber: string;
  blockHash: string;
  logs: EvmRawLog[];
}

export interface EvmRpcProvider {
  getChainId(): Promise<string>;
  getBlockNumber(): Promise<bigint>;
  getLogs(filter: {
    fromBlock: string;
    toBlock: string;
    address?: string | string[];
    topics?: (string | string[] | null)[];
  }): Promise<EvmRawLog[]>;
  getTransactionReceipt(txHash: string): Promise<EvmTransactionReceipt | null>;
}

// ERC-20 Transfer(address,address,uint256) topic 0
export const ERC20_TRANSFER_EVENT_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export class EvmRangeScanner {
  private isInitialized = false;

  constructor(
    public readonly network: NetworkManifest,
    public readonly assetNetworks: AssetNetworkManifest[],
    public readonly provider: EvmRpcProvider
  ) {}

  /**
   * Asserts startup chain identity. Disables scanner if provider chain ID does not match.
   */
  async initialize(): Promise<void> {
    const remoteChainId = await this.provider.getChainId();
    // Normalize hex or decimal string
    const normalizedRemote = remoteChainId.startsWith('0x')
      ? parseInt(remoteChainId, 16).toString()
      : remoteChainId;

    if (normalizedRemote !== this.network.chainId) {
      throw new Error(
        `CRITICAL: Chain ID mismatch for network ${this.network.id}. Expected ${this.network.chainId}, got ${normalizedRemote}`
      );
    }
    this.isInitialized = true;
  }

  /**
   * Scans a specified block range for allowlisted ERC-20 transfers.
   */
  async scanRange(
    fromBlock: bigint,
    toBlock: bigint,
    cursor: ChainCursor
  ): Promise<{ transfers: NormalizedTransfer[]; nextCursor: ChainCursor }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const allowlistedContracts = this.assetNetworks
      .filter((a) => a.networkId === this.network.id && a.type === 'erc20' && a.contractAddress)
      .map((a) => normalizeEvmAddress(a.contractAddress!));

    if (allowlistedContracts.length === 0) {
      return {
        transfers: [],
        nextCursor: {
          ...cursor,
          lastScannedBlock: toBlock
        }
      };
    }

    const logs = await this.provider.getLogs({
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: `0x${toBlock.toString(16)}`,
      address: allowlistedContracts,
      topics: [ERC20_TRANSFER_EVENT_TOPIC]
    });

    const normalizedTransfers: NormalizedTransfer[] = [];

    for (const log of logs) {
      if (log.removed) continue;

      const contractAddr = normalizeEvmAddress(log.address);
      const assetNet = this.assetNetworks.find(
        (a) => a.networkId === this.network.id && a.contractAddress && normalizeEvmAddress(a.contractAddress) === contractAddr
      );

      if (!assetNet) continue; // Unallowlisted contract

      if (log.topics.length < 3) continue; // Invalid ERC-20 Transfer log structure

      // Extract to address from topic 2 (last 20 bytes of 32-byte hex)
      const toHex = `0x${log.topics[2].slice(26)}`;
      const fromHex = `0x${log.topics[1].slice(26)}`;
      const normalizedTo = normalizeEvmAddress(toHex);
      const normalizedFrom = normalizeEvmAddress(fromHex);

      // Value from data
      const amountAtomic = BigInt(log.data === '0x' ? '0' : log.data).toString();

      // Check receipt status
      const receipt = await this.provider.getTransactionReceipt(log.transactionHash);
      if (!receipt || receipt.status === '0x0' || receipt.status === 0) {
        // Contract execution reverted or failed
        continue;
      }

      const blockHeight = BigInt(log.blockNumber).toString();
      const eventIndex = parseInt(log.logIndex.startsWith('0x') ? log.logIndex : `0x${log.logIndex}`, 16).toString();

      normalizedTransfers.push({
        eventId: `${this.network.id}:${log.transactionHash}:${eventIndex}`,
        networkId: this.network.id,
        assetNetworkId: assetNet.id,
        txHash: log.transactionHash,
        blockHash: log.blockHash,
        blockHeight,
        eventIndex,
        fromAddress: normalizedFrom,
        toAddress: normalizedTo,
        amountAtomic,
        executionSucceeded: true,
        finality: {
          status: 'finalized',
          confirmations: this.network.confirmationDepth
        },
        observedAt: new Date().toISOString(),
        rawReferenceHash: `ref_${log.transactionHash}_${eventIndex}`
      });
    }

    return {
      transfers: normalizedTransfers,
      nextCursor: {
        ...cursor,
        lastScannedBlock: toBlock
      }
    };
  }
}
