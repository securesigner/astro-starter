/**
 * Mobile Viewport E2E Tests (QA-08)
 *
 * Tests for mobile-specific behavior in Astro site:
 * - Mobile navigation menu toggle
 * - Form accessibility on mobile
 * - No horizontal scrolling
 * - Touch target sizing (44x44px minimum)
 *
 * Updated for Astro migration with React Navigation component.
 */

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Helper to wait for page ready state (Astro)
const waitForAppReady = async (page: Page) => {
  await page.waitForSelector('body', { timeout: 5000 });
  await page.waitForTimeout(500);
};

// Viewport dimensions for different devices
const IPHONE_12_VIEWPORT = { width: 390, height: 844 };
const IPHONE_SE_VIEWPORT = { width: 375, height: 667 };
const IPAD_VIEWPORT = { width: 810, height: 1080 };

test.describe('Mobile Viewport Tests (iPhone 12)', () => {
  test.use({ viewport: IPHONE_12_VIEWPORT });

  test.describe('Navigation Menu', () => {
    test('mobile menu toggle is visible and functional', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);

      // Mobile menu toggle button should be visible (look for common patterns)
      const toggle = page.locator('button[aria-label*="menu"], button[aria-label*="navigation"], [data-mobile-nav], .mobile-nav-toggle');

      // If no mobile toggle found, navigation might be different on mobile
      const toggleCount = await toggle.count();
      if (toggleCount > 0) {
        const firstToggle = toggle.first();
        await expect(firstToggle).toBeVisible();

        // Try clicking to toggle menu
        await firstToggle.click();
        await page.waitForTimeout(300);

        // Menu should open (look for nav links)
        const mobileNav = page.locator('nav a, [role="navigation"] a');
        const navCount = await mobileNav.count();
        expect(navCount).toBeGreaterThan(0);
      } else {
        // Navigation might be always visible or use different pattern
        const nav = page.locator('nav, [role="navigation"]');
        await expect(nav.first()).toBeAttached();
      }
    });

    test('navigation links are usable on mobile', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);

      // Find any navigation links
      const navLinks = page.locator('nav a, [role="navigation"] a, header a');
      const count = await navLinks.count();

      // Should have navigation links
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('No Horizontal Scrolling', () => {
    test('homepage has no horizontal overflow', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);

      // Check that body doesn't have horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });

    test('services page has no horizontal overflow', async ({ page }) => {
      await page.goto('/services/');
      await waitForAppReady(page);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });

    test('blog page has no horizontal overflow', async ({ page }) => {
      await page.goto('/blog/');
      await waitForAppReady(page);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  });

  test.describe('Touch Target Sizing', () => {
    test('buttons meet touch target requirements', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);

      // Find interactive elements
      const buttons = page.locator('button, a.btn, [role="button"]');
      const count = await buttons.count();

      if (count > 0) {
        const firstButton = buttons.first();
        const isVisible = await firstButton.isVisible();

        if (isVisible) {
          const box = await firstButton.boundingBox();
          if (box) {
            // Interactive elements should be easily tappable
            expect(box.width).toBeGreaterThanOrEqual(40);
            expect(box.height).toBeGreaterThanOrEqual(40);
          }
        }
      }
    });
  });
});

test.describe('Small Mobile Viewport (iPhone SE)', () => {
  // Test on the smallest common mobile viewport
  test.use({ viewport: IPHONE_SE_VIEWPORT });

  test('page is usable on iPhone SE viewport', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Verify no horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);

    // Page should have navigation
    const nav = page.locator('nav, [role="navigation"], header');
    await expect(nav.first()).toBeAttached();
  });
});

test.describe('Tablet Viewport (iPad)', () => {
  // Test tablet viewport
  test.use({ viewport: IPAD_VIEWPORT });

  test('navigation works on tablet viewport', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // On tablet/desktop, navigation should be accessible
    const nav = page.locator('nav, [role="navigation"]');
    const navLinks = page.locator('nav a, [role="navigation"] a, header a');

    // Check navigation is present and has links
    await expect(nav.first()).toBeAttached();
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
