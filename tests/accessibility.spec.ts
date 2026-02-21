import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests
 *
 * Runs axe accessibility scans on all pages.
 * Tests keyboard navigation and focus indicators.
 */

// All static pages to test
const staticPages = [
  '/',
  '/about/',
  '/privacy/',
  '/blog/',
];

// Service pages
const servicePages = [
  '/services/',
];

// No individual blog post pages to test (no dynamic [slug] route configured)
const blogPosts: string[] = [];

// Combine all pages for initial accessibility scan
const allPages = [...staticPages, ...servicePages, ...blogPosts];

// Color contrast issues have been fixed (ACC-02)
import type { Page } from '@playwright/test';

// Keeping array empty - no rules need to be disabled
const knownColorContrastIssues: string[] = [];

/**
 * Helper function to wait for page to be ready for accessibility scan
 * Updated for Astro: pages may not have 'is-loading' class
 */
async function waitForPageReady(page: Page) {
  // Wait for body to be present (Astro pages load differently than Jekyll)
  await page.waitForSelector('body', { timeout: 5000 });

  // Wait for any CSS animations/transitions to complete
  await page.waitForTimeout(1500);

  // Force style recalculation (wrapped in try-catch for navigation edge cases)
  try {
    await page.evaluate(() => {
      void document.body.offsetHeight; // Force layout
    });
  } catch {
    // If navigation occurred during evaluate, wait for stability
    await page.waitForLoadState('domcontentloaded');
  }
}

/**
 * Helper function to run axe accessibility scan
 * Excludes known color-contrast issues that need design review
 * Tests against WCAG 2.0, 2.1, and 2.2 Level A and AA criteria
 */
async function runAccessibilityScan(page: Page) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .disableRules(knownColorContrastIssues)
    .analyze();
  return accessibilityScanResults;
}

test.describe('Accessibility Scans - Static Pages', () => {
  for (const url of allPages) {
    test(`Check a11y on ${url}`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageReady(page);

      const accessibilityScanResults = await runAccessibilityScan(page);
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});



// ========================================================================
// Keyboard Navigation Tests (QA-13)
// ========================================================================

test.describe('Keyboard Navigation', () => {
  test('Tab navigation reaches all interactive elements on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await waitForPageReady(page);

    // Press Tab and verify focus moves to an interactive element
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(firstFocused);

    // Continue tabbing and collect focused elements
    const focusedElements: string[] = [];
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const tagName = await page.evaluate(() => document.activeElement?.tagName);
      if (tagName && !['BODY', 'HTML'].includes(tagName)) {
        focusedElements.push(tagName);
      }
    }

    // Should have encountered multiple interactive elements
    expect(focusedElements.length).toBeGreaterThan(5);
  });

  test('Focus indicator is visible on interactive elements', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await waitForPageReady(page);

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Check that the focused element has a visible focus indicator
    const focusStyles = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return {
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow,
      };
    });

    expect(focusStyles).toBeTruthy();
    // Focus should have some visual indicator (outline or box-shadow)
    const hasVisibleOutline = focusStyles!.outlineStyle !== 'none' && focusStyles!.outlineWidth !== '0px';
    const hasBoxShadow = focusStyles!.boxShadow !== 'none';
    expect(hasVisibleOutline || hasBoxShadow).toBeTruthy();
  });

  test('Skip link is keyboard accessible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await waitForPageReady(page);

    // Press Tab once - if there's a skip link, it should be first
    await page.keyboard.press('Tab');

    const skipLink = await page.evaluate(() => {
      const el = document.activeElement;
      if (el?.tagName === 'A') {
        return {
          href: (el as HTMLAnchorElement).href,
          text: el.textContent?.toLowerCase(),
        };
      }
      return null;
    });

    // If a skip link exists, it should contain "skip" or "main"
    if (skipLink && skipLink.text) {
      const isSkipLink = skipLink.text.includes('skip') || skipLink.text.includes('main');
      // This is informational - not all sites have skip links
      if (isSkipLink) {
        expect(skipLink.href).toContain('#');
      }
    }
  });

  test('Links and buttons have accessible keyboard focus', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await waitForPageReady(page);

    // Tab to an element
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Get focus styles
    const hasFocusIndicator = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;

      const styles = window.getComputedStyle(el);
      const hasOutline = styles.outlineStyle !== 'none' && styles.outlineWidth !== '0px';
      const hasBoxShadow = styles.boxShadow !== 'none';
      const hasBorder = styles.borderStyle !== 'none';

      return hasOutline || hasBoxShadow || hasBorder;
    });

    expect(hasFocusIndicator).toBeTruthy();
  });
});
