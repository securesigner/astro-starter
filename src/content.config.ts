/**
 * Astro Content Collections Configuration
 *
 * Defines strict Zod schemas for all content types.
 * Build fails on schema violations.
 *
 * Collections:
 * - blog: Blog posts
 * - services: Service pages
 *
 * @see https://docs.astro.build/en/guides/content-collections/
 */

import { defineCollection, z } from 'astro:content';

// =============================================================================
// SHARED SCHEMAS
// =============================================================================

/**
 * FAQ item schema - used in services
 */
const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

/**
 * Process step schema - used in services
 */
const processStepSchema = z.object({
  title: z.string(),
  icon: z.string().optional(),
  description: z.string(),
});

/**
 * Deliverable schema - used in services
 */
const deliverableSchema = z.object({
  title: z.string(),
  icon: z.string().optional(),
  description: z.string(),
});

// =============================================================================
// BLOG COLLECTION
// =============================================================================

/**
 * Blog post schema
 * Based on Jekyll _posts/ frontmatter:
 * - layout: post
 * - title, date, author, author_key
 * - categories, tags, excerpt
 * - related_service
 * - schema_type, last_modified_at
 */
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Required fields
    title: z.string(),
    date: z.coerce.date(),

    // Author info
    author: z.string().default('Your Name'),
    author_key: z.string().default('your-name'),

    // Categorization
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),

    // Content metadata
    excerpt: z.string().optional(),
    description: z.string().optional(), // Alternative to excerpt

    // Cross-references
    related_service: z.string().optional(),

    // SEO & technical
    schema_type: z.string().default('BlogPosting'),
    last_modified_at: z.coerce.date().optional(),

    /**
     * Custom Open Graph image for social sharing.
     * Path should be relative to public folder, e.g., "/assets/images/og/post-slug.png"
     * Falls back to default OG image if not specified.
     * Recommended dimensions: 1200x630px
     */
    ogImage: z.string().optional(),

    // Draft status
    draft: z.boolean().default(false),

    // Image (optional featured image)
    image: z
      .object({
        src: z.string(),
        alt: z.string().optional(),
      })
      .optional(),
  }),
});

// =============================================================================
// SERVICES COLLECTION
// =============================================================================

/**
 * Service page schema
 * Based on Jekyll _services/ frontmatter:
 * - layout: service
 * - title, tagline, cta_text, permalink
 * - faqs, overview_title, benefits, ideal_for
 * - process, deliverables
 * - cta_headline, cta_subtext
 * - schema_type, last_modified_at
 */
const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Required fields
    title: z.string(),
    tagline: z.string(),

    // Call-to-action
    cta_text: z.string().optional(),
    cta_headline: z.string().optional(),
    cta_subtext: z.string().optional(),

    // URL (for backward compatibility)
    permalink: z.string().optional(),

    // Content sections
    overview_title: z.string().optional(),
    benefits: z.array(z.string()).default([]),
    ideal_for: z.array(z.string()).default([]),

    // Structured content
    faqs: z.array(faqSchema).default([]),
    process: z.array(processStepSchema).default([]),
    deliverables: z.array(deliverableSchema).default([]),

    // SEO & technical
    schema_type: z.string().default('Service'),
    last_modified_at: z.coerce.date().optional(),

    // Draft status
    draft: z.boolean().default(false),
  }),
});

// =============================================================================
// EXPORT ALL COLLECTIONS
// =============================================================================

export const collections = {
  blog: blogCollection,
  services: servicesCollection,
};

