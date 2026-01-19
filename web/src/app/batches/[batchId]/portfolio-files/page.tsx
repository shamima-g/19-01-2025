'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { FileStatusBadge } from '@/components/FileStatusBadge';
import { FileErrorModal } from '@/components/FileErrorModal';
import { CancelImportDialog } from '@/components/CancelImportDialog';
import { useToast } from '@/contexts/ToastContext';
import {
  getPortfolioFiles,
  uploadPortfolioFile,
} from '@/lib/api/portfolio-files';
import {
  FILE_TYPE_LABELS,
  type Portfolio,
  type PortfolioFileType,
  type PortfolioFile,
} from '@/types/portfolio-file';

const FILE_TYPES: PortfolioFileType[] = [
  'holdings',
  'transactions',
  'cashFlow',
  'benchmark',
  'performance',
  'risk',
  'compliance',
];

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

function truncateFileName(fileName: string, maxLength = 20): string {
  if (fileName.length <= maxLength) return fileName;
  const ext = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.slice(0, maxLength - ext.length - 4);
  return `${truncatedName}...${ext}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

function formatUploader(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}. ${parts[parts.length - 1]}`;
  }
  return name;
}

function hasProcessingFiles(portfolios: Portfolio[]): boolean {
  return portfolios.some((portfolio) =>
    Object.values(portfolio.files).some(
      (file) => (file as PortfolioFile).status === 'Processing',
    ),
  );
}

function allFilesPending(portfolios: Portfolio[]): boolean {
  return portfolios.every((portfolio) =>
    Object.values(portfolio.files).every(
      (file) => (file as PortfolioFile).status === 'Pending',
    ),
  );
}

function getRowBorderClass(
  files: Record<PortfolioFileType, PortfolioFile>,
): string {
  const allSuccess = Object.values(files).every((f) => f.status === 'Success');
  if (allSuccess) return 'border-l-4 border-green-500';

  const hasFailed = Object.values(files).some(
    (f) => f.status === 'Failed' || f.status === 'Warning',
  );
  if (hasFailed) return 'border-l-4 border-red-500';

  const hasProcessing = Object.values(files).some(
    (f) => f.status === 'Processing',
  );
  if (hasProcessing) return 'border-l-4 border-yellow-500';

  return 'border-l-4 border-gray-300';
}

