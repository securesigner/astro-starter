# Test Suite Documentation

## Overview

This project uses **Playwright** for End-to-End (E2E) testing and **Vitest** for unit testing. The test suite ensures:

- ✅ Accessibility (WCAG 2.1 AA compliance)
- ✅ Visual regression detection
- ✅ Mobile responsiveness
- ✅ Form validation
- ✅ Content collection validation
- ✅ Build output verification
- ✅ Data module validation

---

## Test Structure

```
tests/
├── accessibility.spec.ts         # Axe-core accessibility scans (WCAG 2.1 AA)
├── browser-feature-detection.spec.ts  # Graceful degradation tests
├── forms.spec.ts                 # Contact form validation tests
├── health-check.spec.ts          # Basic site health checks
├── mobile.spec.ts                # Mobile viewport tests (touch, nav, sizing)
├── share-url-parameters.spec.ts  # URL parameter handling & share links
├── site-structure.spec.ts        # Navigation and link validation
├── visual.spec.ts                # Visual regression screenshots
├── visual.spec.ts-snapshots/     # Baseline screenshots for visual tests
└── unit/
    ├── formatCurrency.test.ts    # Currency formatting utility tests
    └── yaml-validation.test.ts   # YAML data file validation
```

---

## Running Tests

### E2E Tests (Playwright)

```bash
# Run all E2E tests (requires Jekyll server)
npm test

# Run all tests with build (full verification)
npm run verify

# Run specific test file
npx playwright test tests/tools.spec.ts

# Run tests matching a description
npx playwright test --grep="Tax Estimator"

# Run with UI (interactive mode)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific browser only
npx playwright test --project=chromium
```

### Visual Regression Tests

```bash
# Run visual tests
npm run test:visual

# Update baseline snapshots (after intentional UI changes)
npm run test:visual:update

# View visual test report
npm run test:visual:report
```

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode (during development)
npm run test:unit:watch

# Run with coverage report
npm run test:unit:coverage
```

### Quick Smoke Test (Local Development)

```bash
# Run subset of critical tests for fast feedback
PW_SMOKE=1 npx playwright test
```

### Flaky Test Detection

Flaky tests are tests that sometimes pass and sometimes fail without code changes.
They can be caused by timing issues, race conditions, or external dependencies.

**Configuration:**

- CI runs tests with `retries: 2` - failed tests are retried up to 2 times
- GitHub reporter annotates PRs with flaky tests (tests that pass on retry)
- Trace files are captured on first retry for debugging

**Identifying Flaky Tests:**

```bash
# Run tests multiple times to detect flakiness
npm run test:flaky

# Run specific test file multiple times
npm run test:flaky -- tests/tools.spec.ts

# Analyze results for flaky tests
node scripts/detect-flaky.js

# Run more iterations for thorough detection
npx playwright test --repeat-each=5 tests/health-check.spec.ts
```

**Understanding Results:**

- A test that **passes on first attempt** is stable ✅
- A test that **fails initially but passes on retry** is flaky 🔄
- A test that **fails all attempts** is broken ❌

**Fixing Flaky Tests:**

1. Add explicit waits for dynamic content (`waitForFunction()`)
2. Wait for Alpine.js initialization before interacting with elements
3. Use `await expect(locator).toBeVisible()` before clicking
4. Increase timeouts for slow operations
5. Check for race conditions in async code
6. Use `trace: 'on-first-retry'` to capture debugging info

**Example Fix for Flaky Test:**

```typescript
// ❌ Flaky: Element may not be ready
await page.click('#calculate-btn');

// ✅ Stable: Wait for element to be visible and enabled
const btn = page.locator('#calculate-btn');
await expect(btn).toBeVisible();
await expect(btn).toBeEnabled();
await btn.click();
```

---

## Test Patterns

### 1. Accessibility Testing Pattern

Uses `@axe-core/playwright` for automated a11y scanning:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page passes accessibility audit', async ({ page }) => {
  await page.goto('/about');

  // Wait for animations to complete
  await page.waitForTimeout(2500);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast']) // Document known issues
    .analyze();

  expect(results.violations).toEqual([]);
});
```

**Coverage includes:**

- All static pages (home, about, privacy)
- Service pages
- Blog posts
- Interactive states (open modals, active forms)

---

### 2. Visual Regression Pattern

Captures full-page screenshots and compares against baselines:

```typescript
import { test, expect } from '@playwright/test';

const VISUAL_DIFF_THRESHOLD = { maxDiffPixelRatio: 0.03 };

test('matches screenshot', async ({ page }) => {
  await page.goto('/about');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Let animations settle

  await expect(page).toHaveScreenshot('about.png', {
    fullPage: true,
    timeout: 30000,
    ...VISUAL_DIFF_THRESHOLD,
  });
});
```

