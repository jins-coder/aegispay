import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function run(command, cwd = ROOT_DIR, label = '') {
  console.log(`\n\x1b[36m>>> [AegisPay Build] ${label} (${command})\x1b[0m`);
  const result = spawnSync(command, {
    cwd,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  if (result.status !== 0) {
    console.error(`\x1b[31m❌ Failed at step: ${label}\x1b[0m`);
    process.exit(result.status || 1);
  }
}

async function buildAll() {
  console.log('\x1b[32m===============================================================');
  console.log('   🛡️  AegisPay Unified Standalone Binary Build Pipeline');
  console.log('===============================================================\x1b[0m\n');

  const start = Date.now();

  // 1. Build uReact Framework Library
  run('npm run build', path.join(ROOT_DIR, 'packages', 'ureact'), '1/4 Building @aegispay/ureact Framework');

  // 2. Build Customer Portal UI
  run('npm run build', path.join(ROOT_DIR, 'apps', 'customer-portal'), '2/4 Building Customer Portal UI');

  // 3. Build Operations Console UI
  run('npm run build', path.join(ROOT_DIR, 'apps', 'operations-console'), '3/4 Building Operations Console UI');

  // 4. Compile Standalone Rust Binary with Embedded UIs (Axum + Tokio)
  run('cargo build --release --manifest-path crates/aegispay-server/Cargo.toml', ROOT_DIR, '4/4 Compiling Standalone Rust Binary (Axum + Tokio)');

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  const binaryPath = path.join(ROOT_DIR, 'target', 'release', process.platform === 'win32' ? 'aegispay-server.exe' : 'aegispay-server');

  console.log('\n\x1b[32m===============================================================');
  console.log(`   ✅ Standalone Build Completed in ${duration}s!`);
  console.log('===============================================================\x1b[0m');
  console.log(`\n📦 Standalone Executable: \x1b[33m${binaryPath}\x1b[0m`);
  console.log(`   • Port 3000: Customer Portal UI + Public Ledger APIs`);
  console.log(`   • Port 3001: Operations Console UI + Admin Security APIs`);
  console.log(`\n🚀 To run standalone:`);
  console.log(`   \x1b[36mnpm run start:standalone\x1b[0m  or  \x1b[36m${binaryPath}\x1b[0m\n`);
}

buildAll();
