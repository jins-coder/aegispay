import { createPublicApiServer } from './app.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const { server } = createPublicApiServer();

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[AegisPay Public API] Listening on http://localhost:${PORT}`);
  });
}

export * from './app.js';
