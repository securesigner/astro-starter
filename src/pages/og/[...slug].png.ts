/**
 * Dynamic OG Image Generation Endpoint
 * =====================================
 * Generates branded Open Graph images for blog posts and static pages at build time.
 * Uses satori + @resvg/resvg-js for server-side image rendering.
 *
 * URL Patterns:
 *   /og/blog/[slug].png  — Blog posts
 *   /og/[page].png       — Static pages (about, services, contact, etc.)
 *
 * CUSTOMIZE: Update COLORS and brand text to match your site.
 *
 * @see https://github.com/vercel/satori
 */

import type { APIContext } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import satori, { type SatoriOptions } from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SITE } from '@/data/site';

// Image dimensions (standard OG size)
const WIDTH = 1200;
const HEIGHT = 630;

// CUSTOMIZE: Update colors to match your brand
const COLORS = {
  background: '#0a0e14',
  primary: '#059669',
  text: '#ffffff',
  textMuted: '#a1a1aa',
  accent: '#1a1f2e',
};

/**
 * Load Inter font from local @fontsource/inter package
 */
const fontRegular = readFileSync(
  resolve('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff')
);
const fontBold = readFileSync(
  resolve('node_modules/@fontsource/inter/files/inter-latin-700-normal.woff')
);

/**
 * Static pages to generate OG images for
 * CUSTOMIZE: Add or remove pages as needed
 */
const STATIC_PAGES = [
  { slug: 'home', title: 'Home', category: SITE.tagline },
  { slug: 'about', title: 'About Us', category: 'Company' },
  { slug: 'services', title: 'Our Services', category: 'Services' },
  { slug: 'contact', title: 'Contact Us', category: 'Contact' },
  { slug: 'pricing', title: 'Pricing', category: 'Plans' },
  { slug: 'blog', title: 'Blog', category: 'Insights' },
  { slug: 'privacy', title: 'Privacy Policy', category: 'Legal' },
];

/**
 * Generate static paths for all blog posts and static pages
 */
export async function getStaticPaths() {
  const blogPosts = await getCollection('blog', ({ data }) => !data.draft);

  const blogPaths = blogPosts.map((post) => ({
    params: { slug: `blog/${post.slug}` },
    props: { post, isStaticPage: false as const },
  }));

  const staticPaths = STATIC_PAGES.map((page) => ({
    params: { slug: page.slug },
    props: { staticPage: page, isStaticPage: true as const },
  }));

  return [...blogPaths, ...staticPaths];
}

/**
 * Create the OG image markup using satori's html helper
 */
function createOgImage(title: string, category: string) {
  const fontSize = title.length > 60 ? 48 : title.length > 40 ? 56 : 64;
  const hostname = new URL(SITE.url).hostname;

  return {
    type: 'div',
    props: {
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: COLORS.background,
        padding: '60px',
        fontFamily: 'Inter',
      },
      children: [
        // Top: Category badge
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
            },
            children: {
              type: 'div',
              props: {
                style: {
                  backgroundColor: COLORS.accent,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: COLORS.primary,
                  fontSize: '20px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                },
                children: category,
              },
            },
          },
        },
        // Middle: Title
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              paddingRight: '40px',
            },
            children: {
              type: 'div',
              props: {
                style: {
                  fontSize: `${fontSize}px`,
                  fontWeight: 700,
                  color: COLORS.text,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                },
                children: title,
              },
            },
          },
        },
        // Bottom: Branding
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '4px',
                          height: '40px',
                          backgroundColor: COLORS.primary,
                          borderRadius: '2px',
                        },
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '24px',
                                fontWeight: 700,
                                color: COLORS.text,
                                letterSpacing: '0.05em',
                              },
                              children: SITE.title,
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: '16px',
                                color: COLORS.textMuted,
                              },
                              children: SITE.tagline,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '18px',
                    color: COLORS.textMuted,
                  },
                  children: hostname,
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/**
 * Generate OG image for a blog post or static page
 */
export async function GET({ props }: APIContext) {
  let title: string;
  let category: string;

  if (props.isStaticPage) {
    const { staticPage } = props as { staticPage: (typeof STATIC_PAGES)[number]; isStaticPage: true };
    title = staticPage.title;
    category = staticPage.category;
  } else {
    const { post } = props as { post: CollectionEntry<'blog'>; isStaticPage: false };
    if (!post) {
      return new Response('Post not found', { status: 404 });
    }
    const { categories = [] } = post.data;
    title = post.data.title;
    category = categories[0] || 'Blog';
  }

  const options: SatoriOptions = {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'Inter',
        data: fontRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: fontBold,
        weight: 700,
        style: 'normal',
      },
    ],
  };

  const svg = await satori(
    createOgImage(title, category) as Parameters<typeof satori>[0],
    options
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(new Uint8Array(pngBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
