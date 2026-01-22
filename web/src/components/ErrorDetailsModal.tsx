'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
  Download,
  ChevronDown,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getFileErrors } from '@/lib/api/file-upload';
import type {
  FileError,
  FileErrorSummary,
  ErrorSeverity,
} from '@/types/file-import';

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileType: string;
  portfolioName: string;
  batchId: string;
}

const severityConfig: Record<
  ErrorSeverity,
  {
    icon: React.ElementType;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
    bgClass: string;
    label: string;
  }
> = {
  Critical: {
    icon: AlertCircle,
    badgeVariant: 'destructive',
    bgClass: 'bg-red-50',
    label: 'Critical',
  },
  Warning: {
    icon: AlertTriangle,
    badgeVariant: 'secondary',
    bgClass: 'bg-yellow-50',
    label: 'Warning',
  },
  Info: {
    icon: Info,
    badgeVariant: 'outline',
    bgClass: 'bg-blue-50',
    label: 'Info',
  },
};

export function ErrorDetailsModal({
  isOpen,
  onClose,
  fileId,
  fileType,
  portfolioName,
  batchId,
}: ErrorDetailsModalProps) {
  // State
  const [errors, setErrors] = useState<FileError[]>([]);
  const [summary, setSummary] = useState<FileErrorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Fetch errors
  const fetchErrors = useCallback(
    async (page: number, append: boolean = false) => {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const severity = severityFilter === 'all' ? undefined : severityFilter;
        const response = await getFileErrors(batchId, fileId, page, severity);

        if (append) {
          setErrors((prev) => [...prev, ...response.errors]);
        } else {
          setErrors(response.errors);
        }

        setSummary(response.summary);
        setHasMore(response.hasMore);
        setCurrentPage(page);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load errors. Please try again later.';
        setError(message);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [batchId, fileId, severityFilter],
  );

  // Initial load
  useEffect(() => {
    if (isOpen && fileId) {
      setErrors([]);
      setSummary(null);
      setCurrentPage(1);
      setExpandedRows(new Set());
      fetchErrors(1);
    }
  }, [isOpen, fileId, fetchErrors]);

  // Reload when filter changes
  useEffect(() => {
    if (isOpen && fileId) {
      setErrors([]);
      setCurrentPage(1);
      setExpandedRows(new Set());
      fetchErrors(1);
    }
  }, [severityFilter, isOpen, fileId, fetchErrors]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    fetchErrors(currentPage + 1, true);
  }, [fetchErrors, currentPage]);

  // Handle row expansion
  const toggleRowExpanded = useCallback((rowNumber: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
      }
      return next;
    });
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    // Create CSV content
    const headers = [
      'Row Number',
      'Column',
      'Error Message',
      'Severity',
      'Original Value',
    ];
    const rows = errors.map((err) => [
      err.rowNumber.toString(),
      err.column,
      `"${err.message.replace(/"/g, '""')}"`,
      err.severity,
      err.originalValue ? `"${err.originalValue.replace(/"/g, '""')}"` : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `${fileType}-${portfolioName}-errors-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [errors, fileType, portfolioName]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
        aria-describedby="error-details-description"
      >
        <DialogHeader>
          <DialogTitle>
            Errors for {fileType} - {portfolioName}
          </DialogTitle>
        </DialogHeader>

        <p id="error-details-description" className="sr-only">
          View and filter file import errors for {fileType} file in{' '}
          {portfolioName}
        </p>

        {/* Summary */}
        {summary && (
          <div className="flex items-center gap-4 py-2 border-b">
            <span className="text-sm text-gray-600">
              {summary.totalErrors} total errors:
            </span>
            <span className="text-sm text-red-600 font-medium">
              {summary.criticalCount} Critical
            </span>
            <span className="text-sm text-yellow-600 font-medium">
              {summary.warningCount} Warnings
            </span>
            <span className="text-sm text-blue-600 font-medium">
              {summary.infoCount} Info
            </span>
          </div>
        )}

        {/* Large error set warning */}
        {summary && summary.totalErrors > 1000 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            Large number of errors detected. Consider fixing source file and
            re-importing.
          </div>
        )}

        {/* Filter and Export controls */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <label htmlFor="severity-filter" className="text-sm text-gray-600">
              Filter by Severity:
            </label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger id="severity-filter" className="w-[140px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={errors.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Errors
          </Button>
        </div>

        {/* Error list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading errors...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : errors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No errors found with the selected filter.
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 rounded-md text-sm font-medium text-gray-600">
                <div className="col-span-1">Row</div>
                <div className="col-span-2">Column</div>
                <div className="col-span-6">Error Message</div>
                <div className="col-span-2">Severity</div>
                <div className="col-span-1"></div>
              </div>

              {/* Error rows */}
              {errors.map((err, index) => {
                const config = severityConfig[err.severity];
                const SeverityIcon = config.icon;
                const isExpanded = expandedRows.has(err.rowNumber);

                return (
                  <div
                    key={`${err.rowNumber}-${err.column}-${index}`}
                    className={`border rounded-md overflow-hidden ${config.bgClass}`}
                  >
                    <div
                      className="grid grid-cols-12 gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50/50"
                      onClick={() => toggleRowExpanded(err.rowNumber)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleRowExpanded(err.rowNumber);
                        }
                      }}
                    >
                      <div className="col-span-1 text-sm font-medium">
                        {err.rowNumber}
                      </div>
                      <div
                        className="col-span-2 text-sm truncate"
                        title={err.column}
                      >
                        {err.column}
                      </div>
                      <div className="col-span-6 text-sm break-words">
                        {err.message}
                      </div>
                      <div className="col-span-2">
                        <Badge variant={config.badgeVariant}>
                          <SeverityIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-3 py-2 bg-white border-t text-sm">
                        {err.originalValue && (
                          <p>
                            <span className="font-medium">Original value:</span>{' '}
                            <code className="bg-gray-100 px-1 rounded">
                              {err.originalValue}
                            </code>
                          </p>
                        )}
                        {err.expectedFormat && (
                          <p className="mt-1">
                            <span className="font-medium">Expected:</span>{' '}
                            {err.expectedFormat}
                          </p>
                        )}
                        {!err.originalValue && !err.expectedFormat && (
                          <p className="text-gray-500 italic">
                            No additional details available.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Load More button */}
        {hasMore && !isLoading && (
          <div className="flex justify-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}

        {/* Close button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
