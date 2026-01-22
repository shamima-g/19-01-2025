'use client';

import { useState, useCallback } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Loader2,
  Upload,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { FileStatus, PortfolioFileStatusData } from '@/types/file-import';

interface FileStatusCellProps {
  data: PortfolioFileStatusData;
  fileType: string;
  portfolioId: string;
  portfolioName: string;
  onUpload: (portfolioId: string, fileType: string) => void;
  onReimport: (
    portfolioId: string,
    fileType: string,
    currentFileName?: string,
  ) => void;
  onViewErrors: (
    fileId: string,
    fileType: string,
    portfolioName: string,
  ) => void;
  onCancel: (fileId: string) => void;
}

const statusConfig: Record<
  FileStatus,
  {
    icon: React.ElementType;
    bgClass: string;
    iconClass: string;
    label: string;
  }
> = {
  Success: {
    icon: CheckCircle,
    bgClass: 'bg-green-50',
    iconClass: 'text-green-600',
    label: 'Success',
  },
  Warning: {
    icon: AlertTriangle,
    bgClass: 'bg-yellow-50',
    iconClass: 'text-yellow-600',
    label: 'Warning',
  },
  Failed: {
    icon: XCircle,
    bgClass: 'bg-red-50',
    iconClass: 'text-red-600',
    label: 'Failed',
  },
  Pending: {
    icon: Clock,
    bgClass: 'bg-gray-50',
    iconClass: 'text-gray-400',
    label: 'Pending',
  },
  Processing: {
    icon: Loader2,
    bgClass: 'bg-blue-50',
    iconClass: 'text-blue-600 animate-spin',
    label: 'Processing',
  },
};

/**
 * Truncates a filename if it's longer than maxLength
 */
function truncateFileName(fileName: string, maxLength: number = 20): string {
  if (fileName.length <= maxLength) {
    return fileName;
  }
  const extension = fileName.split('.').pop() || '';
  const nameWithoutExt = fileName.slice(
    0,
    fileName.length - extension.length - 1,
  );
  const truncatedName = nameWithoutExt.slice(
    0,
    maxLength - extension.length - 4,
  );
  return `${truncatedName}...${extension}`;
}

/**
 * Formats a date string to "01/15/24" format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

/**
 * Formats an uploaded by user name to initials + last name
 * "John Smith" -> "J. Smith"
 */
function formatUploadedBy(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length < 2) {
    return name;
  }
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

export function FileStatusCell({
  data,
  fileType,
  portfolioId,
  portfolioName,
  onUpload,
  onReimport,
  onViewErrors,
  onCancel,
}: FileStatusCellProps) {
  const [isCanceling, setIsCanceling] = useState(false);
  const config = statusConfig[data.status];
  const StatusIcon = config.icon;
  const truncatedFileName = data.fileName
    ? truncateFileName(data.fileName)
    : null;
  const showTooltip = data.fileName && data.fileName.length > 20;

  const handleUpload = useCallback(() => {
    onUpload(portfolioId, fileType);
  }, [onUpload, portfolioId, fileType]);

  const handleReimport = useCallback(() => {
    onReimport(portfolioId, fileType, data.fileName);
  }, [onReimport, portfolioId, fileType, data.fileName]);

  const handleViewErrors = useCallback(() => {
    if (data.fileId) {
      onViewErrors(data.fileId, fileType, portfolioName);
    }
  }, [onViewErrors, data.fileId, fileType, portfolioName]);

  const handleCancel = useCallback(async () => {
    if (data.fileId) {
      setIsCanceling(true);
      try {
        await onCancel(data.fileId);
      } finally {
        setIsCanceling(false);
      }
    }
  }, [onCancel, data.fileId]);

  return (
    <div
      className={`min-w-[140px] p-3 rounded-md ${config.bgClass} flex flex-col gap-2`}
      role="cell"
      aria-label={`${fileType} file status: ${config.label}`}
    >
      {/* Status Icon */}
      <div className="flex items-center gap-2">
        <StatusIcon
          className={`h-5 w-5 ${config.iconClass}`}
          aria-hidden="true"
          role="img"
          aria-label={config.label}
        />
        <span className="text-sm font-medium text-gray-700">
          {config.label}
        </span>
      </div>

      {/* File Metadata */}
      {data.fileName && (
        <div className="text-xs text-gray-600 space-y-0.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="truncate cursor-default">{truncatedFileName}</p>
              </TooltipTrigger>
              {showTooltip && (
                <TooltipContent>
                  <p>{data.fileName}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {data.uploadedBy && data.uploadedAt && (
            <p className="text-gray-500">
              Uploaded by {formatUploadedBy(data.uploadedBy)} on{' '}
              {formatDate(data.uploadedAt)}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-1 mt-1">
        {/* Pending: Upload button */}
        {data.status === 'Pending' && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleUpload}
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
        )}

        {/* Success: Re-import button */}
        {data.status === 'Success' && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleReimport}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Re-import
          </Button>
        )}

        {/* Warning/Failed: View Errors and Re-import buttons */}
        {(data.status === 'Warning' || data.status === 'Failed') && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleViewErrors}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Errors
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleReimport}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Re-import
            </Button>
          </>
        )}

        {/* Processing: Cancel button */}
        {data.status === 'Processing' && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleCancel}
            disabled={isCanceling}
          >
            {isCanceling ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Canceling...
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
