/**
 * RSS Feed Endpoint
 * =================================================
 * Generates RSS 2.0 feed for all published blog posts.
 * Uses @astrojs/rss for standards-compliant feed generation.
 *
 * URL: /feed.xml
 * Content-Type: application/rss+xml
 *
 * Migrated from: Jekyll's feed.xml (via jekyll-feed plugin)
 */

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '@/data/site';

/**
 * Generates RSS 2.0 feed with all published blog posts
 * @param context - Astro API context with site URL
 * @returns RSS feed response
 */
export async function GET(context: APIContext) {
  // Fetch all published blog posts
  const allPosts = await getCollection('blog', ({ data }) => {
    // Filter out drafts in production
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  // Sort by date descending (newest first)
  const sortedPosts = allPosts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    // RSS channel metadata
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,

    // RSS items from blog posts
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt ?? post.data.description ?? '',
      // Build the full URL for the post
      // Post slug is derived from filename (e.g., 2024-01-01-my-post.md → my-post)
      link: `/blog/${post.slug}/`,
      // Optional: include categories as RSS categories
      categories: post.data.categories ?? [],
      // Optional: author
      author: post.data.author ?? SITE.author,
    })),

    // Custom XML for better feed readers
    customData: `<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<generator>Astro v5.0</generator>`,

    // Stylesheet for human-readable feed (optional)
    stylesheet: '/rss/styles.xsl',
  });
}
