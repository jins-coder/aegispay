import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  EvmRangeScanner,
  EvmRpcProvider,
  EvmRawLog,
  EvmTransactionReceipt,
  ERC20_TRANSFER_EVENT_TOPIC
} from '../evm-scanner.js';
import { DepositPipeline } from '../deposit-pipeline.js';
import { LedgerEngine, INITIAL_NETWORKS, INITIAL_ASSET_NETWORKS } from '@aegispay/core-ledger';
import { DepositAddressRecord } from '@aegispay/address-service';

class MockEvmRpcProvider implements EvmRpcProvider {
  constructor(
    public chainId: string = '11155111',
    public blockNumber: bigint = 6000000n,
    public logsToReturn: EvmRawLog[] = [],
    public receiptStatus: '0x1' | '0x0' = '0x1'
  ) {}

  async getChainId(): Promise<string> {
    return this.chainId;
  }

  async getBlockNumber(): Promise<bigint> {
    return this.blockNumber;
  }

  async getLogs(): Promise<EvmRawLog[]> {
    return this.logsToReturn;
  }

  async getTransactionReceipt(txHash: string): Promise<EvmTransactionReceipt | null> {
    return {
      transactionHash: txHash,
      status: this.receiptStatus,
      blockNumber: '0x5b8d80',
      blockHash: '0x3c9f28d8b8e01892182012984920849204892048209482094820948209482094',
      logs: []
    };
  }
}

