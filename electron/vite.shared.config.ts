import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const nodeMajor = parseInt(process.versions.node?.split('.')[0] || '0', 10);
const nodeExecArgv = nodeMajor >= 22 ? ['--no-experimental-webstorage'] : [];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src/renderer/src'),
      '@shared': resolve(import.meta.dirname, 'src/shared'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/shared/test/setup.js'],
    // Node 22+ supports --no-experimental-webstorage; on Node 20 or lower it is not a valid flag.
    execArgv: nodeExecArgv,
    // Shared release runners (Intel macOS, Windows ARM) run the suite many times slower
    // than a laptop; a real hang still fails, a busy runner no longer does.
    testTimeout: process.env.CI ? 30_000 : 5_000,
    include: ['src/shared/**/*.test.{js,jsx,ts,tsx}'],
    css: false,
  },
});
