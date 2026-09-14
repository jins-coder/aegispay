import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=================================================================');
console.log('    🚀 LAUNCHING AEGISPAY 100% PURE RUST + WASM STACK          ');
console.log('=================================================================');
console.log('• High-Performance Engine: Rust 1.98 / Axum / Tokio Multi-Threaded');
console.log('• Customer Portal UI:     http://localhost:3000 (Pure Rust WASM)');
console.log('• Operations Console UI:   http://localhost:3001 (Pure Rust WASM)');
console.log('• Public Ledger APIs:      http://localhost:3000/v1/*');
console.log('• Admin Security APIs:     http://localhost:3001/v1/admin/*');
console.log('=================================================================\n');

const child = spawn('cargo', ['run', '-p', 'aegispay-server'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

child.on('error', (err) => {
  console.error('[AegisPay Rust Server] Error:', err);
});
