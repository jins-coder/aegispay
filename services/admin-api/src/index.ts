import { createAdminApiServer } from './app.js';

const ADMIN_PORT = parseInt(process.env.ADMIN_PORT || '3001', 10);
const { server } = createAdminApiServer();

if (process.env.NODE_ENV !== 'test') {
  server.listen(ADMIN_PORT, () => {
    console.log(`[AegisPay Admin API] Listening on http://localhost:${ADMIN_PORT}`);
  });
}

export * from './app.js';
