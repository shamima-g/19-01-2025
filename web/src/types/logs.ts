/**
 * Types for Monthly Process Monitoring & Logs (Epic 9)
 */

export type ProcessStatus = 'SUCCESS' | 'FAILED' | 'WARNING' | 'IN_PROGRESS';

export type FileType =
  | 'BLOOMBERG'
  | 'CUSTODIAN'
  | 'NAV'
  | 'TRANSACTION'
  | 'HOLDING'
  | 'CUSTOM';

// Story 9.1: File Process Logs
export interface FileProcessLog {
  id: string;
  fileName: string;
  fileType: FileType;
  status: ProcessStatus;
  uploadDate: string;
  processedDate: string;
  recordsCount: number;
  errorCount: number;
  batchDate: string;
}

export interface FileProcessLogsResponse {
  logs: FileProcessLog[];
  totalCount: number;
}

// Story 9.2: Download Processed File
export interface FileDownloadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Story 9.3: File Faults
export interface FileFault {
  id: string;
  fileName: string;
  rowNumber: number;
  column: string;
  errorMessage: string;
  timestamp: string;
  severity: 'ERROR' | 'WARNING';
}

export interface FileFaultsResponse {
  faults: FileFault[];
  totalCount: number;
}

// Story 9.5: Weekly Process Logs
export interface WeeklyProcessLog {
  id: string;
  processName: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  status: ProcessStatus;
  errorCount: number;
}

export interface WeeklyProcessLogsResponse {
  logs: WeeklyProcessLog[];
  batchDate: string;
}

// Story 9.6: User Audit Trail
export interface UserAuditEntry {
  id: string;
  user: string;
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'VIEW'
    | 'EXPORT'
    | 'APPROVE'
    | 'REJECT';
  entity: string;
  entityId?: string;
  timestamp: string;
  details: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface UserAuditTrailResponse {
  entries: UserAuditEntry[];
  totalCount: number;
}

// Story 9.8: Monthly Process Logs
export interface MonthlyProcessLog {
  id: string;
  processName: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: ProcessStatus;
  errorCount: number;
  recordsProcessed: number;
}

export interface MonthlyProcessLogsResponse {
  logs: MonthlyProcessLog[];
  reportDate: string;
}

// Story 9.11: Calculation Logs
export interface CalculationLog {
  id: string;
  calculationName: string;
  calculationType: 'NAV' | 'PERFORMANCE' | 'ATTRIBUTION' | 'RISK' | 'HOLDINGS';
  startTime: string;
  endTime: string;
  status: ProcessStatus;
  recordsProcessed: number;
  steps?: CalculationStep[];
}

export interface CalculationStep {
  stepNumber: number;
  stepName: string;
  startTime: string;
  endTime: string;
  duration: number;
  recordsProcessed: number;
}

export interface CalculationLogsResponse {
  logs: CalculationLog[];
  totalCount: number;
}

// Story 9.12: Calculation Errors
export interface CalculationError {
  id: string;
  calculationName: string;
  errorType: string;
  errorMessage: string;
  affectedRecord: string;
  timestamp: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
}

export interface CalculationErrorsResponse {
  errors: CalculationError[];
  totalCount: number;
}

// Story 9.14: Log Details
export interface LogDetails {
  id: string;
  processName: string;
  fullLog: string;
  parameters: Record<string, unknown>;
  inputCount: number;
  outputCount: number;
  errorDetails?: string;
  startTime: string;
  endTime: string;
  duration: number;
}

// Export types
export interface ExportResponse {
  success: boolean;
  fileName?: string;
  error?: string;
}

// Filter parameters
export interface LogFilterParams {
  batchDate?: string;
  startDate?: string;
  endDate?: string;
  status?: ProcessStatus;
  search?: string;
  fileType?: FileType;
  user?: string;
  calculationType?: string;
}
