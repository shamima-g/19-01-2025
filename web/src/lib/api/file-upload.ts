/**
 * File Upload API Functions
 * API endpoints for Epic 2: File Import functionality
 *
 * Handles portfolio file uploads, re-imports, and other file categories
 */

import { MONTHLY_PROCESS_API_URL } from '@/lib/utils/constants';
import type {
  FileUploadResponse,
  FileReimportResponse,
  PortfolioFileGridResponse,
  OtherFileGridResponse,
} from '@/types/file-import';

/**
 * Upload a portfolio file for a report batch
 */
export async function uploadPortfolioFile(
  batchId: string,
  portfolioId: string,
  fileType: string,
  file: File,
  validateOnly: boolean = false,
  lastChangedUser?: string,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('validateOnly', String(validateOnly));

  const headers: Record<string, string> = {};
  if (lastChangedUser) {
    headers['LastChangedUser'] = lastChangedUser;
  }

  const response = await fetch(
    `${MONTHLY_PROCESS_API_URL}/report-batches/${batchId}/portfolios/${portfolioId}/files/${fileType}/upload`,
    {
      method: 'POST',
      headers,
      body: formData,
    },
  );

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
 * Re-import a portfolio file (replace existing)
 */
export async function reimportPortfolioFile(
  batchId: string,
  portfolioId: string,
  fileType: string,
  file: File,
  validateOnly: boolean = false,
  lastChangedUser?: string,
): Promise<FileReimportResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('validateOnly', String(validateOnly));

  const headers: Record<string, string> = {};
  if (lastChangedUser) {
    headers['LastChangedUser'] = lastChangedUser;
  }

  const response = await fetch(
    `${MONTHLY_PROCESS_API_URL}/report-batches/${batchId}/portfolios/${portfolioId}/files/${fileType}/reimport`,
    {
      method: 'POST',
      headers,
      body: formData,
    },
  );

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
 * Upload a non-portfolio file (Bloomberg, Custodian, Additional)
 */
export async function uploadOtherFile(
  batchId: string,
  fileType: string,
  fileCategory: string,
  file: File,
  validateOnly: boolean = false,
  lastChangedUser?: string,
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileCategory', fileCategory);
  formData.append('validateOnly', String(validateOnly));

  const headers: Record<string, string> = {};
  if (lastChangedUser) {
    headers['LastChangedUser'] = lastChangedUser;
  }

  const response = await fetch(
    `${MONTHLY_PROCESS_API_URL}/report-batches/${batchId}/other-files/${fileType}/upload`,
    {
      method: 'POST',
      headers,
      body: formData,
    },
  );

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
 * Get portfolio files for a report batch
 */
export async function getPortfolioFiles(
  batchId: string,
  portfolioId?: string,
): Promise<PortfolioFileGridResponse> {
  const url = new URL(
    `${MONTHLY_PROCESS_API_URL}/report-batches/${batchId}/portfolio-files`,
  );
  if (portfolioId) {
    url.searchParams.append('portfolioId', portfolioId);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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
 * Get other files (Bloomberg, Custodian, Additional) for a report batch
 */
export async function getOtherFiles(
  batchId: string,
  fileCategory?: string,
): Promise<OtherFileGridResponse> {
  const url = new URL(
    `${MONTHLY_PROCESS_API_URL}/report-batches/${batchId}/other-files`,
  );
  if (fileCategory) {
    url.searchParams.append('fileCategory', fileCategory);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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
