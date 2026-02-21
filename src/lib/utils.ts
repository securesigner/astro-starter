import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes with conflict resolution
 * @param inputs - Class values to merge (strings, arrays, or conditional objects)
 * @returns Merged class string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date for display (e.g., "January 15, 2026")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date as ISO string for datetime attributes
 */
export function formatDateISO(date: Date): string {
  return date.toISOString();
}

/**
 * Calculate reading time from content
 * @param content - The text content to analyze
 * @param wordsPerMinute - Reading speed (default: 200 WPM)
 * @returns Object with readingTime (minutes) and wordCount
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute = 200
): { readingTime: number; wordCount: number } {
  // Strip HTML tags and count words
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return { readingTime, wordCount };
}
