import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=================================================================');
console.log('         🚀 LAUNCHING AEGISPAY FULL-STACK (uReact + Node.js)     ');
console.log('=================================================================');
console.log('• Public API:          http://localhost:3000');
console.log('• Admin API:           http://localhost:3001');
console.log('• Customer Portal UI:  http://localhost:4000  (uReact + React 19)');
console.log('• Operations Console:  http://localhost:4001  (uReact + React 19)');
console.log('=================================================================\n');

const services = [
  { name: 'Public API', cmd: 'node', args: ['services/public-api/dist/index.js'], cwd: rootDir, env: { PORT: '3000' } },
  { name: 'Admin API', cmd: 'node', args: ['services/admin-api/dist/index.js'], cwd: rootDir, env: { ADMIN_PORT: '3001' } },
  { name: 'Customer Portal (uReact)', cmd: 'npx', args: ['vite', '--port', '4000', '--host'], cwd: path.resolve(rootDir, 'apps/customer-portal'), env: {} },
  { name: 'Operations Console (uReact)', cmd: 'npx', args: ['vite', '--port', '4001', '--host'], cwd: path.resolve(rootDir, 'apps/operations-console'), env: {} }
];

for (const s of services) {
  const child = spawn(s.cmd, s.args, {
    cwd: s.cwd || rootDir,
    env: { ...process.env, ...s.env },
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
    console.error(`[${s.name}] Error:`, err);
  });
}
