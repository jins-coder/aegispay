import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=================================================================');
console.log('               🚀 LAUNCHING AEGISPAY FULL-STACK                 ');
console.log('=================================================================');
console.log('• Public API:          http://localhost:3000');
console.log('• Admin API:           http://localhost:3001');
console.log('• Customer Portal UI:  http://localhost:4000');
console.log('• Operations Console:  http://localhost:4001');
console.log('=================================================================\n');

const services = [
  { name: 'Public API', cmd: 'node', args: ['services/public-api/dist/index.js'], env: { PORT: '3000' } },
  { name: 'Admin API', cmd: 'node', args: ['services/admin-api/dist/index.js'], env: { ADMIN_PORT: '3001' } },
  { name: 'Customer Portal', cmd: 'node', args: ['apps/customer-portal/server.js'], env: { PORT: '4000' } },
  { name: 'Operations Console', cmd: 'node', args: ['apps/operations-console/server.js'], env: { ADMIN_PORT: '4001' } }
];

for (const s of services) {
  const child = spawn(s.cmd, s.args, {
    cwd: rootDir,
    env: { ...process.env, ...s.env },
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
    console.error(`[${s.name}] Error:`, err);
  });
}
