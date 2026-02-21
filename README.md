# Small Business Astro Starter

A production-ready website template for small businesses, built with Astro 5 and designed to be fast, accessible, and easy to customize.

> **[Live Demo →](https://your-demo-url.netlify.app)** · Replace this link with your deployed preview

![Astro 5](https://img.shields.io/badge/Astro-5-FF5D01?logo=astro&logoColor=white) ![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white) ![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

## Screenshots

<!-- Add your own screenshots here for Gumroad listing -->
<!-- ![Homepage](docs/screenshots/homepage.png) -->
<!-- ![Services](docs/screenshots/services.png) -->
<!-- ![Dark Mode](docs/screenshots/dark-mode.png) -->
<!-- ![Mobile](docs/screenshots/mobile.png) -->

## Features

- **Astro 5** with Islands Architecture — static-first with interactive React components where needed
- **Tailwind CSS v4** with a full design token system (colors, fonts, spacing, shadows)
- **Content Collections** with Zod schemas for type-safe blog posts and service pages
- **SEO** — meta tags, Open Graph, dynamic OG images (Satori), RSS feed, sitemap, schema.org JSON-LD
- **Contact form** — React form with validation, honeypot spam protection, Formspree integration
- **Dark mode** — smooth toggle with system preference detection
- **Responsive design** — mobile-first with a dedicated mobile bottom navigation
- **shadcn/ui components** — button, card, input, select, badge, toast notifications
- **4 layouts** — base, page, blog post, service page
- **View Transitions** — SPA-like navigation without a SPA
- **Tests** — Playwright E2E + Vitest unit tests
- **CI/CD** — GitHub Actions workflow (lint, typecheck, build, test)
- **Code quality** — ESLint, Prettier, TypeScript strict mode

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:4321
```

> **New to web development?** See [SETUP.md](SETUP.md) for a detailed getting started guide with prerequisites, step-by-step setup, and deployment instructions.

## Customization Guide

### 1. Site Configuration (start here)

Edit `src/data/site.ts` with your business details:

```typescript
export const SITE = {
  title: 'YOUR BUSINESS NAME',
  description: 'Your business description',
  url: 'https://yourdomain.com',
  author: 'Your Name',
  tagline: 'Your tagline',
  // ...
};
```

This file is the single source of truth — layouts, feeds, and SEO all read from it.

### 2. Navigation

Edit `src/data/navigation.ts` for header and footer links.

### 3. Color Scheme

Edit `src/styles/global.css` — the `@theme` block defines all design tokens. Change the emerald accent color to match your brand:

```css
@theme {
  --color-accent-primary: var(--color-emerald-700);
  /* Change to your brand color */
}
```

### 4. Content

- **Blog posts**: Add Markdown files to `src/content/blog/` (see sample posts for frontmatter reference)
- **Service pages**: Add Markdown files to `src/content/services/` (see sample services for schema reference)
- **Pages**: Each file in `src/pages/` is a route — add, remove, or modify as needed

### 5. Contact Form

1. Create a free account at [Formspree](https://formspree.io)
2. Create a new form and copy the form ID
3. Replace `YOUR_FORM_ID` in `src/components/ContactForm.tsx`

### 6. Fonts

Fonts are self-hosted via `@fontsource` (no external requests):

- **DM Sans** — body text
- **Fraunces** — headings
- **Inter** — UI elements

To change fonts:
1. Install new `@fontsource` packages
2. Update imports in `src/layouts/Layout.astro`
3. Update `--font-sans` / `--font-serif` in `src/styles/global.css`

### 7. Images

- Replace `public/favicon.svg` with your favicon
- Replace `public/assets/images/logo.svg` with your logo
- Replace `public/assets/images/og-default.png` with your default social image (1200×630)
- Replace `public/assets/images/404-illustration.webp` with your own 404 illustration
- Blog post images go in `public/assets/images/blog/`

### 8. LICENSE

Open the `LICENSE` file and replace `[year]` and `[Your Name or Company]` with your details.

### 9. Find All Customization Points

Search the codebase for `CUSTOMIZE` to find every spot that's marked for personalization:

```bash
grep -rn "CUSTOMIZE" src/
```

## Project Structure

```
src/
├── components/          # Astro + React components
│   ├── ui/              # shadcn/ui components
│   ├── ContactForm.tsx  # React contact form (client:visible)
│   ├── ThemeToggle.tsx  # Dark mode toggle (client:idle)
│   └── ...
├── content/
│   ├── blog/            # Blog posts (Markdown)
│   └── services/        # Service pages (Markdown)
├── data/
│   ├── site.ts          # Site configuration
│   ├── navigation.ts    # Nav links
│   └── services.ts      # Service summaries
├── layouts/
│   ├── Layout.astro     # Base layout (all pages)
│   ├── BlogPostLayout.astro
│   ├── ServiceLayout.astro
│   └── PageLayout.astro
├── pages/               # File-based routing
├── styles/
│   └── global.css       # Tailwind v4 + design tokens
└── content.config.ts    # Zod schemas for collections
```

## Content Schemas

### Blog Post Frontmatter

```yaml
---
title: "Post Title"           # Required
date: 2024-01-15              # Required
author: "Your Name"           # Optional (defaults to site author)
categories: ["category"]      # Optional
tags: ["tag1", "tag2"]        # Optional
excerpt: "Short description"  # Optional
draft: false                  # Optional (defaults to false)
---
```

### Service Page Frontmatter

```yaml
---
title: "Service Name"         # Required
tagline: "Short description"  # Required
benefits: []                  # List of benefit strings
ideal_for: []                 # List of ideal client descriptions
process: []                   # Steps: { title, description }
deliverables: []              # Items: { title, description }
faqs: []                      # Items: { question, answer }
draft: false                  # Optional
---
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:4321 |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run E2E tests (Playwright) |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run lint` | Check for lint errors |
| `npm run check` | TypeScript type checking |
| `npm run verify` | Build + E2E tests |

## Deployment

This template outputs a static site (`dist/` directory). Deploy anywhere:

- **Netlify**: Set build command to `npm run build`, publish directory to `dist/`
- **Vercel**: Framework preset "Astro", output directory `dist/`
- **Cloudflare Pages**: Build command `npm run build`, output directory `dist/`
- **GitHub Pages**: See [Astro docs](https://docs.astro.build/en/guides/deploy/github/)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Astro 5 |
| UI | React 19 (islands) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix primitives) |
| Type Safety | TypeScript, Zod |
| Testing | Playwright, Vitest |
| Code Quality | ESLint, Prettier |
| Fonts | @fontsource (self-hosted) |
| OG Images | Satori + resvg |

## License

MIT — see [LICENSE](LICENSE) for details. Update the copyright holder with your name before publishing.
