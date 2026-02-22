# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.1] — 2026-02-22

### Added

- **SETUP.md** — step-by-step getting started guide for non-developer buyers
- **GUMROAD.md** — product listing copy, feature bullets, and screenshot list for Gumroad
- **GitHub Actions CI** — lint, typecheck, unit test, build, and E2E test workflow
- **OG image Playwright tests** — E2E tests for all static and blog OG image routes
- **CUSTOMIZE markers** in `global.css` (design tokens + dark mode), all 3 service content files, `index.astro` schema.org, `Layout.astro` schema.org + theme-color, and `Footer.astro`
- **Twitter/X handle support** — optional `twitter` field in site config; `twitter:site` meta tag renders only when configured
- **VS Code workspace settings** — recommended extensions (Astro, Tailwind IntelliSense, Prettier, ESLint) and editor config for format-on-save

### Changed

- **DRY site URL** — `astro.config.mjs` now imports `SITE.url` from `site.ts` instead of duplicating the URL
- **Dark mode contrast** — submit button now uses `dark:bg-emerald-600`, placeholders use `dark:text-gray-400`, character counter adjusted for dark backgrounds
- **Theme-color meta tag** — now reads from `SITE.themeColor` instead of hardcoded `#ffffff`
- **Service content** — removed Astro-specific branding from web-design.md body copy
- **SETUP.md** — updated note about URL config (no longer need to update astro.config.mjs separately)

### Fixed

- Select placeholder and input placeholder contrast in dark mode (WCAG AA compliance)

## [1.0.0] — 2026-02-21

### Added

- **Astro 5** static site with Islands Architecture (React 19 interactive components)
- **Tailwind CSS v4** with full design token system (colors, typography, spacing, shadows)
- **Content Collections** with Zod schemas for type-safe blog posts and service pages
- **SEO suite** — meta tags, Open Graph, dynamic OG images (Satori), RSS feed, sitemap, schema.org JSON-LD
- **Contact form** — React form with client-side validation, honeypot spam protection, Formspree integration
- **Dark mode** — smooth toggle with system preference detection and FOUC prevention
- **Responsive design** — mobile-first with dedicated mobile bottom navigation
- **shadcn/ui components** — button, card, input, select, badge, toast notifications
- **4 layouts** — base, page, blog post, service page with rich structured data
- **View Transitions** — SPA-like navigation powered by Astro's ClientRouter
- **Blog** with category filtering, tag support, and reading time estimates
- **3 service pages** — Web Design, Consulting, and Ongoing Support with FAQ schemas
- **Pricing page** — 4-tier pricing grid with feature comparison
- **Privacy policy** — GDPR-friendly template with cookie-free analytics stance
- **404 page** — custom error page with helpful navigation links
- **Contact success page** — confirmation with social sharing and explore links
- **Self-hosted fonts** — DM Sans, Fraunces, Inter via @fontsource (no external requests)
- **Playwright E2E tests** — accessibility, SEO, forms, mobile, performance, feeds, health checks
- **Vitest unit tests** — 135+ tests for schemas, utilities, components, and data
- **Code quality** — ESLint, Prettier, TypeScript strict mode
- **CUSTOMIZE markers** — searchable comments throughout the codebase for easy personalization
