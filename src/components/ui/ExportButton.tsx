import { Download } from 'lucide-react';
import { exportToCSV, exportToJSON } from '@/utils/exportData';

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename: string;
  columns: (keyof T)[];
  disabled?: boolean;
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename,
  columns,
  disabled = false,
}: ExportButtonProps<T>) {
  if (data.length === 0 || disabled) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => exportToCSV(data, filename, columns)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        title="Export as CSV"
      >
        <Download className="w-4 h-4" />
        CSV
      </button>
      <button
        type="button"
        onClick={() => exportToJSON(data, filename)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        title="Export as JSON"
      >
        <Download className="w-4 h-4" />
        JSON
      </button>
    </div>
  );
}

export default ExportButton;
