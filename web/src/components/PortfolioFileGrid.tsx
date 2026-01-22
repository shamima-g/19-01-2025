'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Loader2, Pause, Play, ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileStatusCell } from '@/components/FileStatusCell';
import { FileImportPopup } from '@/components/FileImportPopup';
import { ErrorDetailsModal } from '@/components/ErrorDetailsModal';
import { getPortfolioFilesGrid, cancelFileImport } from '@/lib/api/file-upload';
import { useToast } from '@/contexts/ToastContext';
import type {
  PortfolioRow,
  PortfolioFileStatusData,
} from '@/types/file-import';

interface PortfolioFileGridProps {
  batchId: string;
  batchName?: string;
  onProceedToOtherFiles?: () => void;
}

type FileTypeKey =
  | 'holdings'
  | 'transactions'
  | 'cashFlow'
  | 'benchmark'
  | 'performance'
  | 'risk'
  | 'compliance';

const FILE_TYPE_COLUMNS: { key: FileTypeKey; label: string }[] = [
  { key: 'holdings', label: 'Holdings' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'cashFlow', label: 'Cash Flow' },
  { key: 'benchmark', label: 'Benchmark' },
  { key: 'performance', label: 'Performance' },
  { key: 'risk', label: 'Risk' },
  { key: 'compliance', label: 'Compliance' },
];

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export function PortfolioFileGrid({
  batchId,
  batchName,
  onProceedToOtherFiles,
}: PortfolioFileGridProps) {
  const { showToast } = useToast();

  // Data state
  const [portfolios, setPortfolios] = useState<PortfolioRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh state
  const [autoRefreshPaused, setAutoRefreshPaused] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('autoRefreshPaused') === 'true';
    }
    return false;
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshErrorCount, setRefreshErrorCount] = useState(0);

  // Upload popup state
  const [uploadPopup, setUploadPopup] = useState<{
    isOpen: boolean;
    portfolioId: string;
    portfolioName: string;
    fileType: string;
    mode: 'upload' | 'reimport';
    currentFileName?: string;
  }>({
    isOpen: false,
    portfolioId: '',
    portfolioName: '',
    fileType: '',
    mode: 'upload',
  });

  // Error modal state (placeholder for Story 2.4)
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    fileId: string;
    fileType: string;
    portfolioName: string;
  }>({
    isOpen: false,
    fileId: '',
    fileType: '',
    portfolioName: '',
  });

  // Check if any files are processing
  const hasProcessingFiles = useMemo(() => {
    return portfolios.some((portfolio) =>
      Object.values(portfolio.files).some(
        (file) => file.status === 'Processing',
      ),
    );
  }, [portfolios]);

  // Fetch portfolio files
  const fetchData = useCallback(
    async (showLoadingState: boolean = true) => {
      if (showLoadingState) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await getPortfolioFilesGrid(batchId);
        // Sort portfolios alphabetically by name
        const sortedPortfolios = [...response.portfolios].sort((a, b) =>
          a.portfolioName.localeCompare(b.portfolioName),
        );
        setPortfolios(sortedPortfolios);
        setLastUpdated(new Date());
        setRefreshErrorCount(0);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load file status. Please try again later.';
        setError(message);

        if (!showLoadingState) {
          // This is a refresh failure
          setRefreshErrorCount((prev) => prev + 1);
          showToast({
            variant: 'error',
            title: 'Auto-refresh failed',
            message: 'Retrying in 30 seconds...',
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [batchId, showToast],
  );

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh logic
  useEffect(() => {
    // Don't auto-refresh if paused, no processing files, or too many errors
    if (autoRefreshPaused || !hasProcessingFiles || refreshErrorCount >= 3) {
      return;
    }

    const intervalId = setInterval(() => {
      setIsRefreshing(true);
      fetchData(false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [autoRefreshPaused, hasProcessingFiles, refreshErrorCount, fetchData]);

  // Persist auto-refresh pause state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('autoRefreshPaused', String(autoRefreshPaused));
    }
  }, [autoRefreshPaused]);

  // Manual refresh
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshPaused((prev) => !prev);
  }, []);

  // Handle upload click
  const handleUpload = useCallback(
    (portfolioId: string, fileType: string) => {
      const portfolio = portfolios.find((p) => p.portfolioId === portfolioId);
      if (portfolio) {
        setUploadPopup({
          isOpen: true,
          portfolioId,
          portfolioName: portfolio.portfolioName,
          fileType,
          mode: 'upload',
        });
      }
    },
    [portfolios],
  );

  // Handle reimport click
  const handleReimport = useCallback(
    (portfolioId: string, fileType: string, currentFileName?: string) => {
      const portfolio = portfolios.find((p) => p.portfolioId === portfolioId);
      if (portfolio) {
        setUploadPopup({
          isOpen: true,
          portfolioId,
          portfolioName: portfolio.portfolioName,
          fileType,
          mode: 'reimport',
          currentFileName,
        });
      }
    },
    [portfolios],
  );

  // Handle view errors click
  const handleViewErrors = useCallback(
    (fileId: string, fileType: string, portfolioName: string) => {
      setErrorModal({
        isOpen: true,
        fileId,
        fileType,
        portfolioName,
      });
    },
    [],
  );

  // Handle cancel import
  const handleCancel = useCallback(
    async (fileId: string) => {
      try {
        await cancelFileImport(batchId, fileId);
        showToast({
          variant: 'success',
          title: 'Import canceled',
          message: 'Import canceled successfully',
        });
        fetchData(false);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to cancel import. Please try again or contact support.';
        showToast({
          variant: 'error',
          title: 'Cancel failed',
          message: message,
        });
      }
    },
    [batchId, fetchData, showToast],
  );

  // Handle upload popup close
  const handleUploadPopupClose = useCallback(() => {
    setUploadPopup((prev) => ({ ...prev, isOpen: false }));
    // Refresh data after upload/reimport
    fetchData(false);
  }, [fetchData]);

  // Handle proceed to other files
  const handleProceed = useCallback(() => {
    if (onProceedToOtherFiles) {
      onProceedToOtherFiles();
    }
  }, [onProceedToOtherFiles]);

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <p className="text-gray-500">Loading portfolio files...</p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">
                  Portfolio
                </TableHead>
                {FILE_TYPE_COLUMNS.map((col) => (
                  <TableHead key={col.key} className="min-w-[160px]">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((row) => (
                <TableRow key={row}>
                  <TableCell className="sticky left-0 bg-white z-10">
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                  {FILE_TYPE_COLUMNS.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-24 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && portfolios.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchData()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // Render empty state
  if (portfolios.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No portfolios found for this batch. Please configure portfolios first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Portfolio Files {batchName && `- ${batchName}`}
          </h2>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated:{' '}
              {lastUpdated.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
          {isRefreshing && (
            <span className="flex items-center text-sm text-blue-600">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-refresh status */}
          {hasProcessingFiles && refreshErrorCount < 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoRefresh}
              title={
                autoRefreshPaused ? 'Resume auto-refresh' : 'Pause auto-refresh'
              }
            >
              {autoRefreshPaused ? (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume auto-refresh
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause auto-refresh
                </>
              )}
            </Button>
          )}

          {refreshErrorCount >= 3 && (
            <span className="text-sm text-red-600">
              Auto-refresh disabled due to errors. Click Refresh Now to retry.
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-20">
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-30 min-w-[200px] font-semibold">
                Portfolio
              </TableHead>
              {FILE_TYPE_COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className="min-w-[160px] font-semibold"
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolios.map((portfolio) => {
              // Check if all files for this portfolio are success
              const allSuccess = Object.values(portfolio.files).every(
                (file) => file.status === 'Success',
              );

              return (
                <TableRow
                  key={portfolio.portfolioId}
                  className={allSuccess ? 'border-l-4 border-l-green-500' : ''}
                >
                  <TableCell className="sticky left-0 bg-white z-10 font-medium">
                    {portfolio.portfolioName}
                  </TableCell>
                  {FILE_TYPE_COLUMNS.map((col) => {
                    const fileData = portfolio.files[
                      col.key
                    ] as PortfolioFileStatusData;
                    return (
                      <TableCell key={col.key} className="p-2">
                        <FileStatusCell
                          data={fileData}
                          fileType={col.label}
                          portfolioId={portfolio.portfolioId}
                          portfolioName={portfolio.portfolioName}
                          onUpload={handleUpload}
                          onReimport={handleReimport}
                          onViewErrors={handleViewErrors}
                          onCancel={handleCancel}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Proceed to Other Files button */}
      {onProceedToOtherFiles && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleProceed} disabled={isLoading}>
            Proceed to Other Files
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Upload/Reimport Popup */}
      <FileImportPopup
        isOpen={uploadPopup.isOpen}
        onClose={handleUploadPopupClose}
        portfolioName={uploadPopup.portfolioName}
        fileType={uploadPopup.fileType}
        mode={uploadPopup.mode}
        currentFileName={uploadPopup.currentFileName}
        batchId={batchId}
        portfolioId={uploadPopup.portfolioId}
      />

      {/* Error Details Modal - Story 2.4 */}
      <ErrorDetailsModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
        fileId={errorModal.fileId}
        fileType={errorModal.fileType}
        portfolioName={errorModal.portfolioName}
        batchId={batchId}
      />
    </div>
  );
}
