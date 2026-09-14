import { AssetId, AtomicAmount, isPositiveAtomic } from '@aegispay/chain-sdk';

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  direction: 'DEBIT' | 'CREDIT';
  amountAtomic: AtomicAmount;
  assetId: AssetId;
}

export interface LedgerTransaction {
  id: string;
  description: string;
  referenceType: 'DEPOSIT' | 'INTERNAL_TRANSFER' | 'SWEEP' | 'WITHDRAWAL';
  referenceId: string;
  idempotencyKey: string;
  createdAt: string;
  entries: LedgerEntry[];
}

export interface BalanceHold {
  id: string;
  userId: string;
  assetId: AssetId;
  accountId: string;
  amountAtomic: AtomicAmount;
  reason: string;
  status: 'ACTIVE' | 'RELEASED' | 'SETTLED';
  createdAt: string;
}

export interface OutboxEvent {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  status: 'PENDING' | 'PUBLISHED';
  createdAt: string;
}

export interface UserBalanceSummary {
  userId: string;
  assetId: AssetId;
  fundingAtomic: AtomicAmount;
  tradingAtomic: AtomicAmount;
  lockedAtomic: AtomicAmount;
}

export class LedgerEngine {
  private transactions: Map<string, LedgerTransaction> = new Map();
  private entries: LedgerEntry[] = [];
  private idempotencyKeys: Map<string, LedgerTransaction> = new Map();
  private holds: Map<string, BalanceHold> = new Map();
  private outbox: OutboxEvent[] = [];

  /**
   * Posts an immutable double-entry journal transaction.
   * Strictly verifies:
   * 1. Idempotency (returns existing tx if key was already posted)
   * 2. Every entry amount is positive
   * 3. For each asset, sum(DEBIT) === sum(CREDIT)
   */
  async postTransaction(params: {
    id: string;
    description: string;
    referenceType: 'DEPOSIT' | 'INTERNAL_TRANSFER' | 'SWEEP' | 'WITHDRAWAL';
    referenceId: string;
    idempotencyKey: string;
    entries: Array<{
      id: string;
      accountId: string;
      direction: 'DEBIT' | 'CREDIT';
      amountAtomic: AtomicAmount;
      assetId: AssetId;
    }>;
  }): Promise<LedgerTransaction> {
    // 1. Idempotency check
    if (this.idempotencyKeys.has(params.idempotencyKey)) {
      return this.idempotencyKeys.get(params.idempotencyKey)!;
    }

    if (params.entries.length < 2) {
      throw new Error('A balanced journal must contain at least 2 entries');
    }

    // 2. Validate amounts and calculate balance per asset
    const balancePerAsset = new Map<AssetId, { debits: bigint; credits: bigint }>();

    for (const entry of params.entries) {
      if (!isPositiveAtomic(entry.amountAtomic)) {
        throw new Error(`Invalid non-positive atomic amount: ${entry.amountAtomic}`);
      }

      const val = BigInt(entry.amountAtomic);
      const current = balancePerAsset.get(entry.assetId) || { debits: 0n, credits: 0n };

      if (entry.direction === 'DEBIT') {
        current.debits += val;
      } else {
        current.credits += val;
      }
      balancePerAsset.set(entry.assetId, current);
    }

    // 3. Verify debits == credits for each asset
    for (const [assetId, balance] of balancePerAsset.entries()) {
      if (balance.debits !== balance.credits) {
        throw new Error(
          `Unbalanced journal for asset ${assetId}: Debits (${balance.debits}) != Credits (${balance.credits})`
        );
      }
    }

    // 4. Create and persist immutable transaction & entries
    const ledgerTx: LedgerTransaction = {
      id: params.id,
      description: params.description,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      idempotencyKey: params.idempotencyKey,
      createdAt: new Date().toISOString(),
      entries: params.entries.map((e) => ({
        ...e,
        transactionId: params.id
      }))
    };

    this.transactions.set(ledgerTx.id, ledgerTx);
    this.entries.push(...ledgerTx.entries);
    this.idempotencyKeys.set(params.idempotencyKey, ledgerTx);

    return ledgerTx;
  }

  /**
   * Calculates the exact balances for a user and asset.
   * In standard accounting liability accounts:
   * Net Balance = Sum(CREDITS) - Sum(DEBITS)
   */
  getUserBalance(userId: string, assetId: AssetId): UserBalanceSummary {
    const fundingAccount = `liability:user:${userId}:funding:${assetId}`;
    const tradingAccount = `liability:user:${userId}:trading:${assetId}`;

    let fundingNet = 0n;
    let tradingNet = 0n;

    for (const entry of this.entries) {
      if (entry.assetId !== assetId) continue;
      const amt = BigInt(entry.amountAtomic);

      if (entry.accountId === fundingAccount) {
        fundingNet += entry.direction === 'CREDIT' ? amt : -amt;
      } else if (entry.accountId === tradingAccount) {
        tradingNet += entry.direction === 'CREDIT' ? amt : -amt;
      }
    }

    // Calculate active holds
    let lockedNet = 0n;
    for (const hold of this.holds.values()) {
      if (hold.userId === userId && hold.assetId === assetId && hold.status === 'ACTIVE') {
        lockedNet += BigInt(hold.amountAtomic);
      }
    }

    const availableFunding = fundingNet > lockedNet ? fundingNet - lockedNet : 0n;

    return {
      userId,
      assetId,
      fundingAtomic: availableFunding.toString(),
      tradingAtomic: tradingNet.toString(),
      lockedAtomic: lockedNet.toString()
    };
  }

  /**
   * Places a balance hold
   */
  placeHold(hold: BalanceHold): void {
    this.holds.set(hold.id, hold);
  }

  /**
   * Releases a balance hold
   */
  releaseHold(holdId: string): void {
    const hold = this.holds.get(holdId);
    if (hold) {
      hold.status = 'RELEASED';
    }
  }

  /**
   * Emits an outbox event
   */
  emitOutboxEvent(event: OutboxEvent): void {
    this.outbox.push(event);
  }

  getOutboxEvents(): OutboxEvent[] {
    return [...this.outbox];
  }

  getAllTransactions(): LedgerTransaction[] {
    return Array.from(this.transactions.values());
  }
}
