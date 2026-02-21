/**
 * Unit Tests for src/lib/utils.ts
 *
 * Tests utility functions:
 * - cn: Class name merging (clsx + tailwind-merge)
 * - formatDate: Date formatting for display
 * - formatDateISO: ISO date string formatting
 * - calculateReadingTime: Reading time calculation from content
 */

import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDateISO, calculateReadingTime } from '../../src/lib/utils';

describe('cn (class name utility)', () => {
  it('should merge simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const condition1 = true;
    const condition2 = false;
    expect(cn('base', condition1 && 'included', condition2 && 'excluded')).toBe('base included');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('should merge conflicting Tailwind classes (last wins)', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('mt-2 mb-4', 'mt-8')).toBe('mb-4 mt-8');
  });

  it('should handle object syntax', () => {
    expect(cn({ 'text-red-500': true, 'bg-blue-500': false })).toBe('text-red-500');
  });

  it('should handle array syntax', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('should return empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('should handle empty strings', () => {
    expect(cn('', 'foo', '', 'bar', '')).toBe('foo bar');
  });

  it('should preserve non-conflicting Tailwind classes', () => {
    expect(cn('px-4 py-2', 'hover:bg-gray-100')).toBe('px-4 py-2 hover:bg-gray-100');
  });

  it('should handle complex Tailwind class merging', () => {
    // Base classes with overrides
    expect(cn('rounded-md bg-white p-4', 'bg-gray-100 rounded-lg')).toBe(
      'p-4 bg-gray-100 rounded-lg'
    );
  });
});

describe('formatDate', () => {
  it('should format a valid date correctly', () => {
    const date = new Date(Date.UTC(2024, 5, 15, 12));
    const result = formatDate(date);
    expect(result).toMatch(/June\s+15,\s+2024/);
  });

  it('should format first day of year', () => {
    const date = new Date(Date.UTC(2024, 0, 1, 12));
    const result = formatDate(date);
    expect(result).toMatch(/January\s+1,\s+2024/);
  });

  it('should format last day of year', () => {
    const date = new Date(Date.UTC(2024, 11, 31, 12));
    const result = formatDate(date);
    expect(result).toMatch(/December\s+31,\s+2024/);
  });

  it('should handle dates from different years', () => {
    const oldDate = new Date(Date.UTC(2020, 2, 10, 12));
    const futureDate = new Date(Date.UTC(2030, 6, 22, 12));
    expect(formatDate(oldDate)).toMatch(/March\s+10,\s+2020/);
    expect(formatDate(futureDate)).toMatch(/July\s+22,\s+2030/);
  });

  it('should handle single-digit days correctly', () => {
    const date = new Date(Date.UTC(2024, 4, 5, 12));
    const result = formatDate(date);
    expect(result).toMatch(/May\s+5,\s+2024/);
  });
});

describe('formatDateISO', () => {
  it('should return ISO 8601 formatted string', () => {
    const date = new Date('2024-06-15T12:00:00Z');
    const result = formatDateISO(date);
    expect(result).toBe('2024-06-15T12:00:00.000Z');
  });

  it('should include time component', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const result = formatDateISO(date);
    expect(result).toContain('T');
    expect(result).toContain('Z');
  });

  it('should be valid ISO 8601 format', () => {
    const date = new Date();
    const result = formatDateISO(date);
    // ISO 8601 pattern: YYYY-MM-DDTHH:mm:ss.sssZ
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should round-trip back to equivalent Date', () => {
    const original = new Date('2024-06-15T14:30:45.123Z');
    const isoString = formatDateISO(original);
    const parsed = new Date(isoString);
    expect(parsed.getTime()).toBe(original.getTime());
  });
});

describe('calculateReadingTime', () => {
  it('should calculate reading time for normal content', () => {
    // 200 words at 200 WPM = 1 minute
    const content = 'word '.repeat(200);
    const result = calculateReadingTime(content);
    expect(result.readingTime).toBe(1);
    expect(result.wordCount).toBe(200);
  });

  it('should return minimum 1 minute for short content', () => {
    const content = 'Hello world';
    const result = calculateReadingTime(content);
    expect(result.readingTime).toBe(1);
    expect(result.wordCount).toBe(2);
  });

  it('should handle empty string', () => {
    const result = calculateReadingTime('');
    expect(result.readingTime).toBe(1);
    expect(result.wordCount).toBe(0);
  });

  it('should handle whitespace-only content', () => {
    const result = calculateReadingTime('   \n\t   ');
    expect(result.readingTime).toBe(1);
    expect(result.wordCount).toBe(0);
  });

  it('should strip HTML tags before counting', () => {
    const content = '<p>Hello</p> <strong>world</strong> <a href="#">link</a>';
    const result = calculateReadingTime(content);
    expect(result.wordCount).toBe(3);
  });

  it('should handle complex HTML content', () => {
    const htmlContent = `
      <article>
        <h1>Title Here</h1>
        <p>This is a <strong>paragraph</strong> with <em>formatting</em>.</p>
        <ul>
          <li>Item one</li>
          <li>Item two</li>
        </ul>
      </article>
    `;
    const result = calculateReadingTime(htmlContent);
    // "Title Here This is a paragraph with formatting Item one Item two"
    expect(result.wordCount).toBe(12);
    expect(result.readingTime).toBe(1);
  });

  it('should use custom words per minute', () => {
    // 400 words at 100 WPM = 4 minutes
    const content = 'word '.repeat(400);
    const result = calculateReadingTime(content, 100);
    expect(result.readingTime).toBe(4);
    expect(result.wordCount).toBe(400);
  });

  it('should round up reading time', () => {
    // 250 words at 200 WPM = 1.25 minutes, rounds up to 2
    const content = 'word '.repeat(250);
    const result = calculateReadingTime(content);
    expect(result.readingTime).toBe(2);
    expect(result.wordCount).toBe(250);
  });

  it('should handle very long content', () => {
    // 2000 words at 200 WPM = 10 minutes
    const content = 'word '.repeat(2000);
    const result = calculateReadingTime(content);
    expect(result.readingTime).toBe(10);
    expect(result.wordCount).toBe(2000);
  });

  it('should handle content with multiple spaces', () => {
    const content = 'one   two    three     four';
    const result = calculateReadingTime(content);
    expect(result.wordCount).toBe(4);
  });

  it('should handle content with newlines and tabs', () => {
    const content = 'one\ntwo\tthree\n\nfour';
    const result = calculateReadingTime(content);
    expect(result.wordCount).toBe(4);
  });

  it('should handle content with only HTML tags', () => {
    const content = '<div><span></span></div><br />';
    const result = calculateReadingTime(content);
    expect(result.wordCount).toBe(0);
    expect(result.readingTime).toBe(1);
  });
});
