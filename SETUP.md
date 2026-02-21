# Getting Started Guide

A step-by-step guide for setting up and customizing your new website. No prior web development experience required.

---

## Prerequisites

Before you begin, install these two free tools:

### 1. Node.js (JavaScript runtime)

Download and install **Node.js 20 or later** from [nodejs.org](https://nodejs.org/). Choose the **LTS** (Long Term Support) version — it's the most stable.

To verify it installed correctly, open a terminal and run:

```bash
node --version
# Should print something like: v20.x.x

npm --version
# Should print something like: 10.x.x
```

### 2. Code Editor

Install [Visual Studio Code](https://code.visualstudio.com/) (free). It's the most popular editor for web development and has excellent support for this project's tech stack.

**Recommended VS Code extensions** (optional but helpful):

- [Astro](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode) — syntax highlighting and IntelliSense for `.astro` files
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) — autocomplete for CSS classes
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) — automatic code formatting

### 3. Terminal Basics

You'll use the terminal (also called "command line") to run a few commands. Here's how to open one:

- **VS Code**: Press `` Ctrl+` `` (backtick) or go to Terminal → New Terminal
- **macOS**: Open the Terminal app (in Applications → Utilities)
- **Windows**: Open PowerShell or Command Prompt from the Start menu

---

## Initial Setup

### Step 1: Unzip the Project

Unzip the downloaded file to a folder on your computer (e.g., `Documents/my-website`).

### Step 2: Open in VS Code

Open VS Code, then go to **File → Open Folder** and select the unzipped project folder.

### Step 3: Install Dependencies

Open the terminal in VS Code (`` Ctrl+` ``) and run:

```bash
npm install
```

This downloads all the libraries the project needs. It may take a minute or two the first time.

### Step 4: Start the Development Server

```bash
npm run dev
```

Open your browser and go to **http://localhost:4321** — you should see the template website running locally. Changes you make to the code will appear automatically in the browser.

To stop the server, press `Ctrl+C` in the terminal.

---

## What to Customize First

Work through this checklist in order. Each item links to the file you need to edit.

### ✅ 1. Business Details (`src/data/site.ts`)

This is the **single most important file**. Open it and replace all placeholder values:

```typescript
export const SITE = {
  title: 'YOUR BUSINESS NAME',     // ← Your company name
  description: '...',               // ← One sentence about your business
  url: 'https://yourdomain.com',    // ← Your live website URL
  author: 'Your Name',              // ← Your name
  tagline: '...',                   // ← Short tagline or slogan
  themeColor: '#047857',            // ← Your brand color (hex code)
};
```

> **Important**: Also update the `site` field in `astro.config.mjs` to match your URL.

### ✅ 2. Navigation Links (`src/data/navigation.ts`)

Update the header and footer navigation links to match your pages. Add or remove links as needed.

### ✅ 3. Brand Colors (`src/styles/global.css`)

Search for `@theme` in this file — it defines all colors used across the site. The default accent color is emerald green. Change the `--color-accent-*` values to match your brand.

### ✅ 4. Contact Form (`src/components/ContactForm.tsx`)

The contact form uses [Formspree](https://formspree.io) to receive submissions:

1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form and copy the form ID
3. In `ContactForm.tsx`, find `YOUR_FORM_ID` and replace it with your ID

### ✅ 5. Content Pages

Replace the placeholder content in these files:

| What | Where |
|------|-------|
| Homepage | `src/pages/index.astro` |
| About page | `src/pages/about.astro` |
| Pricing page | `src/pages/pricing.astro` |
| Privacy policy | `src/pages/privacy.astro` |
| Blog posts | `src/content/blog/*.md` |
| Service pages | `src/content/services/*.md` |

### ✅ 6. Images

Replace these files with your own:

| Image | Location | Size |
|-------|----------|------|
| Favicon | `public/favicon.svg` | Any (SVG preferred) |
| Logo | `public/assets/images/logo.svg` | ~180×48px |
| Default social image | `public/assets/images/og-default.png` | 1200×630px |
| 404 illustration | `public/assets/images/404-illustration.webp` | ~600×400px |

### ✅ 7. Fonts (optional)

The template uses **DM Sans** (body) and **Fraunces** (headings). To change fonts:

1. Find your font on [fontsource.org](https://fontsource.org/)
2. Install it: `npm install @fontsource-variable/your-font`
3. Update the import in `src/layouts/Layout.astro`
4. Update `--font-family-sans` or `--font-family-serif` in `src/styles/global.css`

### ✅ 8. License

Open the `LICENSE` file and replace `[year]` and `[Your Name or Company]` with your details.

---

## Finding All Customization Points

Every spot in the code that needs personalization is marked with a `CUSTOMIZE` comment. Run this command to see them all:

```bash
grep -rn "CUSTOMIZE" src/ public/ astro.config.mjs
```

Work through the results one by one to make sure nothing is missed.

---

## Building for Production

When you're ready to publish, build the final version:

```bash
npm run build
```

This creates a `dist/` folder containing your complete website as static HTML, CSS, and JavaScript files.

To preview the production build locally before deploying:

```bash
npm run preview
```

---

## Deploying Your Site

### Option A: Netlify (Recommended — Easiest)

1. Create a free account at [netlify.com](https://www.netlify.com/)
2. Go to **Sites → Add new site → Deploy manually**
3. Drag and drop the `dist/` folder onto the page
4. Your site is live! Netlify gives you a free URL like `your-site.netlify.app`
5. To use your own domain, go to **Domain settings → Add custom domain**

### Option B: Vercel

1. Create a free account at [vercel.com](https://vercel.com/)
2. Install the Vercel CLI: `npm install -g vercel`
3. Run `vercel` in the project folder and follow the prompts
4. Set framework preset to **Astro** and output directory to `dist/`

### Option C: Any Static Host

The `dist/` folder is a standard static site. Upload it to any web hosting provider that serves HTML files — no server-side runtime needed.

---

## Common Commands

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run unit tests |
| `npm run test` | Run end-to-end tests |
| `npm run lint` | Check for code issues |

---

## Getting Help

- **Astro Documentation**: [docs.astro.build](https://docs.astro.build/)
- **Tailwind CSS Documentation**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Astro Community Discord**: [astro.build/chat](https://astro.build/chat)
- **Formspree Help**: [help.formspree.io](https://help.formspree.io/)

---

## Troubleshooting

### "command not found: npm"

Node.js isn't installed or isn't in your system PATH. Reinstall from [nodejs.org](https://nodejs.org/) and restart your terminal.

### Port 4321 is already in use

Another process is using that port. Either stop it or run the dev server on a different port:

```bash
npx astro dev --port 3000
```

### Changes aren't showing in the browser

- Make sure the dev server is running (`npm run dev`)
- Try a hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Check the terminal for error messages

### Build errors

Run `npm run check` to see TypeScript errors, then fix the reported issues. Most commonly this happens when a required frontmatter field is missing from a content file.
