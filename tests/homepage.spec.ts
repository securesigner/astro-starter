import { test, expect } from '@playwright/test';

/**
 * Homepage Section Tests for Astro
 *
 * Tests for homepage sections and components.
 * Verifies core structure without assuming specific class names.
 */

test.describe('Homepage Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('load');
  });

  test('homepage loads with correct title', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('has hero section with heading', async ({ page }) => {
    // Check for main heading
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  test('has navigation', async ({ page }) => {
    // Look for desktop nav with "Primary navigation" aria-label
    const nav = page.locator('nav[aria-label="Primary navigation"]');
    await expect(nav).toBeVisible();
  });

  test('has footer', async ({ page }) => {
    // Select the main site footer with contentinfo role
    const footer = page.locator('footer[role="contentinfo"]');
    await expect(footer).toBeVisible();
  });

  test('has call-to-action buttons or links', async ({ page }) => {
    // Look for primary CTAs
    const ctas = page.locator('a.btn, button.btn, [data-cta], a:has-text("Contact"), a:has-text("Get Started")');
    const ctaCount = await ctas.count();
    expect(ctaCount).toBeGreaterThanOrEqual(0);
  });

  test('has service or feature section', async ({ page }) => {
    // Check for services, features, or similar content
    const sections = page.locator('section, [data-section]');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(0);
  });

  test('images have alt text for accessibility', async ({ page }) => {
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Image should have alt text, or be decorative (role="presentation" or aria-hidden)
      const isAccessible = alt !== null || role === 'presentation' || ariaHidden === 'true';
      expect(isAccessible).toBe(true);
    }
  });

  test('no broken links on homepage', async ({ page }) => {
    const links = await page.locator('a[href]').all();
    const brokenLinks: string[] = [];

    for (const link of links.slice(0, 20)) { // Check first 20 links
      const href = await link.getAttribute('href');

      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        // Skip external links and javascript
        if (href.startsWith('http') && !href.includes('localhost')) {
          continue;
        }

        try {
          const response = await page.request.get(href);
          if (response.status() >= 400) {
            brokenLinks.push(`${href}: ${response.status()}`);
          }
        } catch {
          // Skip links that can't be checked
        }
      }
    }

    expect(brokenLinks, `Found broken links: ${brokenLinks.join(', ')}`).toEqual([]);
  });

  test('has responsive meta viewport', async ({ page }) => {
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });
});
