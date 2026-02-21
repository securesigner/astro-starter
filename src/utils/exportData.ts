/**
 * Shared data export utilities for CSV and JSON formats
 * Used across all research and tools components
 */

/**
 * Convert an array of objects to CSV format
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: (keyof T)[],
): string {
  if (data.length === 0) return '';

  // Header row
  const header = columns.map((col) => String(col)).join(',');

  // Data rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col];
        // Handle different value types
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const escaped = value.replace(/"/g, '""');
          return /[,"\n\r]/.test(value) ? `"${escaped}"` : escaped;
        }
        if (Array.isArray(value)) {
          const joined = value.join('; ');
          return `"${joined.replace(/"/g, '""')}"`;
        }
        return String(value);
      })
      .join(','),
  );

  return [header, ...rows].join('\n');
}

/**
 * Trigger a file download in the browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new globalThis.Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: (keyof T)[],
): void {
  const csv = convertToCSV(data, columns);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `${filename}-${timestamp}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export data to JSON file
 */
export function exportToJSON<T>(data: T[], filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    json,
    `${filename}-${timestamp}.json`,
    'application/json;charset=utf-8;',
  );
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format currency values
 */
export function formatCurrency(
  num: number,
  currency: string = 'USD',
  compact: boolean = false,
): string {
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      compactDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Generate ICS calendar file content
 */
export function generateICS(events: ICSEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AstroStarter//Research Tools//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    const uid = `${event.date}-${event.name.replace(/\s+/g, '-').toLowerCase()}@yourdomain.com`;
    const dtstart = event.date.replace(/-/g, '');
    // For all-day events, DTEND should be the day after DTSTART per RFC 5545
    // Use UTC-safe calculation to avoid timezone issues
    const [year, month, day] = event.date.split('-').map(Number);
    const endDateObj = new Date(Date.UTC(year, month - 1, day + 1));
    const dtend = endDateObj.toISOString().split('T')[0].replace(/-/g, '');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      `SUMMARY:${escapeICS(event.name)}`,
      event.description ? `DESCRIPTION:${escapeICS(event.description)}` : '',
      event.location ? `LOCATION:${escapeICS(event.location)}` : '',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.filter(Boolean).join('\r\n');
}

/**
 * Escape special characters for ICS format
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Export holidays to ICS calendar file
 */
export function exportToICS(events: ICSEvent[], filename: string): void {
  const ics = generateICS(events);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(
    ics,
    `${filename}-${timestamp}.ics`,
    'text/calendar;charset=utf-8;',
  );
}

/**
 * ICS Event interface
 */
export interface ICSEvent {
  date: string; // YYYY-MM-DD format
  name: string;
  description?: string;
  location?: string;
}
