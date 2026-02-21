import { test, expect } from '@playwright/test';

test('Check for silent console errors and 404s', async ({ page }) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];

  // Vite dev server noise to ignore (only appears in dev mode, not production builds)
  const DEV_NOISE_PATTERNS = [
    'Outdated Optimize Dep',
    'Failed to fetch dynamically imported module',
    'jsxDEV is not a function',
    '[vite]',
    'HMR',
  ];

  const isDevNoise = (msg: string) =>
    DEV_NOISE_PATTERNS.some((pattern) => msg.includes(pattern));

  // 1. Listen for console errors (red text in DevTools)
  page.on('console', msg => {
    if (msg.type() === 'error' && !isDevNoise(msg.text()))
      errors.push(`Console Error: ${msg.text()}`);
  });

  // 2. Listen for "uncaught exceptions" (crashes)
  page.on('pageerror', err => {
    if (!isDevNoise(err.message))
      errors.push(`Uncaught Exception: ${err.message}`);
  });

  // 3. Listen for failed network requests (images/scripts returning 404/500)
  // Filter out Vite dev server dependency optimization noise
  page.on('requestfailed', request => {
    const url = request.url();
    const isViteDevNoise = url.includes('.vite/deps') || url.includes('node_modules/.vite');
    if (!isViteDevNoise) {
      failedRequests.push(`${url} (${request.failure()?.errorText})`);
    }
  });

  await page.goto('/');

  // Wait a moment for any delayed scripts to execute
  await page.waitForTimeout(1000);

  // Assert perfection
  expect(errors, 'Found console errors').toEqual([]);
  expect(failedRequests, 'Found failed network requests').toEqual([]);
});
