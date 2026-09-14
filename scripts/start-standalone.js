import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const binaryName = process.platform === 'win32' ? 'aegispay-server.exe' : 'aegispay-server';

// Check release binary first, then debug binary
const releasePath = path.join(ROOT_DIR, 'target', 'release', binaryName);
const debugPath = path.join(ROOT_DIR, 'target', 'debug', binaryName);

const execPath = fs.existsSync(releasePath) ? releasePath : fs.existsSync(debugPath) ? debugPath : null;

if (!execPath) {
  console.error(`\x1b[31m❌ Standalone binary not found!\x1b[0m`);
  console.error(`Please run \x1b[36mnpm run build:all\x1b[0m first to build the full standalone application.`);
  process.exit(1);
}

console.log(`\x1b[32m🛡️  Launching Standalone AegisPay Binary:\x1b[0m \x1b[33m${execPath}\x1b[0m`);
console.log(`\x1b[36m• Customer Portal UI & Public API:     http://localhost:3000\x1b[0m`);
console.log(`\x1b[36m• Operations Console UI & Admin API:   http://localhost:3001\x1b[0m\n`);

const child = spawn(execPath, [], {
  cwd: ROOT_DIR,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
