import http from 'node:http';
import {
  LedgerEngine,
  INITIAL_NETWORKS,
  INITIAL_ASSET_NETWORKS
} from '@aegispay/core-ledger';
import { AddressAllocator } from '@aegispay/address-service';
import {
  decimalToAtomic,
  atomicToDecimal,
  isPositiveAtomic
} from '@aegispay/chain-sdk';

export function createPublicApiServer(options?: {
  ledger?: LedgerEngine;
  allocator?: AddressAllocator;
}) {
  const ledger = options?.ledger || new LedgerEngine();
  const allocator = options?.allocator || new AddressAllocator(INITIAL_NETWORKS);

  // In-memory demo/active users store
  const users = new Map<string, { id: string; email: string; kycLevel: string; sanctionsStatus: string }>();
  users.set('usr_demo_01', {
    id: 'usr_demo_01',
    email: 'trader@aegispay.internal',
    kycLevel: 'TIER_2_VERIFIED',
    sanctionsStatus: 'CLEARED'
  });

  // Active deposits store
  const deposits = new Map<string, any>();

  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Idempotency-Key, x-user-id');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const userId = (req.headers['x-user-id'] as string) || 'usr_demo_01';

    const sendJson = (statusCode: number, data: unknown) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    const readBody = async (): Promise<any> => {
      return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (err) {
            reject(err);
          }
        });
      });
    };

    try {
      // 0. GET / (Service Info)
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
        return sendJson(200, {
          service: 'AegisPay Public API Gateway',
          version: 'v1',
          status: 'HEALTHY',
          environment: 'testnet',
          mainnetEnabled: false,
          endpoints: [
            '/v1/account',
            '/v1/networks',
            '/v1/asset-networks',
            '/v1/deposit-addresses/ensure',
            '/v1/deposit-addresses',
            '/v1/balances',
            '/v1/internal-transfers',
            '/v1/deposits',
            '/v1/transactions'
          ],
          customerPortalUrl: 'http://localhost:4000',
          operationsConsoleUrl: 'http://localhost:4001'
        });
      }

      // 1. GET /v1/account
      if (req.method === 'GET' && url.pathname === '/v1/account') {
        const user = users.get(userId) || {
          id: userId,
          email: `${userId}@aegispay.internal`,
          kycLevel: 'TIER_1',
          sanctionsStatus: 'CLEARED'
        };
        return sendJson(200, user);
      }

      // 2. GET /v1/networks
      if (req.method === 'GET' && url.pathname === '/v1/networks') {
        return sendJson(200, INITIAL_NETWORKS);
      }

      // 3. GET /v1/asset-networks
      if (req.method === 'GET' && url.pathname === '/v1/asset-networks') {
        return sendJson(200, INITIAL_ASSET_NETWORKS);
      }

      // 4. POST /v1/deposit-addresses/ensure
      if (req.method === 'POST' && url.pathname === '/v1/deposit-addresses/ensure') {
        const body = await readBody();
        const networkId = body.networkId || 'tron-nile';
        const addressRecord = await allocator.ensureAddress(userId, networkId);
        return sendJson(200, addressRecord);
      }

      // 5. GET /v1/deposit-addresses
      if (req.method === 'GET' && url.pathname === '/v1/deposit-addresses') {
        const addresses = allocator.getUserAddresses(userId);
        return sendJson(200, addresses);
      }

      // 6. GET /v1/balances
      if (req.method === 'GET' && url.pathname === '/v1/balances') {
        const assets = [
          { id: 'usdt', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
          { id: 'usdc', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
          { id: 'trx', symbol: 'TRX', name: 'TRON', decimals: 6 },
          { id: 'eth', symbol: 'ETH', name: 'Ethereum', decimals: 18 }
        ];

        const balances = assets.map((asset) => {
          const bal = ledger.getUserBalance(userId, asset.id);
          return {
            assetId: asset.id,
            symbol: asset.symbol,
            name: asset.name,
            decimals: asset.decimals,
            fundingAtomic: bal.fundingAtomic,
            tradingAtomic: bal.tradingAtomic,
            lockedAtomic: bal.lockedAtomic,
            fundingDecimal: atomicToDecimal(bal.fundingAtomic, asset.decimals),
            tradingDecimal: atomicToDecimal(bal.tradingAtomic, asset.decimals),
            lockedDecimal: atomicToDecimal(bal.lockedAtomic, asset.decimals)
          };
        });

        return sendJson(200, balances);
      }

      // 7. POST /v1/internal-transfers
      if (req.method === 'POST' && url.pathname === '/v1/internal-transfers') {
        const body = await readBody();
        const { fromAccountType, toAccountType, assetId, amountDecimal, idempotencyKey } = body;

        if (!fromAccountType || !toAccountType || !assetId || !amountDecimal) {
          return sendJson(400, { error: 'Missing required parameters' });
        }

        const decimals = assetId === 'eth' ? 18 : 6;
        const amountAtomic = decimalToAtomic(amountDecimal, decimals);

        if (!isPositiveAtomic(amountAtomic)) {
          return sendJson(400, { error: 'Transfer amount must be positive' });
        }

        const fromAccount = `liability:user:${userId}:${fromAccountType.toLowerCase()}:${assetId}`;
        const toAccount = `liability:user:${userId}:${toAccountType.toLowerCase()}:${assetId}`;

        const tx = await ledger.postTransaction({
          id: `tx_${Date.now()}`,
          description: `Internal transfer ${amountDecimal} ${assetId.toUpperCase()} from ${fromAccountType} to ${toAccountType}`,
          referenceType: 'INTERNAL_TRANSFER',
          referenceId: `xfer_${Date.now()}`,
          idempotencyKey: idempotencyKey || `idem_${Date.now()}`,
          entries: [
            {
              id: `ent_${Date.now()}_1`,
              accountId: fromAccount,
              direction: 'DEBIT',
              amountAtomic,
              assetId
            },
            {
              id: `ent_${Date.now()}_2`,
              accountId: toAccount,
              direction: 'CREDIT',
              amountAtomic,
              assetId
            }
          ]
        });

        return sendJson(200, { success: true, transactionId: tx.id });
      }

      // 8. GET /v1/deposits
      if (req.method === 'GET' && url.pathname === '/v1/deposits') {
        const list = Array.from(deposits.values()).filter((d) => d.userId === userId);
        return sendJson(200, list);
      }

      // 9. POST /v1/deposits/simulate (For testnet/local acceptance testing)
      if (req.method === 'POST' && url.pathname === '/v1/deposits/simulate') {
        const body = await readBody();
        const { networkId = 'tron-nile', assetId = 'usdt', amountDecimal = '10.000000' } = body;
        const decimals = assetId === 'eth' ? 18 : 6;
        const amountAtomic = decimalToAtomic(amountDecimal, decimals);

        // Credit funding balance in ledger
        const tx = await ledger.postTransaction({
          id: `tx_sim_${Date.now()}`,
          description: `Confirmed testnet deposit ${amountDecimal} ${assetId.toUpperCase()}`,
          referenceType: 'DEPOSIT',
          referenceId: `dep_sim_${Date.now()}`,
          idempotencyKey: `idem_sim_${Date.now()}`,
          entries: [
            {
              id: `ent_sim_1_${Date.now()}`,
              accountId: `asset:onchain:deposit:${networkId}:mock-${assetId}`,
              direction: 'DEBIT',
              amountAtomic,
              assetId
            },
            {
              id: `ent_sim_2_${Date.now()}`,
              accountId: `liability:user:${userId}:funding:${assetId}`,
              direction: 'CREDIT',
              amountAtomic,
              assetId
            }
          ]
        });

        const depositRecord = {
          id: `dep_${Date.now()}`,
          userId,
          networkId,
          networkName: networkId === 'tron-nile' ? 'TRON Nile Testnet' : 'Ethereum Sepolia',
          assetId,
          assetSymbol: assetId.toUpperCase(),
          txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
          amountAtomic,
          amountDecimal,
          status: 'CREDITED',
          confirmations: 20,
          requiredConfirmations: 19,
          observedAt: new Date().toISOString()
        };

        deposits.set(depositRecord.id, depositRecord);
        return sendJson(200, { success: true, deposit: depositRecord, transactionId: tx.id });
      }

      // 10. GET /v1/transactions
      if (req.method === 'GET' && url.pathname === '/v1/transactions') {
        const txs = ledger.getAllTransactions();
        return sendJson(200, txs);
      }

      sendJson(404, { error: 'Endpoint not found' });
    } catch (err: any) {
      sendJson(500, { error: err.message || 'Internal Server Error' });
    }
  });

  return { server, ledger, allocator };
}
