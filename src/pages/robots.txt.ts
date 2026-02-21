/**
 * Robots.txt Endpoint
 * Generates robots.txt for search engine crawlers.
 *
 * Features:
 * - Universal rules for all bots (Allow all, Disallow 404)
 * - Specific rules for major search engines (Googlebot, Bingbot)
 * - Crawl-delay suggestion for less aggressive bots
 * - Sitemap reference for discovery
 */

import type { APIRoute } from 'astro';

import { SITE } from '@/data/site';

const robotsTxt = `# ${SITE.title} — robots.txt
# Generated dynamically by Astro

# ===========================================
# Universal Rules (applies to all crawlers)
# ===========================================
User-agent: *
Allow: /
Disallow: /404/
Disallow: /404

# Crawl-delay for polite crawlers (ignored by Google, respected by Bing/others)
Crawl-delay: 10

# ===========================================
# Googlebot — No crawl-delay (Google ignores it)
# ===========================================
User-agent: Googlebot
Allow: /
Disallow: /404/
Disallow: /404

# ===========================================
# Bingbot — Microsoft Search
# ===========================================
User-agent: Bingbot
Allow: /
Disallow: /404/
Disallow: /404
Crawl-delay: 5

# ===========================================
# AI Training Bots — Block content scraping
# ===========================================
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: ClaudeBot
Disallow: /

# ===========================================
# Sitemap Location
# ===========================================
Sitemap: ${new URL('/sitemap-index.xml', SITE.url).toString()}
`;

/** Returns robots.txt with sitemap location */
export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
