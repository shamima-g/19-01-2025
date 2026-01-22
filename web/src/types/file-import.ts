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
