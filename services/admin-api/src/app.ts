import http from 'node:http';
import { LedgerEngine, INITIAL_NETWORKS } from '@aegispay/core-ledger';

export function createAdminApiServer(options?: { ledger?: LedgerEngine }) {
  const ledger = options?.ledger || new LedgerEngine();
  const networks = [...INITIAL_NETWORKS];
  const auditEvents: any[] = [];

  const addAudit = (action: string, resourceType: string, resourceId: string, actorId = 'admin_sec_01') => {
    auditEvents.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
      actorId,
      actorRole: 'security_admin',
      action,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString()
    });
  };

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-role');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

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
      // 0. GET / (Admin Service Info)
      if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/health')) {
        return sendJson(200, {
          service: 'AegisPay Admin Operations API Gateway',
          version: 'v1',
          status: 'HEALTHY',
          environment: 'testnet',
          mainnetEnabled: false,
          withdrawalsEnabled: false,
          endpoints: [
            '/v1/admin/overview',
            '/v1/admin/networks',
            '/v1/admin/networks/:id/pause',
            '/v1/admin/treasury',
            '/v1/admin/audit-events'
          ],
          operationsConsoleUrl: 'http://localhost:4001',
          customerPortalUrl: 'http://localhost:4000'
        });
      }

      // 1. POST /v1/admin/auth/login
      if (req.method === 'POST' && url.pathname === '/v1/admin/auth/login') {
        const body = await readBody();
        const email = body.email || 'admin@aegispay.internal';
        const adminUser = {
          id: 'admin_sec_01',
          email,
          name: 'Security Ops Admin',
          role: 'SECURITY_OFFICER',
          clearance: 'LEVEL_4_TREASURY'
        };
        addAudit('ADMIN_LOGIN', 'SESSION', 'admin_sec_01', 'admin_sec_01');
        return sendJson(200, {
          token: `jwt_admin_${Buffer.from(JSON.stringify(adminUser)).toString('base64')}`,
          user: adminUser
        });
      }

      // 1b. GET /v1/admin/overview
      if (req.method === 'GET' && url.pathname === '/v1/admin/overview') {
        return sendJson(200, {
          totalUsers: 1420,
          totalDepositsVolumeUsd: '4,850,200.00',
          pendingDepositsCount: 3,
          activeSweepJobsCount: 1,
          scannerLagBlocks: {
            'tron-nile': 0,
            'ethereum-sepolia': 1,
            'bsc-testnet': 0
          },
          solvencyStatus: 'HEALTHY',
          mainnetEnabled: false,
          withdrawalsEnabled: false
        });
      }

      // 2. GET /v1/admin/networks
      if (req.method === 'GET' && url.pathname === '/v1/admin/networks') {
        return sendJson(200, networks);
      }

      // 3. POST /v1/admin/networks/:id/pause
      if (req.method === 'POST' && url.pathname.startsWith('/v1/admin/networks/') && url.pathname.endsWith('/pause')) {
        const parts = url.pathname.split('/');
        const networkId = parts[4];
        const body = await readBody();
        const { reason = 'Emergency pause triggered' } = body;

        const network = networks.find((n) => n.id === networkId);
        if (!network) {
          return sendJson(404, { error: 'Network not found' });
        }

        network.isPaused = !network.isPaused;
        addAudit(network.isPaused ? 'NETWORK_PAUSED' : 'NETWORK_RESUMED', 'NETWORK', networkId);

        return sendJson(200, { success: true, network, reason });
      }

      // 4. GET /v1/admin/audit-events
      if (req.method === 'GET' && url.pathname === '/v1/admin/audit-events') {
        return sendJson(200, auditEvents);
      }

      // 5. GET /v1/admin/treasury
      if (req.method === 'GET' && url.pathname === '/v1/admin/treasury') {
        return sendJson(200, {
          vaultReserves: [
            { asset: 'USDT', location: 'TRON Cold Vault', balanceDecimal: '500,000.000000', address: 'TAUN6FwrnwwmaEqYcckffC7wYmbaS6cBiX' },
            { asset: 'USDC', location: 'ETH Cold Vault', balanceDecimal: '350,000.000000', address: '0x3333333333333333333333333333333333333333' }
          ],
          gasReserves: [
            { network: 'TRON Nile', balanceTrx: '25,400.50 TRX', status: 'SUFFICIENT' },
            { network: 'Sepolia', balanceEth: '4.25 ETH', status: 'SUFFICIENT' }
          ],
          exposureCapUsd: '50,000.00',
          currentDepositExposureUsd: '1,240.00'
        });
      }

      sendJson(404, { error: 'Admin endpoint not found' });
    } catch (err: any) {
      sendJson(500, { error: err.message || 'Internal Server Error' });
    }
  });

  return { server, ledger, networks, auditEvents };
}
