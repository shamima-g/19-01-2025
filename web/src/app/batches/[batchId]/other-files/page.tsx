'use client';

/**
 * Other Files Import Dashboard - Epic 3
 *
 * Displays import status for Bloomberg, Custodian, and Additional data files.
 * Supports file upload, re-import, error viewing, and navigation to Data Confirmation.
 *
 * Stories:
 * - Story 3.1: Display Bloomberg Files Section
 * - Story 3.2: Display Custodian Files Section
 * - Story 3.3: Display Additional Files Section
 * - Story 3.4: Upload/Re-import Other Files
 * - Story 3.5: View File Validation Errors
 * - Story 3.6: Navigate to Data Confirmation
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import { FileImportPopup } from '@/components/FileImportPopup';
import { ErrorDetailsModal } from '@/components/ErrorDetailsModal';
import type {
  FileStatus,
  OtherFileStatusData,
  OtherFilesResponse,
  OtherFileCategory,
} from '@/types/file-import';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Upload,
  RefreshCw,
  Eye,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

const MONTHLY_PROCESS_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042';

// File type display names
const FILE_TYPE_NAMES: Record<string, string> = {
  SecurityMaster: 'Security Master',
  Prices: 'Prices',
  CreditRatings: 'Credit Ratings',
  Analytics: 'Analytics',
  HoldingsReconciliation: 'Holdings Reconciliation',
  TransactionReconciliation: 'Transaction Reconciliation',
  CashReconciliation: 'Cash Reconciliation',
  FXRates: 'FX Rates',
  CustomBenchmarks: 'Custom Benchmarks',
  MarketCommentary: 'Market Commentary',
};

interface FileSectionProps {
  title: string;
  category: OtherFileCategory;
  files: OtherFileStatusData[];
  isLoading: boolean;
  error: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onUpload: (fileType: string) => void;
  onReimport: (fileType: string, fileName: string, fileDate: string) => void;
  onViewErrors: (fileType: string, fileId: string) => void;
  onCancel: (fileType: string, fileId: string) => void;
}

interface StatusIconProps {
  status: FileStatus;
}

function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case 'Success':
      return (
        <CheckCircle2
          className="h-5 w-5 text-green-600"
          role="img"
          aria-label="success"
        />
      );
    case 'Warning':
      return (
        <AlertTriangle
          className="h-5 w-5 text-yellow-600"
          role="img"
          aria-label="warning"
        />
      );
    case 'Failed':
      return (
        <XCircle
          className="h-5 w-5 text-red-600"
          role="img"
          aria-label="failed"
        />
      );
    case 'Pending':
      return (
        <Clock
          className="h-5 w-5 text-gray-400"
          role="img"
          aria-label="pending"
        />
      );
    case 'Processing':
      return (
        <Loader2
          className="h-5 w-5 text-blue-600 animate-spin"
          role="img"
          aria-label="processing"
        />
      );
    default:
      return (
        <Clock
          className="h-5 w-5 text-gray-400"
          role="img"
          aria-label="pending"
        />
      );
  }
}

function formatUploadDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

function formatUploaderName(name: string | null): string {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName.charAt(0)}. ${lastName}`;
}

function truncateFileName(
  fileName: string | null,
  maxLength: number = 30,
): string {
  if (!fileName) return '-';
  if (fileName.length <= maxLength) return fileName;
  return fileName.substring(0, maxLength - 3) + '...';
}

function FileRow({
  file,
  onUpload,
  onReimport,
  onViewErrors,
  onCancel,
}: {
  file: OtherFileStatusData;
  onUpload: () => void;
  onReimport: () => void;
  onViewErrors: () => void;
  onCancel: () => void;
}) {
  const displayName = FILE_TYPE_NAMES[file.fileType] || file.fileType;
  const truncatedName = truncateFileName(file.fileName);
  const isTruncated = file.fileName && file.fileName.length > 30;
  const formattedDate = formatUploadDate(file.uploadedAt);
  const uploaderName = formatUploaderName(file.uploadedBy);

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-muted/50">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-40 font-medium">{displayName}</div>
        <div className="w-8">
          <StatusIcon status={file.status} />
        </div>
        <div className="flex-1 min-w-0">
          {file.fileName ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      'text-sm truncate block',
                      isTruncated && 'cursor-help',
                    )}
                  >
                    {truncatedName}
                  </span>
                </TooltipTrigger>
                {isTruncated && (
                  <TooltipContent role="tooltip">
                    <p>{file.fileName}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
          {file.uploadedBy && file.uploadedAt && (
            <span className="text-xs text-muted-foreground block">
              Uploaded by {uploaderName} on {formattedDate}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {file.status === 'Pending' && (
          <Button size="sm" variant="outline" onClick={onUpload}>
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        )}
        {file.status === 'Success' && (
          <Button size="sm" variant="outline" onClick={onReimport}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Re-import
          </Button>
        )}
        {(file.status === 'Warning' || file.status === 'Failed') && (
          <>
            <Button size="sm" variant="outline" onClick={onViewErrors}>
              <Eye className="h-4 w-4 mr-1" />
              View Errors
            </Button>
            <Button size="sm" variant="outline" onClick={onReimport}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Re-import
            </Button>
          </>
        )}
        {file.status === 'Processing' && (
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function FileSection({
  title,
  category,
  files,
  isLoading,
  error,
  isCollapsed,
  onToggleCollapse,
  onUpload,
  onReimport,
  onViewErrors,
  onCancel,
}: FileSectionProps) {
  const allSuccess =
    files.length > 0 && files.every((f) => f.status === 'Success');

  return (
    <Card>
      <CardHeader className="pb-3">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left"
          onClick={onToggleCollapse}
          aria-label={title}
        >
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {allSuccess && (
              <img
                src="/icons/check-circle.svg"
                alt="complete"
                className="h-5 w-5"
                onError={(e) => {
                  // Fallback if icon doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="pt-0">
          {isLoading && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Loading {category.toLowerCase()} files...
              </p>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive">
              Unable to load {category.toLowerCase()} files. Please try again
              later.
            </p>
          )}
          {!isLoading && !error && files.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No files configured.
            </p>
          )}
          {!isLoading && !error && files.length > 0 && (
            <div className="border rounded-md">
              {files.map((file) => (
                <FileRow
                  key={file.fileType}
                  file={file}
                  onUpload={() => onUpload(file.fileType)}
                  onReimport={() =>
                    onReimport(
                      file.fileType,
                      file.fileName || '',
                      file.uploadedAt || '',
                    )
                  }
                  onViewErrors={() =>
                    onViewErrors(file.fileType, file.fileId || '')
                  }
                  onCancel={() => onCancel(file.fileType, file.fileId || '')}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface SectionState {
  files: OtherFileStatusData[];
  isLoading: boolean;
  error: string | null;
  isCollapsed: boolean;
}

export function OtherFilesDashboard() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const batchId = params.batchId as string;

  // Section states
  const [bloombergState, setBloombergState] = useState<SectionState>({
    files: [],
    isLoading: true,
    error: null,
    isCollapsed: false,
  });
  const [custodianState, setCustodianState] = useState<SectionState>({
    files: [],
    isLoading: true,
    error: null,
    isCollapsed: false,
  });
  const [additionalState, setAdditionalState] = useState<SectionState>({
    files: [],
    isLoading: true,
    error: null,
    isCollapsed: false,
  });

  // File import popup state
  const [importPopup, setImportPopup] = useState<{
    isOpen: boolean;
    fileType: string;
    fileCategory: OtherFileCategory;
    mode: 'upload' | 'reimport';
    currentFileName?: string;
    currentFileDate?: string;
  }>({
    isOpen: false,
    fileType: '',
    fileCategory: 'Bloomberg',
    mode: 'upload',
  });

  // Error details modal state
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    fileType: string;
    fileId: string;
    portfolioName: string;
  }>({
    isOpen: false,
    fileType: '',
    fileId: '',
    portfolioName: '',
  });

  // Fetch files for a category
  const fetchFiles = useCallback(
    async (category: OtherFileCategory) => {
      const setStateFn =
        category === 'Bloomberg'
          ? setBloombergState
          : category === 'Custodian'
            ? setCustodianState
            : setAdditionalState;

      setStateFn((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(
          `${MONTHLY_PROCESS_API_URL}/v1/report-batches/${batchId}/other-files?category=${category.toLowerCase()}`,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: OtherFilesResponse = await response.json();
        setStateFn((prev) => ({
          ...prev,
          files: data.files,
          isLoading: false,
        }));
      } catch (err) {
        setStateFn((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch files',
        }));
      }
    },
    [batchId],
  );

  // Fetch all sections on mount
  useEffect(() => {
    fetchFiles('Bloomberg');
    fetchFiles('Custodian');
    fetchFiles('Additional');
  }, [fetchFiles]);

  // Auto-refresh when files are processing
  useEffect(() => {
    const hasProcessing =
      bloombergState.files.some((f) => f.status === 'Processing') ||
      custodianState.files.some((f) => f.status === 'Processing') ||
      additionalState.files.some((f) => f.status === 'Processing');

    if (hasProcessing) {
      const interval = setInterval(() => {
        fetchFiles('Bloomberg');
        fetchFiles('Custodian');
        fetchFiles('Additional');
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [
    bloombergState.files,
    custodianState.files,
    additionalState.files,
    fetchFiles,
  ]);

  // Toggle section collapse
  const toggleSection = (section: 'bloomberg' | 'custodian' | 'additional') => {
    const setStateFn =
      section === 'bloomberg'
        ? setBloombergState
        : section === 'custodian'
          ? setCustodianState
          : setAdditionalState;

    setStateFn((prev) => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  };

  // Handle upload button click
  const handleUpload = (fileType: string, category: OtherFileCategory) => {
    setImportPopup({
      isOpen: true,
      fileType,
      fileCategory: category,
      mode: 'upload',
    });
  };

  // Handle re-import button click
  const handleReimport = (
    fileType: string,
    category: OtherFileCategory,
    fileName: string,
    fileDate: string,
  ) => {
    setImportPopup({
      isOpen: true,
      fileType,
      fileCategory: category,
      mode: 'reimport',
      currentFileName: fileName,
      currentFileDate: fileDate,
    });
  };

  // Handle view errors button click
  const handleViewErrors = (fileType: string, fileId: string) => {
    setErrorModal({
      isOpen: true,
      fileType,
      fileId,
      portfolioName: 'Portfolio', // Default name as no specific portfolio data available
    });
  };

  // Handle cancel import
  const handleCancel = async (fileType: string, fileId: string) => {
    try {
      const response = await fetch(
        `${MONTHLY_PROCESS_API_URL}/v1/report-batches/${batchId}/other-files/${fileId}/cancel`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showToast({
        variant: 'success',
        title: `Cancelled import for ${FILE_TYPE_NAMES[fileType] || fileType}`,
      });

      // Refresh all sections
      fetchFiles('Bloomberg');
      fetchFiles('Custodian');
      fetchFiles('Additional');
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Failed to cancel import',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  // Handle import popup close
  const handleImportClose = () => {
    setImportPopup((prev) => ({ ...prev, isOpen: false }));
  };

  // Handle import success
  const handleImportSuccess = () => {
    setImportPopup((prev) => ({ ...prev, isOpen: false }));
    // Refresh all sections
    fetchFiles('Bloomberg');
    fetchFiles('Custodian');
    fetchFiles('Additional');
  };

  // Handle error modal close
  const handleErrorModalClose = () => {
    setErrorModal({
      isOpen: false,
      fileType: '',
      fileId: '',
      portfolioName: '',
    });
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchFiles('Bloomberg');
    fetchFiles('Custodian');
    fetchFiles('Additional');
  };

  // Navigation handlers
  const handleBackToPortfolioFiles = () => {
    router.push(`/batches/${batchId}/portfolio-files`);
  };

  const handleProceedToDataConfirmation = () => {
    router.push(`/data-confirmation?batchId=${batchId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Other Files Import</h1>
          <p className="text-muted-foreground">
            Upload and manage Bloomberg, Custodian, and Additional data files
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBackToPortfolioFiles}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio Files
        </Button>
        <Button onClick={handleProceedToDataConfirmation}>
          Proceed to Data Confirmation
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="space-y-6">
        <FileSection
          title="Bloomberg Files"
          category="Bloomberg"
          files={bloombergState.files}
          isLoading={bloombergState.isLoading}
          error={bloombergState.error}
          isCollapsed={bloombergState.isCollapsed}
          onToggleCollapse={() => toggleSection('bloomberg')}
          onUpload={(fileType) => handleUpload(fileType, 'Bloomberg')}
          onReimport={(fileType, fileName, fileDate) =>
            handleReimport(fileType, 'Bloomberg', fileName, fileDate)
          }
          onViewErrors={handleViewErrors}
          onCancel={handleCancel}
        />

        <FileSection
          title="Custodian Files"
          category="Custodian"
          files={custodianState.files}
          isLoading={custodianState.isLoading}
          error={custodianState.error}
          isCollapsed={custodianState.isCollapsed}
          onToggleCollapse={() => toggleSection('custodian')}
          onUpload={(fileType) => handleUpload(fileType, 'Custodian')}
          onReimport={(fileType, fileName, fileDate) =>
            handleReimport(fileType, 'Custodian', fileName, fileDate)
          }
          onViewErrors={handleViewErrors}
          onCancel={handleCancel}
        />

        <FileSection
          title="Additional Data Files"
          category="Additional"
          files={additionalState.files}
          isLoading={additionalState.isLoading}
          error={additionalState.error}
          isCollapsed={additionalState.isCollapsed}
          onToggleCollapse={() => toggleSection('additional')}
          onUpload={(fileType) => handleUpload(fileType, 'Additional')}
          onReimport={(fileType, fileName, fileDate) =>
            handleReimport(fileType, 'Additional', fileName, fileDate)
          }
          onViewErrors={handleViewErrors}
          onCancel={handleCancel}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBackToPortfolioFiles}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolio Files
        </Button>
        <Button onClick={handleProceedToDataConfirmation}>
          Proceed to Data Confirmation
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* File Import Popup */}
      <FileImportPopup
        isOpen={importPopup.isOpen}
        onClose={handleImportClose}
        onSuccess={handleImportSuccess}
        batchId={batchId}
        fileType={importPopup.fileType}
        fileCategory={importPopup.fileCategory}
        mode={importPopup.mode}
        currentFileName={importPopup.currentFileName}
        currentFileDate={importPopup.currentFileDate}
      />

      {/* Error Details Modal */}
      {errorModal.isOpen && (
        <ErrorDetailsModal
          isOpen={errorModal.isOpen}
          onClose={handleErrorModalClose}
          batchId={batchId}
          fileId={errorModal.fileId}
          fileType={errorModal.fileType}
          portfolioName={errorModal.portfolioName}
        />
      )}
    </div>
  );
}

export default OtherFilesDashboard;
