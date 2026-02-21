/**
 * Unit Tests for Navigation Data Module
 *
 * Tests the navigation data exports:
 * - headerNav structure and links
 * - footerNav structure and sections
 * - NavigationData combined export
 */

import { describe, it, expect } from 'vitest';
import {
  headerNav,
  footerNav,
  navigation,
  type NavLink,
  type FooterSection,
  type NavigationData,
} from '../../src/data/navigation';

describe('navigation data', () => {
  describe('headerNav', () => {
    it('exports an array of navigation links', () => {
      expect(Array.isArray(headerNav)).toBe(true);
      expect(headerNav.length).toBeGreaterThan(0);
    });

    it('each link has title and url properties', () => {
      headerNav.forEach((link) => {
        expect(link).toHaveProperty('title');
        expect(link).toHaveProperty('url');
        expect(typeof link.title).toBe('string');
        expect(typeof link.url).toBe('string');
      });
    });

    it('all URLs start with / or are hash links', () => {
      headerNav.forEach((link) => {
        expect(link.url).toMatch(/^\/|^#/);
      });
    });

    it('contains expected core navigation items', () => {
      const titles = headerNav.map((link) => link.title);
      expect(titles).toContain('Services');
      expect(titles).toContain('About');
      expect(titles).toContain('Contact');
    });

    it('Contact link points to contact page', () => {
      const contactLink = headerNav.find((link) => link.title === 'Contact');
      expect(contactLink?.url).toBe('/contact/');
    });
  });

  describe('footerNav', () => {
    it('exports an array of footer sections', () => {
      expect(Array.isArray(footerNav)).toBe(true);
      expect(footerNav.length).toBeGreaterThan(0);
    });

    it('each section has title and links array', () => {
      footerNav.forEach((section) => {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('links');
        expect(typeof section.title).toBe('string');
        expect(Array.isArray(section.links)).toBe(true);
      });
    });

    it('each link in sections has title and url', () => {
      footerNav.forEach((section) => {
        section.links.forEach((link) => {
          expect(link).toHaveProperty('title');
          expect(link).toHaveProperty('url');
          expect(typeof link.title).toBe('string');
          expect(typeof link.url).toBe('string');
        });
      });
    });

    it('all section URLs are valid paths', () => {
      footerNav.forEach((section) => {
        section.links.forEach((link) => {
          expect(link.url).toMatch(/^\/|^#|^https?:/);
        });
      });
    });

    it('contains expected footer sections', () => {
      const sectionTitles = footerNav.map((section) => section.title);
      expect(sectionTitles).toContain('Company');
      expect(sectionTitles).toContain('Resources');
      expect(sectionTitles).toContain('Legal');
    });

    it('Company section contains expected links', () => {
      const companySection = footerNav.find((s) => s.title === 'Company');
      expect(companySection).toBeDefined();
      const linkTitles = companySection?.links.map((l) => l.title) ?? [];
      expect(linkTitles).toContain('About');
      expect(linkTitles).toContain('Services');
      expect(linkTitles).toContain('Contact');
    });

    it('Resources section contains Blog', () => {
      const resourcesSection = footerNav.find((s) => s.title === 'Resources');
      expect(resourcesSection).toBeDefined();
      const linkTitles = resourcesSection?.links.map((l) => l.title) ?? [];
      expect(linkTitles).toContain('Blog');
    });

    it('Legal section contains Privacy link', () => {
      const legalSection = footerNav.find((s) => s.title === 'Legal');
      expect(legalSection).toBeDefined();
      const linkTitles = legalSection?.links.map((l) => l.title) ?? [];
      expect(linkTitles).toContain('Privacy');
    });
  });

  describe('navigation combined export', () => {
    it('exports a NavigationData object', () => {
      expect(navigation).toHaveProperty('header');
      expect(navigation).toHaveProperty('footer');
    });

    it('header matches headerNav export', () => {
      expect(navigation.header).toEqual(headerNav);
    });

    it('footer matches footerNav export', () => {
      expect(navigation.footer).toEqual(footerNav);
    });
  });

  describe('type safety', () => {
    it('NavLink interface is correctly typed', () => {
      const testLink: NavLink = {
        title: 'Test',
        url: '/test/',
      };
      expect(testLink.title).toBe('Test');
      expect(testLink.url).toBe('/test/');
    });

    it('FooterSection interface is correctly typed', () => {
      const testSection: FooterSection = {
        title: 'Test Section',
        links: [{ title: 'Link', url: '/link/' }],
      };
      expect(testSection.title).toBe('Test Section');
      expect(testSection.links).toHaveLength(1);
    });

    it('NavigationData interface is correctly typed', () => {
      const testNav: NavigationData = {
        header: [{ title: 'Home', url: '/' }],
        footer: [{ title: 'Section', links: [] }],
      };
      expect(testNav.header).toHaveLength(1);
      expect(testNav.footer).toHaveLength(1);
    });
  });

  describe('no duplicate links', () => {
    it('headerNav has no duplicate URLs', () => {
      const urls = headerNav.map((link) => link.url);
      const uniqueUrls = [...new Set(urls)];
      expect(urls.length).toBe(uniqueUrls.length);
    });

    it('each footer section has no duplicate URLs', () => {
      footerNav.forEach((section) => {
        const urls = section.links.map((link) => link.url);
        const uniqueUrls = [...new Set(urls)];
        expect(urls.length).toBe(uniqueUrls.length);
      });
    });
  });
});
