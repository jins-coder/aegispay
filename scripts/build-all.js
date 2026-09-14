import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function run(command, cwd = ROOT_DIR, label = '') {
  console.log(`\n\x1b[36m>>> [AegisPay Pure Rust Build] ${label} (${command})\x1b[0m`);
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
  console.log('   🛡️  AegisPay 100% Pure Rust + WASM Build Pipeline');
  console.log('===============================================================\x1b[0m\n');

  const start = Date.now();

  // 1. Compile WASM Targets
  run('cargo build --release --target wasm32-unknown-unknown -p customer-portal-rs -p operations-console-rs', ROOT_DIR, '1/3 Compiling Frontend WASM Modules (urust)');

  // 2. Generate WebAssembly Bindings via wasm-bindgen
  const portalOut = path.join(ROOT_DIR, 'dist_wasm', 'customer-portal');
  const opsOut = path.join(ROOT_DIR, 'dist_wasm', 'operations-console');
  fs.mkdirSync(portalOut, { recursive: true });
  fs.mkdirSync(opsOut, { recursive: true });

  run(`wasm-bindgen --target web --out-dir dist_wasm/customer-portal target/wasm32-unknown-unknown/release/customer_portal_rs.wasm`, ROOT_DIR, '2/3 Generating Customer Portal WASM Bindings');
  run(`wasm-bindgen --target web --out-dir dist_wasm/operations-console target/wasm32-unknown-unknown/release/operations_console_rs.wasm`, ROOT_DIR, '2/3 Generating Operations Console WASM Bindings');

  // Write HTML wrappers
  fs.writeFileSync(path.join(portalOut, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AegisPay | Customer Portal (Pure Rust WASM)</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
</head>
<body>
  <script type="module">
    import init from './customer_portal_rs.js';
    init();
  </script>
</body>
</html>`);

  fs.writeFileSync(path.join(opsOut, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AegisPay | Operations Console (Pure Rust WASM)</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
</head>
<body>
  <script type="module">
    import init from './operations_console_rs.js';
    init();
  </script>
</body>
</html>`);

  // 3. Compile Standalone Rust Binary with Embedded WASM UIs
  run('cargo build --release --manifest-path crates/aegispay-server/Cargo.toml', ROOT_DIR, '3/3 Compiling Standalone Rust Binary (Axum + Tokio + Embedded WASM)');

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  const binaryPath = path.join(ROOT_DIR, 'target', 'release', process.platform === 'win32' ? 'aegispay-server.exe' : 'aegispay-server');

  console.log('\n\x1b[32m===============================================================');
  console.log(`   ✅ 100% Pure Rust Standalone Build Completed in ${duration}s!`);
  console.log('===============================================================\x1b[0m');
  console.log(`\n📦 Standalone Executable: \x1b[33m${binaryPath}\x1b[0m`);
  console.log(`   • Port 3000: Customer Portal (Pure Rust WASM) + Public Ledger APIs`);
  console.log(`   • Port 3001: Operations Console (Pure Rust WASM) + Admin Security APIs`);
  console.log(`\n🚀 To run standalone:`);
  console.log(`   \x1b[36mnpm start\x1b[0m  or  \x1b[36m${binaryPath}\x1b[0m\n`);
}

buildAll();
