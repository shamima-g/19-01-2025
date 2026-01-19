/**
 * Portfolio Files API Functions
 * API endpoints for Epic 2: Portfolio File Import Dashboard
 *
 * Uses the centralized API client for consistent error handling,
 * logging, and audit trail support.
 */

import { MONTHLY_PROCESS_API_URL } from '@/lib/utils/constants';
import type {
  PortfolioFileGridResponse,
  FileErrorsResponse,
  CancelImportResponse,
  UploadFileResponse,
  PortfolioFileType,
  ErrorSeverity,
} from '@/types/portfolio-file';

/**
 * Custom API client for Monthly Process API
 * Uses the different base URL for monthly process endpoints
 */
async function monthlyProcessClient<T>(
  endpoint: string,
  config: {
    method?: string;
    params?: Record<string, string | number | boolean | undefined>;
    body?: BodyInit;
    lastChangedUser?: string;
    isBinaryResponse?: boolean;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const url = `${MONTHLY_PROCESS_API_URL}${endpoint}`;

  const { params, lastChangedUser, isBinaryResponse, ...fetchConfig } = config;

  // Build query string
  let fullUrl = url;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      fullUrl = `${url}?${queryString}`;
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchConfig.headers as Record<string, string>),
  };

  if (lastChangedUser) {
    headers['LastChangedUser'] = lastChangedUser;
  }

  const response = await fetch(fullUrl, {
    ...fetchConfig,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.Messages?.[0] ||
      `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  if (isBinaryResponse) {
    return (await response.blob()) as T;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Get portfolio files for a batch
 */
export async function getPortfolioFiles(
  batchId: string,
): Promise<PortfolioFileGridResponse> {
  return monthlyProcessClient<PortfolioFileGridResponse>(
    `/report-batches/${batchId}/portfolio-files`,
    {
      method: 'GET',
    },
  );
}

/**
 * Get file errors for a specific file
 */
export async function getFileErrors(
  batchId: string,
  portfolioId: string,
  fileType: PortfolioFileType,
  options?: {
    page?: number;
    pageSize?: number;
    severity?: ErrorSeverity;
  },
): Promise<FileErrorsResponse> {
  return monthlyProcessClient<FileErrorsResponse>(
    `/report-batches/${batchId}/portfolios/${portfolioId}/files/${fileType}/errors`,
    {
      method: 'GET',
      params: {
        page: options?.page,
        pageSize: options?.pageSize,
        severity: options?.severity,
      },
    },
  );
}

/**
 * Cancel an in-progress file import
 */
export async function cancelFileImport(
  batchId: string,
  portfolioId: string,
  fileType: PortfolioFileType,
  lastChangedUser?: string,
): Promise<CancelImportResponse> {
  return monthlyProcessClient<CancelImportResponse>(
    `/report-batches/${batchId}/portfolios/${portfolioId}/files/${fileType}/cancel`,
    {
      method: 'POST',
      lastChangedUser,
    },
  );
}

/**
 * Upload a portfolio file
 */
export async function uploadPortfolioFile(
  batchId: string,
  portfolioId: string,
  fileType: PortfolioFileType,
  file: File,
  options?: {
    isReimport?: boolean;
    lastChangedUser?: string;
  },
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.isReimport) {
    formData.append('isReimport', 'true');
  }

  const url = `${MONTHLY_PROCESS_API_URL}/report-batches/${batchId}/portfolios/${portfolioId}/files/${fileType}`;

  const headers: Record<string, string> = {};
  if (options?.lastChangedUser) {
    headers['LastChangedUser'] = options.lastChangedUser;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.Messages?.[0] ||
      `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return response.json();
}

/**
 * Export file errors to CSV
 */
export async function exportFileErrors(
  batchId: string,
  portfolioId: string,
  fileType: PortfolioFileType,
  options?: {
    severity?: ErrorSeverity;
  },
): Promise<Blob> {
  return monthlyProcessClient<Blob>(
    `/report-batches/${batchId}/portfolios/${portfolioId}/files/${fileType}/errors/export`,
    {
      method: 'GET',
      params: {
        severity: options?.severity,
        format: 'csv',
      },
      isBinaryResponse: true,
    },
  );
}
