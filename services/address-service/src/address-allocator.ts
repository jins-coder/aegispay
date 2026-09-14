import {
  NetworkId,
  NetworkManifest,
  DerivedAddress,
  ChainAdapter
} from '@aegispay/chain-sdk';
import { EvmChainAdapter } from '@aegispay/adapter-evm';
import { TronChainAdapter } from '@aegispay/adapter-tron';

export interface DepositAddressRecord {
  id: string;
  userId: string;
  networkId: NetworkId;
  address: string;
  normalizedAddress: string;
  derivationIndex: number;
  isActive: boolean;
  createdAt: string;
}

export class AddressAllocator {
  private derivationCounters: Map<NetworkId, number> = new Map();
  private userAddresses: Map<string, DepositAddressRecord> = new Map(); // key: `${userId}:${networkId}`
  private assignedAddresses: Set<string> = new Set(); // key: `${networkId}:${normalizedAddress}`
  private adapters: Map<NetworkId, ChainAdapter> = new Map();

  constructor(networks: NetworkManifest[]) {
    for (const net of networks) {
      if (net.family === 'evm') {
        this.adapters.set(net.id, new EvmChainAdapter(net));
      } else if (net.family === 'tron') {
        this.adapters.set(net.id, new TronChainAdapter(net));
      }
      this.derivationCounters.set(net.id, 1);
    }
  }

  /**
   * Ensures that a user has an allocated deposit address on the requested network.
   * If already allocated, returns the existing record (Idempotent).
   * Otherwise, atomically increments the derivation counter and generates a new address.
   */
  async ensureAddress(userId: string, networkId: NetworkId): Promise<DepositAddressRecord> {
    const key = `${userId}:${networkId}`;
    if (this.userAddresses.has(key)) {
      return this.userAddresses.get(key)!;
    }

    const adapter = this.adapters.get(networkId);
    if (!adapter) {
      throw new Error(`Unsupported network for address allocation: ${networkId}`);
    }

    // Atomic monotonic index allocation
    const currentIndex = this.derivationCounters.get(networkId) || 1;
    this.derivationCounters.set(networkId, currentIndex + 1);

    const derived: DerivedAddress = await adapter.deriveWatchAddress({
      networkId,
      derivationIndex: currentIndex
    });

    const addressUniquenessKey = `${networkId}:${derived.normalizedAddress}`;
    if (this.assignedAddresses.has(addressUniquenessKey)) {
      throw new Error(`Address collision detected for ${derived.normalizedAddress} on network ${networkId}`);
    }

    const record: DepositAddressRecord = {
      id: `addr_${userId}_${networkId}`,
      userId,
      networkId,
      address: derived.address,
      normalizedAddress: derived.normalizedAddress,
      derivationIndex: derived.derivationIndex,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    this.userAddresses.set(key, record);
    this.assignedAddresses.add(addressUniquenessKey);

    return record;
  }

  getUserAddresses(userId: string): DepositAddressRecord[] {
    const records: DepositAddressRecord[] = [];
    for (const record of this.userAddresses.values()) {
      if (record.userId === userId) {
        records.push(record);
      }
    }
    return records;
  }
}
