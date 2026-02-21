---
title: "Welcome to Your New Website"
date: 2026-01-15
author: "Your Name"
author_key: "your-name"
categories: ["announcements"]
tags: ["welcome", "getting-started"]
excerpt: "Your new website is live! Here's what you can do with it and how to make it your own."
schema_type: "BlogPosting"
draft: false
---

Congratulations on launching your new website! This site is built with [Astro](https://astro.build), a modern web framework that delivers fast, content-focused websites out of the box. Everything you see here is fully customizable, and this post will walk you through the basics of making it yours.

## What You Can Customize

Your site is designed to be easy to update without touching complex code. Here are the first things most people change:

- **Site title and metadata** -- update your business name, description, and social links in the site config
- **Color scheme** -- adjust the CSS custom properties to match your brand
- **Logo and favicon** -- drop your own assets into the `public/` folder
- **Content** -- add blog posts and service pages using simple Markdown files
- **Images** -- replace the placeholder images with your own photography or graphics

## Adding Your First Real Post

Creating a new blog post is as simple as adding a Markdown file to the `src/content/blog/` directory. Each file uses frontmatter at the top to define metadata like the title, date, and tags. The body of the file is standard Markdown, so you can write with headings, lists, links, images, and code blocks.

Here is an example of what a minimal blog post file looks like:

```md
---
title: "My First Post"
date: 2024-02-01
categories: ["news"]
tags: ["update"]
excerpt: "A short summary of the post."
---

Write your content here using Markdown.
```

## Next Steps

Take some time to explore the codebase and read through the other sample posts in this blog. They cover topics like working with Astro components and why site performance matters for your business. Once you are comfortable, delete these sample posts and start publishing your own content. Your website is ready when you are.
