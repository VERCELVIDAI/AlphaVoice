#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const electronDir = path.resolve(rootDir, 'electron');

console.log('[build-web] Validating locale integrity...');
const localeResult = spawnSync(
  process.execPath,
  ['tests/locale-encoding.mjs'],
  { cwd: electronDir, stdio: 'inherit', shell: true }
);
if (localeResult.status !== 0) {
  console.warn('[build-web] Locale verification warning, continuing...');
}

console.log('[build-web] Building production web assets with Vite...');

// 1. Try bun first
let res = spawnSync('bun', ['run', 'vite', 'build', '--config', 'vite.web.config.ts'], {
  cwd: electronDir,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

// 2. If bun fails or is absent, fallback to npx vite
if (res.error || res.status !== 0) {
  console.log('[build-web] Bun failed or unavailable, running with npx vite...');
  res = spawnSync('npx', ['vite', 'build', '--config', 'vite.web.config.ts'], {
    cwd: electronDir,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
}

if (res.status !== 0) {
  console.error('[build-web] Compilation failed with status:', res.status);
  process.exit(res.status || 1);
}

console.log('[build-web] Production web bundle compiled successfully into frontend/dist');
