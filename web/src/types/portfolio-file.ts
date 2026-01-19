/**
 * Portfolio File Types
 * Types for Epic 2: Portfolio File Import Dashboard
 */

/**
 * File import status values
 */
export type FileStatus =
  | 'Pending'
  | 'Processing'
  | 'Success'
  | 'Warning'
  | 'Failed';

/**
 * File type categories for portfolio files
 */
export type PortfolioFileType =
  | 'holdings'
  | 'transactions'
  | 'cashFlow'
  | 'benchmark'
  | 'performance'
  | 'risk'
  | 'compliance';

/**
 * Human-readable labels for file types
 */
export const FILE_TYPE_LABELS: Record<PortfolioFileType, string> = {
  holdings: 'Holdings',
  transactions: 'Transactions',
  cashFlow: 'Cash Flow',
  benchmark: 'Benchmark',
  performance: 'Performance',
  risk: 'Risk',
  compliance: 'Compliance',
};

/**
 * Individual file information
 */
export interface PortfolioFile {
  status: FileStatus;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  errorCount?: number;
  progress?: number;
}

/**
 * Portfolio with all its files
 */
export interface Portfolio {
  portfolioId: string;
  portfolioName: string;
  files: Record<PortfolioFileType, PortfolioFile>;
}

/**
 * API response for portfolio file grid
 */
export interface PortfolioFileGridResponse {
  portfolios: Portfolio[];
}

/**
 * File error severity levels
 */
export type ErrorSeverity = 'Critical' | 'Warning' | 'Info';

/**
 * Individual file error
 */
export interface FileError {
  rowNumber: number;
  column: string;
  message: string;
  severity: ErrorSeverity;
  originalValue?: string;
}

/**
 * Error summary counts
 */
export interface ErrorSummary {
  totalErrors: number;
  criticalCount: number;
  warningCount: number;
  infoCount?: number;
}

/**
 * API response for file errors
 */
export interface FileErrorsResponse {
  summary: ErrorSummary;
  errors: FileError[];
  hasMore: boolean;
}

/**
 * Cancel import response
 */
export interface CancelImportResponse {
  success: boolean;
  message: string;
  fileStatus: FileStatus;
}

/**
 * Upload file request
 */
export interface UploadFileRequest {
  portfolioId: string;
  fileType: PortfolioFileType;
  file: File;
  isReimport?: boolean;
}

/**
 * Upload file response
 */
export interface UploadFileResponse {
  success: boolean;
  message: string;
  fileId?: string;
  status: FileStatus;
}
