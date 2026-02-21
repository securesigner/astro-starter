/**
 * Unit Tests for RSS Feed Logic
 *
 * Tests the feed generation logic:
 * - Post sorting (newest first)
 * - RSS item mapping (title, pubDate, link, description, categories, author)
 * - Optional fields handling
 * - Draft filtering
 *
 * Note: The actual feed.xml.ts endpoint uses Astro-specific APIs (astro:content, @astrojs/rss)
 * that can't be unit tested outside of Astro's build context. Instead, we test the
 * data transformation logic that would be applied to posts.
 */

import { describe, it, expect } from 'vitest';

// Helper to create mock blog posts matching the shape from getCollection
function createMockPost(overrides: Partial<{
  slug: string;
  data: {
    title?: string;
    date?: Date;
    excerpt?: string;
    description?: string;
    categories?: string[];
    author?: string;
    draft?: boolean;
  };
}> = {}) {
  return {
    slug: overrides.slug ?? 'test-post',
    data: {
      title: 'Test Post',
      date: new Date('2024-06-15'),
      excerpt: 'Test excerpt',
      description: 'Test description',
      categories: ['data'],
      author: 'Test Author',
      draft: false,
      ...overrides.data,
    },
  };
}

// Replicate the sorting logic from feed.xml.ts
function sortPostsByDate<T extends { data: { date: Date } }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
}

// Replicate the RSS item mapping from feed.xml.ts
function mapPostToRssItem(post: ReturnType<typeof createMockPost>) {
  return {
    title: post.data.title,
    pubDate: post.data.date,
    description: post.data.excerpt ?? post.data.description ?? '',
    link: `/blog/${post.slug}/`,
    categories: post.data.categories ?? [],
    author: post.data.author ?? 'Your Name',
  };
}

// Replicate the draft filter from feed.xml.ts
function filterDrafts<T extends { data: { draft?: boolean } }>(
  posts: T[],
  isProduction: boolean
): T[] {
  if (!isProduction) return posts;
  return posts.filter((post) => post.data.draft !== true);
}

