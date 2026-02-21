---
title: "Getting Started with Astro"
date: 2024-01-10
categories: ["tutorials"]
tags: ["astro", "web-development", "guide"]
excerpt: "A quick guide to working with your Astro-powered website. Learn the basics of pages, components, and content."
draft: false
---

Astro is the framework behind your website, and understanding a few core concepts will make it easy to maintain and extend. You do not need to be a developer to update content, but knowing how the pieces fit together helps when you want to go further.

## Pages and Routing

Every file in the `src/pages/` directory automatically becomes a page on your site. A file named `about.astro` becomes `/about`, and a file named `contact.astro` becomes `/contact`. There is no routing configuration to manage. If you want a new page, create a new file.

Astro pages use a `.astro` file format that combines frontmatter (JavaScript) with an HTML-like template. Here is a simplified example:

```astro
---
// This is the frontmatter — runs at build time
const pageTitle = "About Us";
---

<html>
  <head>
    <title>{pageTitle}</title>
  </head>
  <body>
    <h1>{pageTitle}</h1>
    <p>Welcome to our about page.</p>
  </body>
</html>
```

The code between the `---` fences runs at build time on the server. It never ships to the browser, which keeps your pages fast and lightweight.

## Components

Components are reusable pieces of your site like headers, footers, cards, and buttons. They live in `src/components/` and use the same `.astro` file format. You include them in pages with a simple import:

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---

<Header />
<main>
  <p>Page content goes here.</p>
</main>
<Footer />
```

This keeps your code organized and ensures changes to shared elements (like navigation links) only need to happen in one place.

## Content Collections

Blog posts and service pages are managed through Astro's content collections system. Instead of creating `.astro` files for each post, you write Markdown files with structured frontmatter. Astro validates the frontmatter against a schema defined in `src/content.config.ts`, so you will get a clear error if a required field is missing or has the wrong type.

This approach gives you the simplicity of Markdown with the safety of type checking. It also means your content is portable and not locked into any particular framework.

## Learning More

The [Astro documentation](https://docs.astro.build) is thorough and beginner-friendly. Start with the "Getting Started" guide if you want to dive deeper into the framework. For day-to-day content updates, though, everything you need is right here in these sample posts.
