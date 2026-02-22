/**
 * Site Configuration — Single source of truth
 * =============================================
 * Centralized site metadata used across layouts, components, and feeds.
 *
 * CUSTOMIZE: Update these values with your business details.
 * Every layout, component, and feed reads from this file.
 *
 * Usage:
 *   import { SITE } from '@/data/site';
 */

export const SITE = {
  title: 'YOUR BUSINESS NAME',
  description:
    'A brief description of your business and what you do. Update this in src/data/site.ts.',
  // This is the single source of truth — astro.config.mjs imports this value
  url: 'https://yourdomain.com',
  author: 'Your Name',
  tagline:
    'Your compelling tagline goes here. Keep it short and focused on your value proposition.',
  themeColor: '#047857',
  defaultImage: '/assets/images/og-default.png',
  twitterCard: 'summary_large_image' as const,
  // CUSTOMIZE: Add your Twitter/X handle (e.g., '@yourbusiness') for twitter:site meta tag
  twitter: '',
} as const;

export type SiteConfig = typeof SITE;
