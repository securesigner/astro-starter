/**
 * Services data
 * Used for homepage service tiles and navigation
 *
 * CUSTOMIZE: Replace with your own services.
 * Full service details are in the content collection (src/content/services/).
 * This file contains the summary data for display in service tiles/grids.
 */

export type ServiceIcon =
  | 'web-design'
  | 'consulting'
  | 'support';

export interface ServiceSummary {
  title: string;
  icon: ServiceIcon;
  description: string;
  slug?: string;
}

export const services: ServiceSummary[] = [
  {
    title: 'Web Design',
    icon: 'web-design',
    description:
      'Beautiful, fast websites built with modern tools. From landing pages to full business sites, designed to convert visitors into customers.',
    slug: 'web-design',
  },
  {
    title: 'Consulting',
    icon: 'consulting',
    description:
      'Expert guidance for your digital strategy. We help you make smart technology decisions and avoid costly mistakes.',
    slug: 'consulting',
  },
  {
    title: 'Ongoing Support',
    icon: 'support',
    description:
      'Keep your site running smoothly with regular updates, security patches, and content changes handled for you.',
    slug: 'support',
  },
];

/**
 * Get a service by its slug
 */
export function getServiceBySlug(slug: string): ServiceSummary | undefined {
  return services.find((service) => service.slug === slug);
}

export default services;
