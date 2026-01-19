'use client';

import { useState } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042';

interface ExportBatchListProps {
  totalBatches: number;
  filteredBatches: number;
  searchTerm?: string;
}

export function ExportBatchList({
  totalBatches,
  filteredBatches,
  searchTerm,
}: ExportBatchListProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLargeExportWarning, setShowLargeExportWarning] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [exportStep, setExportStep] = useState<string | null>(null);

  const hasFilters = totalBatches !== filteredBatches;
  const isLargeExport = totalBatches > 1000;

  const formatDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const downloadCSV = async (includeFiltered: boolean) => {
    setLoading(true);
    setError(null);
    setDownloadReady(false);
    setExportStep('Preparing export... (Step 1 of 2)');

    try {
      const queryParams = new URLSearchParams({
        includeFiltered: String(includeFiltered),
      });

      if (searchTerm) {
        queryParams.set('search', searchTerm);
      }

      const response = await fetch(
        `${API_BASE_URL}/v1/report-batches/export?${queryParams}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'text/csv' },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.Messages?.[0] ||
            'Unable to export batches. Please try again later.',
        );
      }

      setExportStep('Downloading... (Step 2 of 2)');
      const blob = await response.blob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-batches-${formatDate()}.csv`;

      try {
        link.click();
        setDownloadReady(true);
      } catch {
        setError('Please allow downloads from this site');
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // Network errors (TypeError) get a friendly message
      if (err instanceof TypeError) {
        setError('Unable to export batches. Please try again later.');
      } else if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          setError(
            'Export timed out. Try exporting fewer rows or contact support.',
          );
        } else {
          setError(err.message);
        }
      } else {
        setError('Unable to export batches. Please try again later.');
      }
    } finally {
      setLoading(false);
      setExportStep(null);
      setShowConfirmation(false);
      setShowLargeExportWarning(false);
    }
  };

  const handleExportClick = () => {
    // No batches to export
    if (totalBatches === 0) {
      setError('No batches to export');
      return;
    }

    // Large export warning
    if (isLargeExport && !showLargeExportWarning) {
      setShowLargeExportWarning(true);
      return;
    }

    // Show confirmation if filters are applied
    if (hasFilters && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    // No filters, export all immediately
    downloadCSV(false);
  };

  const handleExportAll = () => {
    downloadCSV(false);
  };

  const handleExportFiltered = () => {
    downloadCSV(true);
  };

  const handleContinueLargeExport = () => {
    setShowLargeExportWarning(false);
    if (hasFilters) {
      setShowConfirmation(true);
    } else {
      downloadCSV(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800 whitespace-nowrap z-10">
          {error}
        </div>
      )}

      {/* Download ready message */}
      {downloadReady && !error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 whitespace-nowrap z-10">
          Download ready
        </div>
      )}

      {/* Loading step indicator */}
      {exportStep && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800 whitespace-nowrap z-10">
          {exportStep}
        </div>
      )}

      {/* Large export warning */}
      {showLargeExportWarning && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded shadow-lg z-10 min-w-[300px]">
          <p className="text-sm text-yellow-800 mb-3">
            Large export (1000+ rows) may take a moment. Continue?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleContinueLargeExport}
              className="px-3 py-1.5 text-sm font-medium text-white bg-yellow-600 rounded hover:bg-yellow-700"
            >
              Continue
            </button>
            <button
              onClick={() => setShowLargeExportWarning(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Export confirmation (filters applied) */}
      {showConfirmation && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[300px]">
          <p className="text-sm text-gray-700 mb-3">
            Export all batches ({totalBatches}) or only filtered results (
            {filteredBatches})?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportAll}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Export All
            </button>
            <button
              onClick={handleExportFiltered}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Export Filtered
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Export button */}
      <button
        onClick={handleExportClick}
        disabled={loading}
        title="Download batch list as CSV file"
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Exporting...
          </>
        ) : (
          'Export to CSV'
        )}
      </button>
    </div>
  );
}
