import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createAdminApiServer } from '../app.js';

describe('Admin API Integration Tests', () => {
  const { server } = createAdminApiServer();
  let baseUrl = '';

  before((_, done) => {
    server.listen(0, () => {
      const addr = server.address();
      if (typeof addr === 'object' && addr !== null) {
        baseUrl = `http://localhost:${addr.port}`;
      }
      done();
    });
  });

  after((_, done) => {
    server.close(done);
  });

  it('should return operations overview with safety flags assertively false', async () => {
    const res = await fetch(`${baseUrl}/v1/admin/overview`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.mainnetEnabled, false);
    assert.equal(json.withdrawalsEnabled, false);
    assert.equal(json.solvencyStatus, 'HEALTHY');
  });

  it('should toggle emergency network pause and generate audit event', async () => {
    const pauseRes = await fetch(`${baseUrl}/v1/admin/networks/tron-nile/pause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Security anomaly detected in scanner' })
    });
    assert.equal(pauseRes.status, 200);
    const pauseJson = await pauseRes.json();
    assert.equal(pauseJson.network.isPaused, true);

    // Verify audit log has the event
    const auditRes = await fetch(`${baseUrl}/v1/admin/audit-events`);
    const auditEvents = await auditRes.json();
    assert.equal(auditEvents.length > 0, true);
    assert.equal(auditEvents[0].action, 'NETWORK_PAUSED');
  });
});
