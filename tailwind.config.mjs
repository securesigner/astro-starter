/**
 * Tailwind CSS v4 Configuration for Astro
 *
 * Tailwind v4 primarily uses CSS-based configuration via @theme directive
 * in src/styles/global.css. This JS config provides:
 * 1. Content paths for the JIT compiler
 * 2. Plugin configuration
 * 3. IDE/tooling compatibility
 *
 * @see https://tailwindcss.com/docs/v4-beta
 * @see src/styles/global.css for @theme configuration
 */

import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  // Content paths for Astro project (JIT compiler scans these)
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/pages/**/*.{astro,md,mdx}',
    './src/layouts/**/*.astro',
    './src/components/**/*.{astro,tsx,jsx}',
    './src/content/**/*.{md,mdx}',
  ],

  // Dark mode enabled via 'class' strategy (light theme by default)
  darkMode: 'class',

  theme: {
    extend: {
      // Theme tokens (colors, fonts, spacing, shadows) are defined in CSS
      // via @theme directive in src/styles/global.css — that is the single
      // source of truth. Do not duplicate token values here.
      //
      // This section is only for Tailwind plugins that require JS config
      // (e.g., typography plugin prose variable mapping).

      typography: {
        // Prose variable mapping for @tailwindcss/typography plugin
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--color-fg)',
            '--tw-prose-headings': 'var(--color-fg-bold)',
            '--tw-prose-lead': 'var(--color-fg-light)',
            '--tw-prose-links': 'var(--color-accent-secondary)',
            '--tw-prose-bold': 'var(--color-fg-bold)',
            '--tw-prose-counters': 'var(--color-fg-muted)',
            '--tw-prose-bullets': 'var(--color-accent-primary)',
            '--tw-prose-hr': 'var(--color-border)',
            '--tw-prose-quotes': 'var(--color-fg-light)',
            '--tw-prose-quote-borders': 'var(--color-accent-primary)',
            '--tw-prose-captions': 'var(--color-fg-muted)',
            '--tw-prose-code': 'var(--color-accent-tertiary)',
            '--tw-prose-pre-code': 'var(--color-fg)',
            '--tw-prose-pre-bg': 'var(--color-bg-alt)',
            '--tw-prose-th-borders': 'var(--color-border)',
            '--tw-prose-td-borders': 'var(--color-border)',
          },
        },
      },
    },
  },

  plugins: [
    // Typography plugin for prose styling of Markdown content
    typography,
  ],
};
