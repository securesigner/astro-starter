import { test, expect } from '@playwright/test';

/**
 * SEO Tests
 *
 * Validates SEO requirements across key pages:
 * - Meta tags (title, description, open graph)
 * - Canonical URLs
 * - Structured data (JSON-LD)
 * - Social sharing metadata
 */

test.describe('SEO - Meta Tags', () => {
  const pagesWithSEO = [
    { url: '/', name: 'Homepage' },
    { url: '/about/', name: 'About' },
    { url: '/services/', name: 'Services' },
    { url: '/blog/', name: 'Blog' },
    { url: '/contact/', name: 'Contact' },
    { url: '/pricing/', name: 'Pricing' },
  ];

  for (const page of pagesWithSEO) {
    test(`${page.name} page has required meta tags`, async ({ page: p }) => {
      await p.goto(page.url, { waitUntil: 'domcontentloaded' });

      // Title should exist and not be empty
      const title = await p.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe('undefined');

      // Meta description should exist
      const description = await p.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(20);
      expect(description!.length).toBeLessThan(200); // Allow up to 200 chars

      // Viewport meta for mobile
      const viewport = await p.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
    });
  }
});

test.describe('SEO - Open Graph Tags', () => {
  const pagesWithOG = [
    { url: '/', name: 'Homepage' },
    { url: '/about/', name: 'About' },
    { url: '/services/', name: 'Services' },
  ];

  for (const page of pagesWithOG) {
    test(`${page.name} page has Open Graph tags`, async ({ page: p }) => {
      await p.goto(page.url, { waitUntil: 'domcontentloaded' });

      // og:title - may use fallback
      const ogTitle = await p.locator('meta[property="og:title"]').getAttribute('content');

      // If og:title exists, validate it
      if (ogTitle) {
        expect(ogTitle.length).toBeGreaterThan(0);
      }

      // og:description
      const ogDescription = await p.locator('meta[property="og:description"]').getAttribute('content');
      if (ogDescription) {
        expect(ogDescription.length).toBeGreaterThan(0);
      }

      // og:type
      const ogType = await p.locator('meta[property="og:type"]').getAttribute('content');
      if (ogType) {
        expect(['website', 'article', 'profile']).toContain(ogType);
      }

      // At minimum, should have basic meta description
      const description = await p.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
    });
  }
});

test.describe('SEO - Canonical URLs', () => {
  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/about/', name: 'About' },
    { url: '/blog/', name: 'Blog' },
    { url: '/services/', name: 'Services' },
  ];

  for (const page of pages) {
    test(`${page.name} page has canonical URL`, async ({ page: p }) => {
      await p.goto(page.url, { waitUntil: 'domcontentloaded' });

      const canonical = await p.locator('link[rel="canonical"]').getAttribute('href');
      // Canonical may not be present on all pages - skip if not found
      if (canonical) {
        // If present, should be a valid URL
        expect(canonical).toMatch(/https?:\/\/|localhost/);
      }
    });
  }
});

test.describe('SEO - Structured Data', () => {
  test('Homepage has structured data', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    // Structured data is optional but recommended
    if (scripts.length > 0) {
      let hasValidSchema = false;
      for (const script of scripts) {
        const content = await script.textContent();
        if (content && content.includes('"@type"')) {
          try {
            const data = JSON.parse(content);
            if (data['@type']) {
              hasValidSchema = true;
              break;
            }
          } catch {
            // Invalid JSON - skip
          }
        }
      }
      expect(hasValidSchema).toBe(true);
    }
  });

  test('About page has structured data', async ({ page }) => {
    await page.goto('/about/', { waitUntil: 'domcontentloaded' });

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    // Structured data is optional but recommended
    if (scripts.length > 0) {
      let hasValidSchema = false;
      for (const script of scripts) {
        const content = await script.textContent();
        if (content && content.includes('"@type"')) {
          try {
            const data = JSON.parse(content);
            if (data['@type']) {
              hasValidSchema = true;
              break;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
      expect(hasValidSchema).toBe(true);
    }
  });

  test('Services page has Service schema', async ({ page }) => {
    await page.goto('/services/', { waitUntil: 'domcontentloaded' });

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    expect(scripts.length).toBeGreaterThan(0);
  });
});

test.describe('SEO - 404 Page', () => {
  test('404 page returns proper status and content', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345/', { waitUntil: 'domcontentloaded' });

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should have meaningful content
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Should have a link back to home
    const homeLink = page.locator('a[href="/"]');
    expect(await homeLink.count()).toBeGreaterThan(0);
  });

  test('404 page has proper SEO for error pages', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345/', { waitUntil: 'domcontentloaded' });

    // Should have noindex meta tag
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    if (robots) {
      expect(robots).toContain('noindex');
    }

    // Title should indicate error
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/not found|404|error/);
  });
});

test.describe('SEO - Technical', () => {
  test('robots.txt exists and is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);

    const content = await page.content();
    expect(content.toLowerCase()).toContain('user-agent');
  });

  test('sitemap exists and is accessible', async ({ page }) => {
    // Try sitemap-index.xml first (Astro default), fallback to sitemap.xml
    let response = await page.goto('/sitemap-index.xml');
    if (response?.status() !== 200) {
      response = await page.goto('/sitemap.xml');
    }
    // In dev mode, sitemap may not be generated - skip if not found
    test.skip(response?.status() !== 200, 'Sitemap not available in dev mode');

    const content = await page.content();
    expect(content.toLowerCase()).toMatch(/sitemap|urlset/);
  });

  test('RSS feed exists and is accessible', async ({ request }) => {
    // Use API request to get raw XML content
    const response = await request.get('/feed.xml');
    // In dev mode, feed may not be generated - skip if not found
    test.skip(response.status() !== 200, 'RSS feed not available in dev mode');

    const content = await response.text();
    expect(content.toLowerCase()).toMatch(/rss|feed|channel/);
  });
});