describe('feed.xml logic', () => {
  describe('Post Sorting', () => {
    it('should sort posts by date descending (newest first)', () => {
      const posts = [
        createMockPost({ slug: 'old-post', data: { title: 'Old Post', date: new Date('2024-01-01') } }),
        createMockPost({ slug: 'new-post', data: { title: 'New Post', date: new Date('2024-06-15') } }),
        createMockPost({ slug: 'mid-post', data: { title: 'Mid Post', date: new Date('2024-03-15') } }),
      ];

      const sorted = sortPostsByDate(posts);

      expect(sorted[0].data.title).toBe('New Post');
      expect(sorted[1].data.title).toBe('Mid Post');
      expect(sorted[2].data.title).toBe('Old Post');
    });

    it('should handle posts with same date', () => {
      const sameDate = new Date('2024-06-15');
      const posts = [
        createMockPost({ slug: 'post-a', data: { title: 'Post A', date: sameDate } }),
        createMockPost({ slug: 'post-b', data: { title: 'Post B', date: sameDate } }),
      ];

      const sorted = sortPostsByDate(posts);

      // Both should be present, order is stable
      expect(sorted).toHaveLength(2);
    });

    it('should handle empty array', () => {
      const sorted = sortPostsByDate([]);
      expect(sorted).toEqual([]);
    });

    it('should handle single post', () => {
      const posts = [createMockPost({ slug: 'only-post' })];
      const sorted = sortPostsByDate(posts);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].slug).toBe('only-post');
    });
  });

  describe('RSS Item Mapping', () => {
    it('should map post title correctly', () => {
      const post = createMockPost({ data: { title: 'My Great Post' } });
      const item = mapPostToRssItem(post);
      expect(item.title).toBe('My Great Post');
    });

    it('should map post date as pubDate', () => {
      const postDate = new Date('2024-06-15');
      const post = createMockPost({ data: { date: postDate } });
      const item = mapPostToRssItem(post);
      expect(item.pubDate).toEqual(postDate);
    });

    it('should build correct link from slug', () => {
      const post = createMockPost({ slug: 'my-awesome-post' });
      const item = mapPostToRssItem(post);
      expect(item.link).toBe('/blog/my-awesome-post/');
    });

    it('should use excerpt for description when available', () => {
      const post = createMockPost({
        data: { excerpt: 'This is the excerpt', description: 'This is SEO description' },
      });
      const item = mapPostToRssItem(post);
      expect(item.description).toBe('This is the excerpt');
    });

    it('should fall back to description when no excerpt', () => {
      const post = createMockPost({
        data: { excerpt: undefined, description: 'SEO description only' },
      });
      const item = mapPostToRssItem(post);
      expect(item.description).toBe('SEO description only');
    });

    it('should use empty string when no excerpt or description', () => {
      const post = createMockPost({
        data: { excerpt: undefined, description: undefined },
      });
      const item = mapPostToRssItem(post);
      expect(item.description).toBe('');
    });

    it('should include categories when available', () => {
      const post = createMockPost({
        data: { categories: ['data', 'automation', 'strategy'] },
      });
      const item = mapPostToRssItem(post);
      expect(item.categories).toEqual(['data', 'automation', 'strategy']);
    });

    it('should default to empty categories array', () => {
      const post = createMockPost({ data: { categories: undefined } });
      const item = mapPostToRssItem(post);
      expect(item.categories).toEqual([]);
    });

    it('should include author when available', () => {
      const post = createMockPost({ data: { author: 'Jane Doe' } });
      const item = mapPostToRssItem(post);
      expect(item.author).toBe('Jane Doe');
    });

    it('should default author to site author', () => {
      const post = createMockPost({ data: { author: undefined } });
      const item = mapPostToRssItem(post);
      expect(item.author).toBe('Your Name');
    });
  });

  describe('Draft Filtering', () => {
    it('should include all posts in development', () => {
      const posts = [
        createMockPost({ slug: 'published', data: { draft: false } }),
        createMockPost({ slug: 'draft', data: { draft: true } }),
      ];

      const filtered = filterDrafts(posts, false);
      expect(filtered).toHaveLength(2);
    });

    it('should exclude drafts in production', () => {
      const posts = [
        createMockPost({ slug: 'published', data: { draft: false } }),
        createMockPost({ slug: 'draft', data: { draft: true } }),
      ];

      const filtered = filterDrafts(posts, true);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].slug).toBe('published');
    });

    it('should include posts with undefined draft (default published)', () => {
      const posts = [
        createMockPost({ slug: 'implicit-published', data: { draft: undefined } }),
      ];

      const filtered = filterDrafts(posts, true);
      expect(filtered).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const filtered = filterDrafts([], true);
      expect(filtered).toEqual([]);
    });

    it('should handle all drafts', () => {
      const posts = [
        createMockPost({ slug: 'draft1', data: { draft: true } }),
        createMockPost({ slug: 'draft2', data: { draft: true } }),
      ];

      const filtered = filterDrafts(posts, true);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Full Pipeline', () => {
    it('should filter, sort, and map posts correctly', () => {
      const posts = [
        createMockPost({
          slug: 'old-published',
          data: { title: 'Old Post', date: new Date('2024-01-01'), draft: false },
        }),
        createMockPost({
          slug: 'new-draft',
          data: { title: 'New Draft', date: new Date('2024-06-15'), draft: true },
        }),
        createMockPost({
          slug: 'new-published',
          data: { title: 'New Post', date: new Date('2024-06-10'), draft: false },
        }),
      ];

      // Simulate the feed.xml pipeline
      const filtered = filterDrafts(posts, true);
      const sorted = sortPostsByDate(filtered);
      const items = sorted.map(mapPostToRssItem);

      expect(items).toHaveLength(2);
      expect(items[0].title).toBe('New Post');
      expect(items[1].title).toBe('Old Post');
      expect(items[0].link).toBe('/blog/new-published/');
    });
  });
});
