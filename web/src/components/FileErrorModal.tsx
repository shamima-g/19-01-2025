'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/contexts/ToastContext';
import { getFileErrors, exportFileErrors } from '@/lib/api/portfolio-files';
import type {
  FileError,
  ErrorSummary,
  ErrorSeverity,
  PortfolioFileType,
} from '@/types/portfolio-file';

interface FileErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  portfolioId: string;
  portfolioName: string;
  fileType: PortfolioFileType;
  fileName: string;
}

export function FileErrorModal({
  isOpen,
  onClose,
  batchId,
  portfolioId,
  portfolioName,
  fileType,
  fileName,
}: FileErrorModalProps) {
  const { showToast } = useToast();
  const [errors, setErrors] = useState<FileError[]>([]);
  const [summary, setSummary] = useState<ErrorSummary | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState<ErrorSeverity | 'all'>(
    'all',
  );

  const loadErrors = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await getFileErrors(batchId, portfolioId, fileType, {
          page: pageNum,
          pageSize: 20,
          severity: severityFilter === 'all' ? undefined : severityFilter,
        });

        if (append) {
          setErrors((prev) => [...prev, ...response.errors]);
        } else {
          setErrors(response.errors);
        }
        setSummary(response.summary);
        setHasMore(response.hasMore);
        setPage(pageNum);
      } catch {
        showToast({
          title: 'Error',
          message: 'Failed to load file errors',
          variant: 'error',
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [batchId, portfolioId, fileType, severityFilter, showToast],
  );

  useEffect(() => {
    if (isOpen) {
      loadErrors(1);
    }
  }, [isOpen, loadErrors]);

  const handleSeverityChange = (value: string) => {
    setSeverityFilter(value as ErrorSeverity | 'all');
    setPage(1);
    loadErrors(1);
  };

  const handleLoadMore = () => {
    loadErrors(page + 1, true);
  };

  const handleExport = async () => {
    try {
      const blob = await exportFileErrors(batchId, portfolioId, fileType, {
        severity: severityFilter === 'all' ? undefined : severityFilter,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_errors.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast({
        title: 'Export Complete',
        message: 'Errors exported successfully',
        variant: 'success',
      });
    } catch {
      showToast({
        title: 'Export Failed',
        message: 'Failed to export errors',
        variant: 'error',
      });
    }
  };

  const getSeverityVariant = (
    severity: ErrorSeverity,
  ): 'destructive' | 'secondary' | 'outline' => {
    switch (severity) {
      case 'Critical':
        return 'destructive';
      case 'Warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
        aria-label={`Errors for ${fileName}`}
      >
        <DialogHeader>
          <DialogTitle>
            Errors for {portfolioName} - {fileName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            {summary && (
              <div className="flex items-center gap-4 py-2 border-b">
                <span className="font-medium">
                  {summary.totalErrors} total errors:
                </span>
                <span className="text-red-600">
                  {summary.criticalCount} critical
                </span>
                <span className="text-yellow-600">
                  {summary.warningCount} warnings
                </span>
                {summary.infoCount !== undefined && summary.infoCount > 0 && (
                  <span className="text-blue-600">
                    {summary.infoCount} info
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <label htmlFor="severity-filter" className="text-sm">
                  Filter by severity:
                </label>
                <Select
                  value={severityFilter}
                  onValueChange={handleSeverityChange}
                >
                  <SelectTrigger
                    id="severity-filter"
                    className="w-[150px]"
                    aria-label="Filter by severity"
                  >
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Warning">Warning</SelectItem>
                    <SelectItem value="Info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={handleExport}>
                Export Errors
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Row</TableHead>
                    <TableHead className="w-32">Column</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-24">Severity</TableHead>
                    <TableHead className="w-32">Original Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map((error, index) => (
                    <TableRow
                      key={`${error.rowNumber}-${error.column}-${index}`}
                    >
                      <TableCell>{error.rowNumber}</TableCell>
                      <TableCell>{error.column}</TableCell>
                      <TableCell>{error.message}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(error.severity)}>
                          {error.severity}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="font-mono text-sm"
                        title={error.originalValue}
                      >
                        {error.originalValue || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {hasMore && (
              <div className="flex justify-center py-2">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
