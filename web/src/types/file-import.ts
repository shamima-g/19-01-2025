/**
 * File Import Types
 * Types for Epic 2: File Import functionality
 */

export type FileStatus =
  | 'Success'
  | 'Warning'
  | 'Failed'
  | 'Pending'
  | 'Processing';

export type PortfolioFileType =
  | 'Holdings'
  | 'Transactions'
  | 'Cash Flow'
  | 'Benchmark'
  | 'Performance'
  | 'Risk'
  | 'Compliance';

export type OtherFileCategory = 'Bloomberg' | 'Custodian' | 'Additional';

export interface PortfolioFile {
  id: string;
  portfolioId: string;
  portfolioName: string;
  fileType: PortfolioFileType;
  fileName: string;
  fileSize: number;
  status: FileStatus;
  uploadedAt: string;
  uploadedBy: string;
  errorMessage?: string;
}

export interface PortfolioFileGridResponse {
  files: PortfolioFile[];
  total: number;
}

/**
 * Portfolio file grid data structure for Story 2.1
 * Grid displays portfolios as rows with 7 file type columns
 */
export interface PortfolioFileStatusData {
  status: FileStatus;
  fileName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  errorCount?: number;
  fileId?: string;
}

export interface PortfolioRow {
  portfolioId: string;
  portfolioName: string;
  files: {
    holdings: PortfolioFileStatusData;
    transactions: PortfolioFileStatusData;
    cashFlow: PortfolioFileStatusData;
    benchmark: PortfolioFileStatusData;
    performance: PortfolioFileStatusData;
    risk: PortfolioFileStatusData;
    compliance: PortfolioFileStatusData;
  };
}

export interface PortfolioFilesGridData {
  portfolios: PortfolioRow[];
  batchId: string;
  batchName: string;
}

/**
 * API response for portfolio files grid
 */
export interface PortfolioFilesGridResponse {
  portfolios: PortfolioRow[];
}

/**
 * File error types for Story 2.4
 */
export type ErrorSeverity = 'Critical' | 'Warning' | 'Info';

export interface FileError {
  rowNumber: number;
  column: string;
  message: string;
  severity: ErrorSeverity;
  originalValue?: string;
  expectedFormat?: string;
}

export interface FileErrorSummary {
  totalErrors: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}

export interface FileErrorResponse {
  summary: FileErrorSummary;
  errors: FileError[];
  hasMore: boolean;
}

/**
 * Cancel import response for Story 2.5
 */
export interface CancelImportResponse {
  success: boolean;
  message: string;
  fileStatus: 'Pending' | 'Canceled';
}

export interface FileUploadRequest {
  file: File;
  validateOnly?: boolean;
}

export interface FileUploadResponse {
  success: boolean;
  fileId?: string;
  validationPassed?: boolean;
  message?: string;
  errors?: string[];
}

export interface FileReimportResponse {
  success: boolean;
  fileId?: string;
  message?: string;
  rollbackPerformed?: boolean;
}

export interface OtherFile {
  id: string;
  fileType: string;
  fileCategory: OtherFileCategory;
  fileName: string;
  fileSize: number;
  status: FileStatus;
  uploadedAt: string;
  uploadedBy: string;
  errorMessage?: string;
}

export interface OtherFileGridResponse {
  files: OtherFile[];
  total: number;
}
