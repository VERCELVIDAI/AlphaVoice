import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const nodeMajor = parseInt(process.versions.node?.split('.')[0] || '0', 10);
const nodeExecArgv = nodeMajor >= 22 ? ['--no-experimental-webstorage'] : [];

export default defineConfig({
  plugins: [tailwindcss(), react()],
  define: {
    __WEB_DEPLOYMENT__: false,
    __APP_VERSION__: JSON.stringify('0.5.7'),
    __BUILD_COMMIT__: JSON.stringify('local'),
    __DISTRIBUTION_TARGET__: JSON.stringify('direct'),
    __POSTHOG_PROJECT_TOKEN__: JSON.stringify(''),
    __POSTHOG_HOST__: JSON.stringify(''),
    __CLOUD_ACCOUNTS__: false,
    __CLOUD_CLIENT_ID__: JSON.stringify(''),
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src/renderer/src'),
      '@shared': resolve(import.meta.dirname, 'src/shared'),
      '@vercel/oidc': resolve(import.meta.dirname, 'src/renderer/src/lib/vercel-oidc-browser.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: { exclude: ['@scalar/api-reference-react'] },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/renderer/src/test/setup.ts'],
    // Node 22+ supports --no-experimental-webstorage; on Node 20 or lower it is not a valid flag.
    execArgv: nodeExecArgv,
    // Shared release runners (Intel macOS, Windows ARM) run the suite many times slower
    // than a laptop; a real hang still fails, a busy runner no longer does.
    testTimeout: process.env.CI ? 30_000 : 5_000,
    include: [
      'src/main/**/*.test.{ts,tsx}',
      'src/renderer/**/*.test.{ts,tsx}',
      'src/shared/repair-request.test.ts',
      'src/shared/download-failure.test.ts',
    ],
    css: false,
  },
});