export default function PortfolioFileDashboard() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const batchId = params.batchId as string;

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshPaused, setAutoRefreshPaused] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  // Modal states
  const [errorModalState, setErrorModalState] = useState<{
    isOpen: boolean;
    portfolioId: string;
    portfolioName: string;
    fileType: PortfolioFileType;
    fileName: string;
  } | null>(null);

  const [cancelDialogState, setCancelDialogState] = useState<{
    isOpen: boolean;
    portfolioId: string;
    portfolioName: string;
    fileType: PortfolioFileType;
    fileName: string;
  } | null>(null);

  const [proceedWarningState, setProceedWarningState] = useState<{
    isOpen: boolean;
    message: string;
  } | null>(null);

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{
    portfolioId: string;
    fileType: PortfolioFileType;
    isReimport: boolean;
  } | null>(null);

  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadPortfolios = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }

      try {
        const response = await getPortfolioFiles(batchId);
        // Sort portfolios alphabetically
        const sorted = [...response.portfolios].sort((a, b) =>
          a.portfolioName.localeCompare(b.portfolioName),
        );
        setPortfolios(sorted);
        setLastUpdated(new Date());
        setError(null);
        setConsecutiveErrors(0);
      } catch {
        const newErrorCount = consecutiveErrors + 1;
        setConsecutiveErrors(newErrorCount);

        if (newErrorCount >= 3) {
          setAutoRefreshPaused(true);
          setError(
            'Auto-refresh disabled due to errors. Click "Refresh Now" to retry.',
          );
        } else {
          showToast({
            title: 'Refresh Failed',
            message: 'Auto-refresh failed. Retrying in 30 seconds...',
            variant: 'error',
          });
        }

        if (!showRefreshIndicator) {
          setError('Unable to load file status. Please try again.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [batchId, consecutiveErrors, showToast],
  );

  // Initial load
  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  // Auto-refresh logic
  useEffect(() => {
    const shouldAutoRefresh =
      !autoRefreshPaused &&
      portfolios.length > 0 &&
      hasProcessingFiles(portfolios);

    if (shouldAutoRefresh) {
      autoRefreshIntervalRef.current = setInterval(() => {
        loadPortfolios(true);
      }, AUTO_REFRESH_INTERVAL);
    }

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
        autoRefreshIntervalRef.current = null;
      }
    };
  }, [autoRefreshPaused, portfolios, loadPortfolios]);

  // Session storage for pause state
  useEffect(() => {
    const paused = sessionStorage.getItem('autoRefreshPaused') === 'true';
    setAutoRefreshPaused(paused);
  }, []);

  const handlePauseResume = () => {
    const newPaused = !autoRefreshPaused;
    setAutoRefreshPaused(newPaused);
    sessionStorage.setItem('autoRefreshPaused', String(newPaused));
  };

  const handleRefreshNow = () => {
    loadPortfolios(true);
  };

  const handleUploadClick = (
    portfolioId: string,
    fileType: PortfolioFileType,
    isReimport: boolean,
  ) => {
    setUploadTarget({ portfolioId, fileType, isReimport });
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !uploadTarget) return;

    try {
      await uploadPortfolioFile(
        batchId,
        uploadTarget.portfolioId,
        uploadTarget.fileType,
        file,
        { isReimport: uploadTarget.isReimport },
      );
      showToast({
        title: 'Upload Complete',
        message: 'File uploaded successfully',
        variant: 'success',
      });
      loadPortfolios(true);
    } catch (err) {
      showToast({
        title: 'Upload Failed',
        message: err instanceof Error ? err.message : 'Failed to upload file',
        variant: 'error',
      });
    } finally {
      setUploadTarget(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleViewErrors = (
    portfolioId: string,
    portfolioName: string,
    fileType: PortfolioFileType,
    fileName: string,
  ) => {
    setErrorModalState({
      isOpen: true,
      portfolioId,
      portfolioName,
      fileType,
      fileName,
    });
  };

  const handleCancelImport = (
    portfolioId: string,
    portfolioName: string,
    fileType: PortfolioFileType,
    fileName: string,
  ) => {
    setCancelDialogState({
      isOpen: true,
      portfolioId,
      portfolioName,
      fileType,
      fileName,
    });
  };

  const handleProceedToOtherFiles = () => {
    if (hasProcessingFiles(portfolios)) {
      setProceedWarningState({
        isOpen: true,
        message:
          'Files are still processing. Are you sure you want to proceed?',
      });
      return;
    }

    if (allFilesPending(portfolios)) {
      setProceedWarningState({
        isOpen: true,
        message:
          'No portfolio files have been uploaded. Are you sure you want to proceed?',
      });
      return;
    }

    navigateToOtherFiles();
  };

  const navigateToOtherFiles = () => {
    router.push(`/batches/${batchId}/other-files`);
  };

  const renderFileCell = (
    portfolio: Portfolio,
    fileType: PortfolioFileType,
  ) => {
    const file = portfolio.files[fileType];
    if (!file) {
      return (
        <TableCell key={fileType} className="text-center">
          -
        </TableCell>
      );
    }

    const renderActions = () => {
      switch (file.status) {
        case 'Pending':
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleUploadClick(portfolio.portfolioId, fileType, false)
              }
            >
              Upload
            </Button>
          );
        case 'Success':
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleUploadClick(portfolio.portfolioId, fileType, true)
              }
            >
              Re-import
            </Button>
          );
        case 'Warning':
        case 'Failed':
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleViewErrors(
                    portfolio.portfolioId,
                    portfolio.portfolioName,
                    fileType,
                    file.fileName || '',
                  )
                }
              >
                View Errors
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleUploadClick(portfolio.portfolioId, fileType, true)
                }
              >
                Re-import
              </Button>
            </div>
          );
        case 'Processing':
          return (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleCancelImport(
                  portfolio.portfolioId,
                  portfolio.portfolioName,
                  fileType,
                  file.fileName || '',
                )
              }
            >
              Cancel
            </Button>
          );
        default:
          return null;
      }
    };

    return (
      <TableCell key={fileType} className="min-w-[180px]">
        <div className="space-y-1">
          <FileStatusBadge status={file.status} progress={file.progress} />
          {file.fileName && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className="text-sm text-muted-foreground truncate cursor-help"
                    title={file.fileName}
                  >
                    {truncateFileName(file.fileName)}
                  </p>
                </TooltipTrigger>
                <TooltipContent>{file.fileName}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {file.uploadedAt && (
            <p className="text-xs text-muted-foreground">
              {formatDate(file.uploadedAt)}
              {file.uploadedBy && ` by ${formatUploader(file.uploadedBy)}`}
            </p>
          )}
          {file.errorCount !== undefined && file.errorCount > 0 && (
            <p className="text-xs text-red-600">
              {file.errorCount} error{file.errorCount !== 1 ? 's' : ''}
            </p>
          )}
          <div className="mt-1">{renderActions()}</div>
        </div>
      </TableCell>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <p className="text-muted-foreground">Loading portfolio files...</p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" role="progressbar" />
          ))}
        </div>
      </div>
    );
  }

  if (error && portfolios.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => loadPortfolios()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio File Dashboard</h1>
          <p className="text-muted-foreground">Batch: {batchId}</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {isRefreshing && (
            <span className="text-sm text-blue-600">Updating...</span>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push('/')}>
          ← Back to Start
        </Button>
        <div className="flex items-center gap-2">
          {hasProcessingFiles(portfolios) && (
            <Button variant="outline" onClick={handlePauseResume}>
              {autoRefreshPaused ? 'Resume auto-refresh' : 'Pause auto-refresh'}
            </Button>
          )}
          <Button variant="outline" onClick={handleRefreshNow}>
            Refresh Now
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleProceedToOtherFiles}>
                  Proceed to Other Files →
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Continue to data verification phase
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Empty state */}
      {portfolios.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No portfolios found for this batch.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Portfolio file grid */}
      {portfolios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Files Import Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Portfolio</TableHead>
                    {FILE_TYPES.map((type) => (
                      <TableHead key={type} className="min-w-[180px]">
                        {FILE_TYPE_LABELS[type]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolios.map((portfolio) => (
                    <TableRow
                      key={portfolio.portfolioId}
                      className={getRowBorderClass(portfolio.files)}
                    >
                      <TableCell className="font-medium">
                        {portfolio.portfolioName}
                      </TableCell>
                      {FILE_TYPES.map((type) =>
                        renderFileCell(portfolio, type),
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelected}
      />

      {/* Error modal */}
      {errorModalState && (
        <FileErrorModal
          isOpen={errorModalState.isOpen}
          onClose={() => setErrorModalState(null)}
          batchId={batchId}
          portfolioId={errorModalState.portfolioId}
          portfolioName={errorModalState.portfolioName}
          fileType={errorModalState.fileType}
          fileName={errorModalState.fileName}
        />
      )}

      {/* Cancel import dialog */}
      {cancelDialogState && (
        <CancelImportDialog
          isOpen={cancelDialogState.isOpen}
          onClose={() => setCancelDialogState(null)}
          onCanceled={() => loadPortfolios(true)}
          batchId={batchId}
          portfolioId={cancelDialogState.portfolioId}
          portfolioName={cancelDialogState.portfolioName}
          fileType={cancelDialogState.fileType}
          fileName={cancelDialogState.fileName}
        />
      )}

      {/* Proceed warning dialog */}
      <Dialog
        open={proceedWarningState?.isOpen ?? false}
        onOpenChange={(open) => !open && setProceedWarningState(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warning</DialogTitle>
            <DialogDescription>
              {proceedWarningState?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProceedWarningState(null)}
            >
              Cancel
            </Button>
            <Button onClick={navigateToOtherFiles}>Proceed Anyway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Re-export for tests
export { PortfolioFileDashboard };