**Updating snapshots:**

```bash
# After intentional UI changes
npm run test:visual:update

# Commit the new baselines
git add tests/visual.spec.ts-snapshots/
git commit -m "chore: update visual baselines"
```

---

### 3. Mobile Testing Pattern

Uses viewport configuration for device simulation:

```typescript
import { test, expect } from '@playwright/test';

const IPHONE_12_VIEWPORT = { width: 390, height: 844 };

test.describe('Mobile Tests', () => {
  test.use({ viewport: IPHONE_12_VIEWPORT });

  test('mobile menu toggles correctly', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('button.nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('no horizontal scrolling', async ({ page }) => {
    await page.goto('/');
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
```

---

### 4. Browser Feature Detection Pattern

Tests graceful degradation when browser APIs are unavailable:

```typescript
import { test, expect } from '@playwright/test';

test('works without localStorage', async ({ page }) => {
  // Disable localStorage before navigation
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('localStorage disabled');
      },
      configurable: true,
    });
  });

  await page.goto('/about');

  // Page should still function
  await expect(page.getByRole('heading', { name: /About/i })).toBeVisible();
});
```

---

### 5. Unit Testing Pattern (Vitest)

For pure functions and data validation:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import yaml from 'js-yaml';

describe('YAML data validation', () => {
  let data: any[];

  beforeAll(() => {
    const content = fs.readFileSync('_data/tools.yml', 'utf8');
    data = yaml.load(content) as any[];
  });

  it('all items have required fields', () => {
    data.forEach((item, i) => {
      expect(item.slug, `Item ${i} missing slug`).toBeDefined();
      expect(typeof item.slug).toBe('string');
    });
  });
});
```

---

## Adding New Tests

### Adding Accessibility Coverage

1. Open [tests/accessibility.spec.ts](tests/accessibility.spec.ts)
2. Add the new page URL to the appropriate array:
   - `staticPages` for content pages
   - `servicePages` for service pages
   - `blogPosts` for blog content

### Adding Visual Regression

1. Open [tests/visual.spec.ts](tests/visual.spec.ts)
2. Add the URL to the `pages` array or create a new test for specific states
3. Run `npm run test:visual:update` to create the baseline

### Adding Unit Tests

1. Create a new file: `tests/unit/feature-name.test.ts`
2. Follow the Vitest pattern with `describe`, `it`, `expect`
3. Run `npm run test:unit` to verify

---

## Debugging Tips

### Test Failures

```bash
# Run with debug logging
DEBUG=pw:api npx playwright test tests/tools.spec.ts

# Run single test in headed mode
npx playwright test --headed -g "Tax Estimator"

# Generate trace on failure (already configured in CI)
npx playwright test --trace on
```

### View Test Reports

```bash
# Open HTML report from last run
npx playwright show-report

# Reports are saved to: test-results/
```

### Common Issues

| Issue                   | Solution                                           |
| ----------------------- | -------------------------------------------------- |
| Element not found       | Add `waitForAppReady()` or increase timeout        |
| Flaky input tests       | Use `await expect(input).toHaveValue('X')` pattern |
| Visual test fails       | Check for animation timing, use `waitForTimeout()` |
| Accessibility violation | Check axe-core docs for fix guidance               |

### Jekyll Server Not Starting

```bash
# Check if Jekyll is already running
lsof -i :4000

# Kill existing process and retry
kill -9 <PID>
npm test
```

---

## Configuration Files

| File                                            | Purpose                                       |
| ----------------------------------------------- | --------------------------------------------- |
| [playwright.config.ts](../playwright.config.ts) | Playwright settings, browser matrix, timeouts |
| [vitest.config.ts](../vitest.config.ts)         | Vitest settings, coverage options             |
| [lighthouserc.js](../lighthouserc.js)           | Lighthouse CI performance budgets             |

---

## CI Integration

Tests run automatically on:

- **Pull Requests:** Full E2E suite + unit tests
- **Main Branch:** Full suite with visual regression

GitHub Actions workflow runs:

1. `npm run verify` (build + all tests)
2. Lighthouse CI performance checks
3. Coverage reporting

---

## Test Maintenance Checklist

- [ ] Update visual baselines after intentional UI changes
- [ ] Add a11y tests for new pages
- [ ] Keep YAML validation tests updated with data schema changes
- [ ] Review and fix flaky tests promptly

---

## Related Documentation

- [docs/testing.md](../docs/testing.md) — Quick reference testing guide
- [playwright.config.ts](../playwright.config.ts) — Playwright configuration
- [vitest.config.ts](../vitest.config.ts) — Vitest configuration
- [CLAUDE.md](../CLAUDE.md) — Project constraints and commands
