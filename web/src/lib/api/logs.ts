/**
 * API Client for Monthly Process Monitoring & Logs (Epic 9)
 */

import { get } from './client';
import type {
  FileProcessLogsResponse,
  FileFaultsResponse,
  WeeklyProcessLogsResponse,
  UserAuditTrailResponse,
  MonthlyProcessLogsResponse,
  CalculationLogsResponse,
  CalculationErrorsResponse,
  LogDetails,
  LogFilterParams,
} from '@/types/logs';

// Story 9.1: File Process Logs
export const getFileProcessLogs = (params?: LogFilterParams) => {
  const queryParams = new URLSearchParams();
  if (params?.batchDate) queryParams.append('batchDate', params.batchDate);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.fileType) queryParams.append('fileType', params.fileType);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  return get<FileProcessLogsResponse>(
    `/v1/file-process-logs${queryString ? `?${queryString}` : ''}`,
  );
};

// Story 9.2: Download Processed File
export const downloadProcessedFile = async (fileId: string): Promise<Blob> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042';
  const url = `${baseUrl}/v1/file-process-logs/${fileId}/download`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/octet-stream',
    },
  });

  if (response.status === 404) {
    throw new Error('File not found or has been archived');
  }

  if (!response.ok) {
    throw new Error('Download failed. Please try again.');
  }

  return response.blob();
};

// Story 9.3: File Faults
export const getFileFaults = (params?: LogFilterParams) => {
  const queryParams = new URLSearchParams();
  if (params?.batchDate) queryParams.append('batchDate', params.batchDate);
  if (params?.search) queryParams.append('fileName', params.search);

  const queryString = queryParams.toString();
  return get<FileFaultsResponse>(
    `/v1/file-faults${queryString ? `?${queryString}` : ''}`,
  );
};

// Story 9.4: Export File Faults
export const exportFileFaults = async (
  params?: LogFilterParams,
): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params?.batchDate) queryParams.append('batchDate', params.batchDate);
  if (params?.search) queryParams.append('fileName', params.search);

  const queryString = queryParams.toString();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042';
  const url = `${baseUrl}/v1/file-faults/export${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
};

// Story 9.5: Weekly Process Logs
export const getWeeklyProcessLogs = (batchDate: string) => {
  return get<WeeklyProcessLogsResponse>(
    `/v1/weekly-process-logs?batchDate=${batchDate}`,
  );
};

// Story 9.6: User Audit Trail
export const getUserAuditTrail = (params?: LogFilterParams) => {
  const queryParams = new URLSearchParams();
  if (params?.batchDate) queryParams.append('batchDate', params.batchDate);
  if (params?.user) queryParams.append('user', params.user);
  if (params?.search) queryParams.append('entity', params.search);

  const queryString = queryParams.toString();
  return get<UserAuditTrailResponse>(
    `/v1/user-audit-trail${queryString ? `?${queryString}` : ''}`,
  );
};

// Story 9.7: Export Weekly Logs
export const exportWeeklyLogs = async (batchDate: string): Promise<Blob> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042';
  const url = `${baseUrl}/v1/weekly-process-logs/export?batchDate=${batchDate}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
};

// Story 9.8: Monthly Process Logs
export const getMonthlyProcessLogs = (params?: LogFilterParams) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('reportDate', params.startDate);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  return get<MonthlyProcessLogsResponse>(
    `/v1/monthly-process-logs${queryString ? `?${queryString}` : ''}`,
  );
};

// Story 9.10: Export Monthly Logs
export const exportMonthlyLogs = async (reportDate: string): Promise<Blob> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042';
  const url = `${baseUrl}/v1/monthly-process-logs/export?reportDate=${reportDate}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
};

// Story 9.11: Calculation Logs
export const getCalculationLogs = (params?: LogFilterParams) => {
  const queryParams = new URLSearchParams();
  if (params?.calculationType)
    queryParams.append('calculationType', params.calculationType);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  return get<CalculationLogsResponse>(
    `/v1/calculation-logs${queryString ? `?${queryString}` : ''}`,
  );
};

// Story 9.12: Calculation Errors
export const getCalculationErrors = (params?: LogFilterParams) => {
  const queryParams = new URLSearchParams();
  if (params?.calculationType)
    queryParams.append('calculationName', params.calculationType);

  const queryString = queryParams.toString();
  return get<CalculationErrorsResponse>(
    `/v1/calculation-log-errors${queryString ? `?${queryString}` : ''}`,
  );
};

// Story 9.14: Log Details
export const getLogDetails = (logId: string) => {
  return get<LogDetails>(`/v1/process-logs/${logId}/details`);
};

// Get batch dates for dropdowns
export const getBatchDates = () => {
  return get<{ dates: string[] }>('/v1/batch-dates');
};
