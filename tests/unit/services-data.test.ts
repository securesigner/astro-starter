/**
 * Unit Tests for Services Data Module
 *
 * Tests the services data exports:
 * - services array structure
 * - getServiceBySlug function
 * - Type validation
 */

import { describe, it, expect } from 'vitest';
import { services, getServiceBySlug, type ServiceSummary, type ServiceIcon } from '../../src/data/services';

describe('services data', () => {
  describe('services array', () => {
    it('exports an array of services', () => {
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
    });

    it('each service has required properties', () => {
      services.forEach((service) => {
        expect(service).toHaveProperty('title');
        expect(service).toHaveProperty('icon');
        expect(service).toHaveProperty('description');
        expect(typeof service.title).toBe('string');
        expect(typeof service.icon).toBe('string');
        expect(typeof service.description).toBe('string');
      });
    });

    it('each service has non-empty title and description', () => {
      services.forEach((service) => {
        expect(service.title.length).toBeGreaterThan(0);
        expect(service.description.length).toBeGreaterThan(0);
      });
    });

    it('services with slugs have valid slug format', () => {
      const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      services.forEach((service) => {
        if (service.slug) {
          expect(service.slug).toMatch(slugPattern);
        }
      });
    });

    it('each service has a valid icon type', () => {
      const validIcons: ServiceIcon[] = [
        'web-design',
        'consulting',
        'support',
      ];
      services.forEach((service) => {
        expect(validIcons).toContain(service.icon);
      });
    });
  });

  describe('getServiceBySlug', () => {
    it('returns service for valid slug', () => {
      const service = getServiceBySlug('web-design');
      expect(service).toBeDefined();
      expect(service?.title).toBe('Web Design');
    });

    it('returns undefined for non-existent slug', () => {
      const service = getServiceBySlug('non-existent-service');
      expect(service).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const service = getServiceBySlug('');
      expect(service).toBeUndefined();
    });

    it('is case-sensitive', () => {
      const service = getServiceBySlug('Web-Design');
      expect(service).toBeUndefined();
    });

    it('returns correct service for each existing slug', () => {
      const slugs = services
        .filter((s): s is ServiceSummary & { slug: string } => s.slug !== undefined)
        .map((s) => s.slug);

      slugs.forEach((slug) => {
        const service = getServiceBySlug(slug);
        expect(service).toBeDefined();
        expect(service?.slug).toBe(slug);
      });
    });

    it('returns service with all expected properties', () => {
      const service = getServiceBySlug('consulting');
      expect(service).toBeDefined();
      expect(service).toHaveProperty('title');
      expect(service).toHaveProperty('icon');
      expect(service).toHaveProperty('description');
      expect(service).toHaveProperty('slug');
    });
  });

  describe('type safety', () => {
    it('ServiceSummary interface is correctly typed', () => {
      const testService: ServiceSummary = {
        title: 'Test Service',
        icon: 'consulting',
        description: 'Test description',
        slug: 'test-service',
      };
      expect(testService.title).toBe('Test Service');
    });

    it('ServiceIcon union type includes all valid icons', () => {
      const icons: ServiceIcon[] = [
        'web-design',
        'consulting',
        'support',
      ];
      expect(icons).toHaveLength(3);
    });
  });
});
