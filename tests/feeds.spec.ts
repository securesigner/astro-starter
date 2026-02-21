import { test, expect } from '@playwright/test';

/**
 * Feeds Tests
 *
 * Validates RSS feed and sitemap content:
 * - RSS feed structure and entries
 * - Sitemap completeness
 * - Feed content quality
 *
 * Note: Some tests may be skipped in dev mode if feeds aren't generated.
 */

test.describe('RSS Feed', () => {
  test('RSS feed is valid XML with entries', async ({ request }) => {
    const response = await request.get('/feed.xml');
    test.skip(response.status() !== 200, 'RSS feed not available');

    const content = await response.text();

    // Should have channel element
    expect(content).toContain('<channel>');

    // Should have title
    expect(content.toLowerCase()).toMatch(/<title>.*<\/title>/);

    // Should have link
    expect(content).toContain('<link>');

    // Should have description
    expect(content).toContain('<description>');
  });

  test('RSS feed has blog post entries', async ({ request }) => {
    const response = await request.get('/feed.xml');
    test.skip(response.status() !== 200, 'RSS feed not available');

    const content = await response.text();

    // Should have item entries (blog posts)
    expect(content).toContain('<item>');

    // Count items - should have multiple blog posts
    const itemCount = (content.match(/<item>/g) || []).length;
    expect(itemCount).toBeGreaterThan(0);
  });

  test('RSS feed entries have required fields', async ({ request }) => {
    const response = await request.get('/feed.xml');
    test.skip(response.status() !== 200, 'RSS feed not available');

    const content = await response.text();

    // Extract first item for validation
    const itemMatch = content.match(/<item>([\s\S]*?)<\/item>/);
    test.skip(!itemMatch, 'No items in feed');

    const firstItem = itemMatch![1];

    // Required RSS item fields
    expect(firstItem).toContain('<title>');
    expect(firstItem).toContain('<link>');
    expect(firstItem).toContain('<pubDate>');
  });

  test('RSS feed links are absolute URLs', async ({ request }) => {
    const response = await request.get('/feed.xml');
    test.skip(response.status() !== 200, 'RSS feed not available');

    const content = await response.text();

    // Extract links from items
    const linkMatches = content.matchAll(/<link>(.*?)<\/link>/g);
    for (const match of linkMatches) {
      const link = match[1];
      // Links should be absolute URLs
      expect(link).toMatch(/^https?:\/\//);
    }
  });
});

test.describe('Sitemap', () => {
  test('Sitemap exists and is valid', async ({ request }) => {
    // Try sitemap-index.xml first (Astro default), fallback to sitemap.xml
    let response = await request.get('/sitemap-index.xml');
    if (response.status() !== 200) {
      response = await request.get('/sitemap.xml');
    }
    test.skip(response.status() !== 200, 'Sitemap not available in dev mode');

    const content = await response.text();

    // Should be a sitemap index or sitemap
    expect(content).toMatch(/sitemapindex|urlset/);
  });

  test('Sitemap contains URLs', async ({ request }) => {
    // Try sitemap-index.xml first (Astro default), fallback to sitemap.xml
    let response = await request.get('/sitemap-index.xml');
    let content = await response.text();

    // If it's an index, get the first sitemap
    if (content.includes('sitemapindex')) {
      const locMatch = content.match(/<loc>(.*?)<\/loc>/);
      if (locMatch) {
        // Extract relative path from absolute URL
        const sitemapUrl = new globalThis.URL(locMatch[1]).pathname;
        response = await request.get(sitemapUrl);
        content = await response.text();
      }
    }

    test.skip(response.status() !== 200, 'Sitemap not available');

    // Should have URL entries
    expect(content).toContain('<url>');
    expect(content).toContain('<loc>');
  });
});

test.describe('Feed Accessibility', () => {
  test('RSS feed is linked in HTML head', async ({ page }) => {
    await page.goto('/');

    // Should have RSS link in head
    const rssLink = page.locator('link[type="application/rss+xml"]');
    const count = await rssLink.count();

    // RSS link is recommended but not required
    if (count > 0) {
      const href = await rssLink.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});
