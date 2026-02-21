import { defineConfig, devices } from '@playwright/test';
import os from 'node:os';

const isCI = Boolean(process.env.CI);
const isSmoke = !isCI && process.env.PW_SMOKE === '1';

/**
 * Sharding Configuration
 * ----------------------
 * Playwright supports sharding to split tests across multiple CI runners.
 * Sharding is configured in .github/workflows/playwright.yml via matrix strategy.
 *
 * To enable sharding:
 * 1. In playwright.yml, change matrix.shard from [1] to [1, 2, 3] (or more)
 * 2. Update matrix.total-shards to match the shard count [3]
 * 3. Tests will automatically distribute across shards
 *
 * Local sharding (for testing):
 *   npx playwright test --shard=1/3  # Run first third of tests
 *   npx playwright test --shard=2/3  # Run second third
 *   npx playwright test --shard=3/3  # Run final third
 *
 * Sharding respects test file order and ensures each test runs exactly once.
 * Results from all shards are merged in the CI report job.
 */

const cpuCount = os.cpus()?.length ?? 2;
// Keep local runs fast but avoid overwhelming Jekyll/your machine.
const localWorkers = Math.min(8, Math.max(2, cpuCount - 1));

// Allow opting into the full browser matrix locally when needed:
// PW_ALL_BROWSERS=1 npx playwright test
const runAllBrowsers = isCI || process.env.PW_ALL_BROWSERS === '1';

export default defineConfig({
  timeout: 60000,

  testDir: './tests',
  // Ignore unit tests (run by Vitest, not Playwright)
  testIgnore: ['**/unit/**'],
  ...(isSmoke
    ? {
        // Ultra-fast local subset when you want a quick signal.
        testMatch: [
          '**/health-check.spec.ts',
          '**/site-structure.spec.ts',
          '**/accessibility.spec.ts',
        ],
      }
    : {}),
  fullyParallel: true,
  workers: isCI ? 2 : localWorkers,
  // Retry: 0 locally to surface flakiness early, 2 in CI for resilience
  retries: isCI ? 2 : 0,

  forbidOnly: isCI,

  // Keep all Playwright artifacts out of repo root.
  outputDir: 'test-results',

  // Keep CI diagnostics rich; keep local runs fast.
  // GitHub reporter annotates PRs with flaky tests (tests that pass on retry).
  reporter: isCI
    ? [
        ['list'],
        ['json', { outputFile: 'test-results/report.json' }],
        ['html', { open: 'never' }],
        ['github'], // Annotates PRs with flaky tests
      ]
    : [
        ['list'],
        ['json', { outputFile: 'test-results/report.json' }],
      ],

  webServer: {
    command: isCI
      ? 'npm run build && npm run preview'
      : 'npm run dev',
    url: 'http://localhost:4321',
    // Faster local iteration: reuse an already-running server if present.
    // CI stays isolated/deterministic.
    reuseExistingServer: !isCI,
    timeout: 120 * 1000, // Give Astro time to build
  },

  use: {
    // Run in the background (headless) to save resources
    headless: true,

    // IMPORTANT: Astro runs on port 4321 (dev) or 4321 (preview).
    baseURL: 'http://localhost:4321',

    trace: isCI ? 'on-first-retry' : 'retain-on-failure',

    // Capture a screenshot if a test fails
    screenshot: 'only-on-failure',
  },

  // Visual regression test configuration
  expect: {
    toHaveScreenshot: {
      // Allow minor rendering differences across platforms/environments
      maxDiffPixels: 100,
      threshold: 0.2,
    },
    // Increase timeout for screenshot comparisons
    timeout: 30000,
  },

  projects: runAllBrowsers
    ? [
        /* Desktop Browsers */
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: {
            ...devices['Desktop Safari'],
            // WebKit needs extra time for resource-heavy pages (e.g., Board Matrix)
            navigationTimeout: 15000,
          },
        },

        /* Mobile Viewport Testing */
        {
          name: 'Mobile Chrome',
          use: { ...devices['Pixel 5'] },
        },
      ]
    : [
        // Local default: fast feedback loop on Chromium only.
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ],
});
