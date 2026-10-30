import '@testing-library/jest-dom/vitest';

(globalThis as unknown as Record<string, unknown>).__WEB_DEPLOYMENT__ = false;
(globalThis as unknown as Record<string, unknown>).__APP_VERSION__ = '0.5.7';
(globalThis as unknown as Record<string, unknown>).__BUILD_COMMIT__ = 'local';
(globalThis as unknown as Record<string, unknown>).__DISTRIBUTION_TARGET__ = 'direct';
(globalThis as unknown as Record<string, unknown>).__POSTHOG_PROJECT_TOKEN__ = '';
(globalThis as unknown as Record<string, unknown>).__POSTHOG_HOST__ = '';
(globalThis as unknown as Record<string, unknown>).__CLOUD_ACCOUNTS__ = false;
(globalThis as unknown as Record<string, unknown>).__CLOUD_CLIENT_ID__ = '';
