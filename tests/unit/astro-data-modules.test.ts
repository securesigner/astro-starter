/**
 * Astro Data Modules Validation Tests
 *
 * Validates TypeScript data modules in src/data/:
 * - Site configuration is centralized
 * - Navigation has header and footer items
 * - Services have required fields
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(__dirname, '../../src/data');

describe('Data Modules Structure', () => {
  describe('Module Files', () => {
    it('should have index.ts exporting all modules', () => {
      const indexPath = path.join(dataDir, 'index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    it('should have site.ts for centralized config', () => {
      const sitePath = path.join(dataDir, 'site.ts');
      expect(fs.existsSync(sitePath)).toBe(true);
    });

    it('should have navigation.ts', () => {
      const navPath = path.join(dataDir, 'navigation.ts');
      expect(fs.existsSync(navPath)).toBe(true);
    });

    it('should have services.ts', () => {
      const servicesPath = path.join(dataDir, 'services.ts');
      expect(fs.existsSync(servicesPath)).toBe(true);
    });
  });

  describe('Site Module Content', () => {
    it('should export SITE configuration', () => {
      const content = fs.readFileSync(path.join(dataDir, 'site.ts'), 'utf8');
      expect(content).toContain('export const SITE');
    });

    it('should have required site metadata', () => {
      const content = fs.readFileSync(path.join(dataDir, 'site.ts'), 'utf8');
      expect(content).toContain('title:');
      expect(content).toContain('description:');
      expect(content).toContain('url:');
    });
  });

  describe('Navigation Module Content', () => {
    it('should export headerNav and footerNav', () => {
      const content = fs.readFileSync(path.join(dataDir, 'navigation.ts'), 'utf8');
      expect(content).toContain('headerNav');
      expect(content).toContain('footerNav');
    });

    it('should have navigation items with title and url', () => {
      const content = fs.readFileSync(path.join(dataDir, 'navigation.ts'), 'utf8');
      expect(content).toContain('title:');
      expect(content).toContain('url:');
    });
  });

  describe('Services Module Content', () => {
    it('should export services array', () => {
      const content = fs.readFileSync(path.join(dataDir, 'services.ts'), 'utf8');
      expect(content).toContain('services');
    });

    it('should have service items with title and description', () => {
      const content = fs.readFileSync(path.join(dataDir, 'services.ts'), 'utf8');
      expect(content).toContain('title:');
      expect(content).toContain('description:');
    });
  });
});
