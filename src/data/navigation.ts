/**
 * Navigation data
 * Header and footer navigation structure
 *
 * CUSTOMIZE: Update links to match your site pages.
 */

export interface NavLink {
  title: string;
  url: string;
}

export interface FooterSection {
  title: string;
  links: NavLink[];
}

/**
 * @internal Used for testing only. Import headerNav and footerNav directly.
 */
export interface NavigationData {
  header: NavLink[];
  footer: FooterSection[];
}

/**
 * Header navigation
 * CUSTOMIZE: Adjust links to match your pages
 */
export const headerNav: NavLink[] = [
  { title: 'Services', url: '/services/' },
  { title: 'Blog', url: '/blog/' },
  { title: 'About', url: '/about/' },
  { title: 'Contact', url: '/contact/' },
];

/**
 * Footer navigation sections
 */
export const footerNav: FooterSection[] = [
  {
    title: 'Company',
    links: [
      { title: 'About', url: '/about/' },
      { title: 'Services', url: '/services/' },
      { title: 'Contact', url: '/contact/' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Blog', url: '/blog/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { title: 'Privacy', url: '/privacy/' },
    ],
  },
];

/**
 * @internal Combined export for testing. Prefer headerNav and footerNav directly.
 */
export const navigation: NavigationData = {
  header: headerNav,
  footer: footerNav,
};

/** @internal */
export default navigation;
