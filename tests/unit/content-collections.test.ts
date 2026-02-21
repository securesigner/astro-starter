/**
 * Content Collection Validation Tests
 *
 * Validates content files in src/content/ match expected structure:
 * - Blog posts have required frontmatter
 * - Services have required fields
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const contentDir = path.resolve(__dirname, '../../src/content');

// Skip if content directory doesn't exist
const contentExists = fs.existsSync(contentDir);

/**
 * Parse YAML frontmatter from markdown file
 */
function parseFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result: Record<string, unknown> = {};

  // Simple YAML parsing (handles basic key: value pairs)
  const lines = yaml.split(/\r?\n/);
  let currentKey = '';
  let inArray = false;
  let arrayItems: string[] = [];

  for (const line of lines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      if (inArray && currentKey) {
        result[currentKey] = arrayItems;
        arrayItems = [];
        inArray = false;
      }

      const [, key, value] = keyMatch;
      currentKey = key;

      if (value.trim() === '') {
        // Could be start of array or object
        inArray = true;
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        result[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
      } else {
        result[key] = value.replace(/['"]/g, '').trim();
      }
    } else if (line.match(/^\s+-\s+(.*)$/)) {
      const itemMatch = line.match(/^\s+-\s+(.*)$/);
      if (itemMatch) {
        arrayItems.push(itemMatch[1].replace(/['"]/g, '').trim());
        inArray = true;
      }
    }
  }

  if (inArray && currentKey) {
    result[currentKey] = arrayItems;
  }

  return result;
}

/**
 * Get all markdown files in a directory
 */
function getMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

describe.skipIf(!contentExists)('Content Collection Validation', () => {
  describe('Blog Posts', () => {
    let blogFiles: string[] = [];

    beforeAll(() => {
      blogFiles = getMarkdownFiles(path.join(contentDir, 'blog'));
    });

    it('should have blog posts', () => {
      expect(blogFiles.length).toBeGreaterThan(0);
    });

    it('all blog posts should have title', () => {
      for (const file of blogFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const frontmatter = parseFrontmatter(content);
        expect(frontmatter, `Missing frontmatter in ${path.basename(file)}`).not.toBeNull();
        expect(frontmatter?.title, `Missing title in ${path.basename(file)}`).toBeDefined();
      }
    });

    it('all blog posts should have date', () => {
      for (const file of blogFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const frontmatter = parseFrontmatter(content);
        expect(frontmatter?.date, `Missing date in ${path.basename(file)}`).toBeDefined();
      }
    });
  });

  describe('Services', () => {
    let serviceFiles: string[] = [];

    beforeAll(() => {
      serviceFiles = getMarkdownFiles(path.join(contentDir, 'services'));
    });

    it('should have services', () => {
      expect(serviceFiles.length).toBeGreaterThan(0);
    });

    it('all services should have title', () => {
      for (const file of serviceFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const frontmatter = parseFrontmatter(content);
        expect(frontmatter, `Missing frontmatter in ${path.basename(file)}`).not.toBeNull();
        expect(frontmatter?.title, `Missing title in ${path.basename(file)}`).toBeDefined();
      }
    });
  });
});
