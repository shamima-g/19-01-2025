/**
 * Report Batch Types
 * Types for Epic 1: Start Page & Report Batch Management
 */

export type BatchStatus = 'Pending' | 'In Progress' | 'Completed' | 'Failed';

export interface ReportBatch {
  id: string;
  month: string;
  year: number;
  status: BatchStatus;
  createdDate: string;
  createdBy: string;
}

export interface ReportBatchListResponse {
  data: ReportBatch[];
  total: number;
}

export interface CreateBatchRequest {
  month: string;
  year: number;
  autoImport: boolean;
}

export type CreateBatchResponse = ReportBatch;

export interface BatchExportOptions {
  includeFiltered: boolean;
  searchTerm?: string;
}
