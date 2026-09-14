import {
  NormalizedTransfer,
  AssetNetworkManifest
} from '@aegispay/chain-sdk';
import { LedgerEngine } from '@aegispay/core-ledger';
import { DepositAddressRecord } from '@aegispay/address-service';

export interface DepositRecord {
  id: string;
  userId: string;
  networkId: string;
  assetNetworkId: string;
  assetId: string;
  depositAddressId: string;
  txHash: string;
  eventIndex: string;
  blockNumber: string;
  amountAtomic: string;
  status: 'OBSERVED' | 'CONFIRMING' | 'FINALIZED' | 'CREDITED' | 'HELD' | 'EXCEPTION';
  rawReferenceHash: string;
  createdAt: string;
}

export interface DepositExceptionRecord {
  id: string;
  networkId: string;
  txHash: string;
  reason: 'UNKNOWN_ADDRESS' | 'BELOW_MINIMUM' | 'UNALLOWLISTED_CONTRACT' | 'EXECUTION_FAILED';
  rawTransfer: NormalizedTransfer;
  createdAt: string;
}

export class DepositPipeline {
  private deposits: Map<string, DepositRecord> = new Map(); // key: `${networkId}:${txHash}:${eventIndex}`
  private exceptions: DepositExceptionRecord[] = [];

  constructor(
    private readonly ledger: LedgerEngine,
    private readonly assetNetworks: AssetNetworkManifest[],
    private readonly activeAddresses: Map<string, DepositAddressRecord> // key: `${networkId}:${normalizedAddress}`
  ) {}

  /**
   * Processes a normalized candidate transfer through the deposit state machine.
   * Matches against active deposit addresses, validates policies, and posts balanced credit journals.
   */
  async processTransfer(transfer: NormalizedTransfer): Promise<{
    credited: boolean;
    deposit?: DepositRecord;
    exception?: DepositExceptionRecord;
  }> {
    const depositKey = `${transfer.networkId}:${transfer.txHash}:${transfer.eventIndex}`;

    // 1. Idempotency check
    if (this.deposits.has(depositKey)) {
      return { credited: false, deposit: this.deposits.get(depositKey) };
    }

    // 2. Address matching
    const addressKey = `${transfer.networkId}:${transfer.toAddress}`;
    const userAddrRecord = this.activeAddresses.get(addressKey);

    if (!userAddrRecord) {
      const exception: DepositExceptionRecord = {
        id: `exc_${Date.now()}_${transfer.eventIndex}`,
        networkId: transfer.networkId,
        txHash: transfer.txHash,
        reason: 'UNKNOWN_ADDRESS',
        rawTransfer: transfer,
        createdAt: new Date().toISOString()
      };
      this.exceptions.push(exception);
      return { credited: false, exception };
    }

    // 3. Asset policy validation
    const assetNet = this.assetNetworks.find((a) => a.id === transfer.assetNetworkId);
    if (!assetNet) {
      const exception: DepositExceptionRecord = {
        id: `exc_${Date.now()}_${transfer.eventIndex}`,
        networkId: transfer.networkId,
        txHash: transfer.txHash,
        reason: 'UNALLOWLISTED_CONTRACT',
        rawTransfer: transfer,
        createdAt: new Date().toISOString()
      };
      this.exceptions.push(exception);
      return { credited: false, exception };
    }

    if (BigInt(transfer.amountAtomic) < BigInt(assetNet.minimumDepositAtomic)) {
      const exception: DepositExceptionRecord = {
        id: `exc_${Date.now()}_${transfer.eventIndex}`,
        networkId: transfer.networkId,
        txHash: transfer.txHash,
        reason: 'BELOW_MINIMUM',
        rawTransfer: transfer,
        createdAt: new Date().toISOString()
      };
      this.exceptions.push(exception);
      return { credited: false, exception };
    }

    // 4. Post balanced credit journal to Core Ledger
    const depositId = `dep_${transfer.networkId}_${transfer.txHash.slice(2, 10)}_${transfer.eventIndex}`;
    const tx = await this.ledger.postTransaction({
      id: `tx_dep_${depositId}`,
      description: `Credit finalized ${assetNet.assetId.toUpperCase()} deposit from ${transfer.fromAddress}`,
      referenceType: 'DEPOSIT',
      referenceId: depositId,
      idempotencyKey: `idem_${depositKey}`,
      entries: [
        {
          id: `ent_dep_1_${depositId}`,
          accountId: `asset:onchain:deposit:${transfer.networkId}:${assetNet.id}`,
          direction: 'DEBIT',
          amountAtomic: transfer.amountAtomic,
          assetId: assetNet.assetId
        },
        {
          id: `ent_dep_2_${depositId}`,
          accountId: `liability:user:${userAddrRecord.userId}:funding:${assetNet.assetId}`,
          direction: 'CREDIT',
          amountAtomic: transfer.amountAtomic,
          assetId: assetNet.assetId
        }
      ]
    });

    // 5. Emit Outbox Events
    this.ledger.emitOutboxEvent({
      id: `evt_dep_conf_${Date.now()}`,
      eventType: 'deposit.confirmed.v1',
      aggregateType: 'DEPOSIT',
      aggregateId: depositId,
      payload: {
        depositId,
        userId: userAddrRecord.userId,
        networkId: transfer.networkId,
        assetId: assetNet.assetId,
        amountAtomic: transfer.amountAtomic,
        txHash: transfer.txHash,
        transactionId: tx.id
      },
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    const deposit: DepositRecord = {
      id: depositId,
      userId: userAddrRecord.userId,
      networkId: transfer.networkId,
      assetNetworkId: assetNet.id,
      assetId: assetNet.assetId,
      depositAddressId: userAddrRecord.id,
      txHash: transfer.txHash,
      eventIndex: transfer.eventIndex,
      blockNumber: transfer.blockHeight,
      amountAtomic: transfer.amountAtomic,
      status: 'CREDITED',
      rawReferenceHash: transfer.rawReferenceHash,
      createdAt: new Date().toISOString()
    };

    this.deposits.set(depositKey, deposit);

    return { credited: true, deposit };
  }

  getDepositsForUser(userId: string): DepositRecord[] {
    return Array.from(this.deposits.values()).filter((d) => d.userId === userId);
  }

  getExceptions(): DepositExceptionRecord[] {
    return [...this.exceptions];
  }
}
