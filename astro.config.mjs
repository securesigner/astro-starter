// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // CUSTOMIZE: Set your production URL for canonical links and sitemap
  site: 'https://yourdomain.com',

  outDir: './dist',

  // Integrations
  // React: enables islands architecture for interactive components
  // Sitemap: auto-generates sitemap-index.xml with priority/changefreq hints
  integrations: [
    react(),
    sitemap({
      serialize(item) {
        const url = item.url;

        // Homepage: highest priority
        if (url.endsWith('.com') || url.endsWith('.com/')) {
          return { ...item, priority: 1.0, changefreq: ChangeFreqEnum.WEEKLY };
        }

        // Services: high priority
        if (url.includes('/services')) {
          return { ...item, priority: 0.9, changefreq: ChangeFreqEnum.MONTHLY };
        }

        // Feeds and OG images: exclude from sitemap
        if (url.includes('/feed') || url.includes('/rss') || url.includes('/og/')) {
          return undefined;
        }

        // Blog posts: medium priority
        if (url.includes('/blog')) {
          return { ...item, priority: 0.7, changefreq: ChangeFreqEnum.WEEKLY };
        }

        // About page
        if (url.includes('/about')) {
          return { ...item, priority: 0.7, changefreq: ChangeFreqEnum.MONTHLY };
        }

        // Contact page: lower priority
        if (url.includes('/contact')) {
          return { ...item, priority: 0.5, changefreq: ChangeFreqEnum.YEARLY };
        }

        // Default
        return { ...item, priority: 0.5, changefreq: ChangeFreqEnum.MONTHLY };
      },
    }),
  ],

  // Image optimization
  image: {
    remotePatterns: [{ protocol: 'https' }],
  },

  // Markdown with Shiki syntax highlighting
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },

  // Prefetch pages on hover for instant navigation
  prefetch: {
    defaultStrategy: 'hover',
  },

  server: {
    port: 4321,
    host: true,
  },

  build: {
    inlineStylesheets: 'auto',
  },

  vite: {
    optimizeDeps: {
      exclude: ['astro:content'],
    },
    css: {
      postcss: './postcss.config.cjs',
    },
  },
});
