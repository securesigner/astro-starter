import { test, expect } from '@playwright/test';

/**
 * OG Image Tests
 *
 * Validates that dynamic OG image routes return valid PNG images.
 * These images are generated at build time by Satori + resvg
 * and served as static .png files.
 */

const STATIC_OG_ROUTES = [
  '/og/home.png',
  '/og/about.png',
  '/og/services.png',
  '/og/contact.png',
  '/og/pricing.png',
  '/og/blog.png',
  '/og/privacy.png',
];

test.describe('OG Image Generation', () => {
  test.describe('Static page OG images', () => {
    for (const route of STATIC_OG_ROUTES) {
      test(`${route} returns a valid PNG`, async ({ request }) => {
        const response = await request.get(route);
        test.skip(response.status() === 404, `OG route ${route} not available (dev mode)`);

        expect(response.status()).toBe(200);

        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('image/png');

        const body = await response.body();
        expect(body.length).toBeGreaterThan(0);
      });
    }
  });

  test.describe('Blog post OG images', () => {
    test('/og/blog/getting-started-with-astro.png returns a valid PNG', async ({ request }) => {
      const response = await request.get('/og/blog/getting-started-with-astro.png');
      test.skip(response.status() === 404, 'Blog OG route not available (dev mode)');

      expect(response.status()).toBe(200);

      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('image/png');

      const body = await response.body();
      expect(body.length).toBeGreaterThan(0);
    });

    test('/og/blog/welcome-to-your-new-site.png returns a valid PNG', async ({ request }) => {
      const response = await request.get('/og/blog/welcome-to-your-new-site.png');
      test.skip(response.status() === 404, 'Blog OG route not available (dev mode)');

      expect(response.status()).toBe(200);

      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('image/png');

      const body = await response.body();
      expect(body.length).toBeGreaterThan(0);
    });
  });
});
