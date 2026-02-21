/**
 * Central export for all data modules
 * Replaces Jekyll's site.data.* pattern with TypeScript imports
 *
 * Usage in Astro components:
 *   import { SITE } from '@/data';
 *   import { headerNav, footerNav } from '@/data';
 *   import { services } from '@/data';
 */

// Site configuration
export { SITE, type SiteConfig } from './site';

// Navigation
export {
  headerNav,
  footerNav,
  type NavLink,
  type FooterSection,
} from './navigation';

// Services
export { services, type ServiceSummary, type ServiceIcon } from './services';
