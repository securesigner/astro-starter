/**
 * Astro Build Output Verification Tests
 *
 * Validates that the Astro build produces correct output structure:
 * - Output directory structure (dist/)
 * - Expected pages exist
 * - Feed and sitemap generation

 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const distDir = path.resolve(__dirname, '../../dist');

// Skip tests if dist/ has no build output (build hasn't run or was interrupted)
const distExists = fs.existsSync(path.join(distDir, 'index.html'));

describe.skipIf(!distExists)('Astro Build Output', () => {
  describe('Output Directory Structure', () => {
    it('should have dist/ directory', () => {
      expect(fs.existsSync(distDir)).toBe(true);
    });

    it('should have index.html at root', () => {
      const indexPath = path.join(distDir, 'index.html');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    it('should have core page directories', () => {
      const corePages = ['about', 'blog', 'services', 'contact'];
      for (const page of corePages) {
        const pagePath = path.join(distDir, page);
        expect(fs.existsSync(pagePath), `Missing page directory: ${page}`).toBe(true);
      }
    });
  });

  describe('Blog Posts', () => {
    it('should have blog index', () => {
      const blogIndex = path.join(distDir, 'blog', 'index.html');
      expect(fs.existsSync(blogIndex)).toBe(true);
    });

    it('should have at least one blog post', () => {
      const blogDir = path.join(distDir, 'blog');
      if (fs.existsSync(blogDir)) {
        const entries = fs.readdirSync(blogDir, { withFileTypes: true });
        const postDirs = entries.filter(e => e.isDirectory() && e.name !== '_astro');
        expect(postDirs.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Services', () => {
    it('should have services index', () => {
      const servicesIndex = path.join(distDir, 'services', 'index.html');
      expect(fs.existsSync(servicesIndex)).toBe(true);
    });
  });

  describe('RSS Feed', () => {
    it('should have feed.xml or rss.xml', () => {
      const feedXml = path.join(distDir, 'feed.xml');
      const rssXml = path.join(distDir, 'rss.xml');
      expect(fs.existsSync(feedXml) || fs.existsSync(rssXml)).toBe(true);
    });

    it('should have valid XML in feed', () => {
      const feedXml = path.join(distDir, 'feed.xml');
      const rssXml = path.join(distDir, 'rss.xml');
      const feedPath = fs.existsSync(feedXml) ? feedXml : rssXml;

      if (fs.existsSync(feedPath)) {
        const content = fs.readFileSync(feedPath, 'utf8');
        expect(content.startsWith('<?xml')).toBe(true);
        expect(content).toContain('<rss');
      }
    });
  });

  describe('Sitemap', () => {
    it('should have sitemap-index.xml or sitemap.xml', () => {
      const sitemapIndex = path.join(distDir, 'sitemap-index.xml');
      const sitemap = path.join(distDir, 'sitemap.xml');
      expect(fs.existsSync(sitemapIndex) || fs.existsSync(sitemap)).toBe(true);
    });
  });

  describe('Static Assets', () => {
    it('should have robots.txt', () => {
      const robots = path.join(distDir, 'robots.txt');
      expect(fs.existsSync(robots)).toBe(true);
    });
  });
});
