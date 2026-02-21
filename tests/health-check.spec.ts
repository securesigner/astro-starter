import { test, expect } from '@playwright/test';

test('Check for silent console errors and 404s', async ({ page }) => {
  const errors: string[] = [];
  const failedRequests: string[] = [];

  // 1. Listen for console errors (red text in DevTools)
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`Console Error: ${msg.text()}`);
  });

  // 2. Listen for "uncaught exceptions" (crashes)
  page.on('pageerror', err => {
    errors.push(`Uncaught Exception: ${err.message}`);
  });

  // 3. Listen for failed network requests (images/scripts returning 404/500)
  page.on('requestfailed', request => {
    failedRequests.push(`${request.url()} (${request.failure()?.errorText})`);
  });

  await page.goto('/');

  // Wait a moment for any delayed scripts to execute
  await page.waitForTimeout(1000);

  // Assert perfection
  expect(errors, 'Found console errors').toEqual([]);
  expect(failedRequests, 'Found failed network requests').toEqual([]);
});
