/**
 * Instruments API Functions
 * API endpoints for Epic 4: Instrument Static Data Management
 *
 * Uses the centralized API client for consistent error handling,
 * logging, and audit trail support.
 */

import { get, post, put, del, apiClient } from './client';
import type {
  InstrumentListResponse,
  InstrumentListParams,
  Instrument,
  InstrumentRequest,
  InstrumentAuditResponse,
  InstrumentHistoryResponse,
  InstrumentUploadResponse,
  IncompleteIsinsExportParams,
} from '@/types/instrument';

const BASE_PATH = '/v1/instruments';

/**
 * Get list of instruments with optional filtering, sorting, and pagination
 */
export async function getInstruments(
  params?: InstrumentListParams,
): Promise<InstrumentListResponse> {
  return get<InstrumentListResponse>(BASE_PATH, {
    page: params?.page,
    pageSize: params?.pageSize,
    search: params?.search,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    status: params?.status,
    assetClass: params?.assetClass,
  });
}

/**
 * Get a single instrument by ID
 */
export async function getInstrument(id: string): Promise<Instrument> {
  return get<Instrument>(`${BASE_PATH}/${id}`);
}

/**
 * Create a new instrument
 */
export async function createInstrument(
  data: InstrumentRequest,
  lastChangedUser?: string,
): Promise<Instrument> {
  return post<Instrument>(BASE_PATH, data, lastChangedUser);
}

/**
 * Update an existing instrument
 */
export async function updateInstrument(
  id: string,
  data: Partial<InstrumentRequest>,
  lastChangedUser?: string,
): Promise<Instrument> {
  return put<Instrument>(`${BASE_PATH}/${id}`, data, lastChangedUser);
}

/**
 * Delete an instrument
 */
export async function deleteInstrument(
  id: string,
  lastChangedUser?: string,
): Promise<void> {
  return del<void>(`${BASE_PATH}/${id}`, lastChangedUser);
}

/**
 * Get audit trail for an instrument
 */
export async function getInstrumentAuditTrail(
  id: string,
  params?: { page?: number; pageSize?: number },
): Promise<InstrumentAuditResponse> {
  return get<InstrumentAuditResponse>(`${BASE_PATH}/${id}/audit`, {
    page: params?.page,
    pageSize: params?.pageSize,
  });
}

/**
 * Get field-level history for an instrument
 */
export async function getInstrumentHistory(
  id: string,
  params?: { page?: number; pageSize?: number; field?: string },
): Promise<InstrumentHistoryResponse> {
  return get<InstrumentHistoryResponse>(`${BASE_PATH}/${id}/history`, {
    page: params?.page,
    pageSize: params?.pageSize,
    field: params?.field,
  });
}

/**
 * Upload instruments from file (CSV/Excel)
 */
export async function uploadInstrumentsFile(
  file: File,
  lastChangedUser?: string,
): Promise<InstrumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (lastChangedUser) {
    headers['LastChangedUser'] = lastChangedUser;
  }

  return apiClient<InstrumentUploadResponse>(`${BASE_PATH}/upload`, {
    method: 'POST',
    body: formData,
    headers,
  });
}

/**
 * Export all instruments to Excel
 */
export async function exportInstruments(
  params?: InstrumentListParams,
): Promise<Blob> {
  return apiClient<Blob>(`${BASE_PATH}/export`, {
    method: 'GET',
    params: {
      search: params?.search,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
      status: params?.status,
      assetClass: params?.assetClass,
      format: 'excel',
    },
    isBinaryResponse: true,
  });
}

/**
 * Export incomplete ISINs (instruments with status = Incomplete)
 */
export async function exportIncompleteIsins(
  params?: IncompleteIsinsExportParams,
): Promise<Blob> {
  return apiClient<Blob>(`${BASE_PATH}/incomplete/export`, {
    method: 'GET',
    params: {
      format: params?.format || 'excel',
      assetClass: params?.assetClass,
    },
    isBinaryResponse: true,
  });
}

/**
 * Validate ISIN format (client-side helper)
 * ISIN: 12 alphanumeric characters
 */
export function validateIsin(isin: string): boolean {
  const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
  return isinRegex.test(isin.toUpperCase());
}

/**
 * Check if ISIN already exists
 */
export async function checkIsinExists(isin: string): Promise<boolean> {
  try {
    const result = await get<{ exists: boolean }>(`${BASE_PATH}/check-isin`, {
      isin,
    });
    return result.exists;
  } catch {
    return false;
  }
}