describe('EVM Range Scanner & Deposit Pipeline Tests (Phase 2)', () => {
  const network = INITIAL_NETWORKS.find((n) => n.id === 'ethereum-sepolia')!;
  const userAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'.toLowerCase();
  const allowlistedUsdcContract = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'.toLowerCase();

  let ledger: LedgerEngine;
  let activeAddresses: Map<string, DepositAddressRecord>;
  let pipeline: DepositPipeline;

  beforeEach(() => {
    ledger = new LedgerEngine();
    activeAddresses = new Map();

    activeAddresses.set(`ethereum-sepolia:${userAddress}`, {
      id: 'addr_usr_evm_1_sepolia',
      userId: 'usr_evm_1',
      networkId: 'ethereum-sepolia',
      address: userAddress,
      normalizedAddress: userAddress,
      derivationIndex: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    });

    pipeline = new DepositPipeline(ledger, INITIAL_ASSET_NETWORKS, activeAddresses);
  });

  it('should assert startup chain-id and reject mismatching RPC node', async () => {
    const badProvider = new MockEvmRpcProvider('1'); // Mainnet chain ID 1 instead of Sepolia 11155111
    const scanner = new EvmRangeScanner(network, INITIAL_ASSET_NETWORKS, badProvider);

    await assert.rejects(
      async () => {
        await scanner.initialize();
      },
      /CRITICAL: Chain ID mismatch/
    );
  });

  it('should scan range, decode ERC-20 transfer logs, and credit user Funding balance', async () => {
    const rawLogs: EvmRawLog[] = [
      {
        address: allowlistedUsdcContract,
        topics: [
          ERC20_TRANSFER_EVENT_TOPIC,
          '0x0000000000000000000000001111111111111111111111111111111111111111',
          `0x000000000000000000000000${userAddress.slice(2)}`,
        ],
        data: '0x0000000000000000000000000000000000000000000000000000000000989680', // 10,000,000 atomic = 10.000000 USDC
        blockNumber: '0x5b8d80',
        transactionHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        transactionIndex: '0x1',
        blockHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        logIndex: '0x0'
      }
    ];

    const provider = new MockEvmRpcProvider('11155111', 6000000n, rawLogs);
    const scanner = new EvmRangeScanner(network, INITIAL_ASSET_NETWORKS, provider);

    const { transfers, nextCursor } = await scanner.scanRange(5999900n, 6000000n, {
      networkId: 'ethereum-sepolia',
      lastScannedBlock: 5999900n,
      finalizedBlock: 5999988n
    });

    assert.equal(transfers.length, 1);
    assert.equal(transfers[0].amountAtomic, '10000000');
    assert.equal(transfers[0].toAddress, userAddress);
    assert.equal(nextCursor.lastScannedBlock, 6000000n);

    // Process candidate transfer in deposit pipeline
    const result = await pipeline.processTransfer(transfers[0]);
    assert.equal(result.credited, true);

    const balance = ledger.getUserBalance('usr_evm_1', 'usdc');
    assert.equal(balance.fundingAtomic, '10000000');
    assert.equal(balance.tradingAtomic, '0');
  });

  it('should guarantee 100-event replay idempotency: delivering same event 100 times credits exactly once', async () => {
    const transfer = {
      eventId: 'ethereum-sepolia:0xreplaytx:0',
      networkId: 'ethereum-sepolia',
      assetNetworkId: 'usdc-eth-sepolia',
      txHash: '0xreplaytx',
      blockHash: '0xblock1',
      blockHeight: '6000000',
      eventIndex: '0',
      fromAddress: '0x1111111111111111111111111111111111111111',
      toAddress: userAddress,
      amountAtomic: '10000000',
      executionSucceeded: true,
      finality: { status: 'finalized' as const, confirmations: 12 },
      observedAt: new Date().toISOString(),
      rawReferenceHash: 'ref_replay'
    };

    for (let i = 0; i < 100; i++) {
      await pipeline.processTransfer(transfer);
    }

    const balance = ledger.getUserBalance('usr_evm_1', 'usdc');
    assert.equal(balance.fundingAtomic, '10000000'); // Exactly one 10.000000 credit!
  });

  it('should ignore reverted/failed transactions (status === 0) and never credit', async () => {
    const rawLogs: EvmRawLog[] = [
      {
        address: allowlistedUsdcContract,
        topics: [
          ERC20_TRANSFER_EVENT_TOPIC,
          '0x0000000000000000000000001111111111111111111111111111111111111111',
          `0x000000000000000000000000${userAddress.slice(2)}`,
        ],
        data: '0x0000000000000000000000000000000000000000000000000000000000989680',
        blockNumber: '0x5b8d80',
        transactionHash: '0xrevertedtx',
        transactionIndex: '0x1',
        blockHash: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        logIndex: '0x0'
      }
    ];

    const failedProvider = new MockEvmRpcProvider('11155111', 6000000n, rawLogs, '0x0'); // status 0x0
    const scanner = new EvmRangeScanner(network, INITIAL_ASSET_NETWORKS, failedProvider);

    const { transfers } = await scanner.scanRange(5999900n, 6000000n, {
      networkId: 'ethereum-sepolia',
      lastScannedBlock: 5999900n,
      finalizedBlock: 5999988n
    });

    assert.equal(transfers.length, 0); // Ignored
    const balance = ledger.getUserBalance('usr_evm_1', 'usdc');
    assert.equal(balance.fundingAtomic, '0');
  });

  it('should reject unallowlisted fake token contract even if sent to user address', async () => {
    const fakeContractTransfer = {
      eventId: 'ethereum-sepolia:0xfaketx:0',
      networkId: 'ethereum-sepolia',
      assetNetworkId: 'fake-usdc-contract',
      txHash: '0xfaketx',
      blockHash: '0xblock1',
      blockHeight: '6000000',
      eventIndex: '0',
      fromAddress: '0x1111111111111111111111111111111111111111',
      toAddress: userAddress,
      amountAtomic: '10000000',
      executionSucceeded: true,
      finality: { status: 'finalized' as const, confirmations: 12 },
      observedAt: new Date().toISOString(),
      rawReferenceHash: 'ref_fake'
    };

    const result = await pipeline.processTransfer(fakeContractTransfer);
    assert.equal(result.credited, false);
    assert.equal(result.exception?.reason, 'UNALLOWLISTED_CONTRACT');

    const balance = ledger.getUserBalance('usr_evm_1', 'usdc');
    assert.equal(balance.fundingAtomic, '0');
  });
});
