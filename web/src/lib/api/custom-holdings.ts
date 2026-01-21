/**
 * API functions for Custom Holdings (Epic 6)
 */

import { get, post, put, del } from './client';
import type {
  CustomHolding,
  CustomHoldingListResponse,
  CustomHoldingListParams,
  Portfolio,
  Instrument,
  AuditRecord,
  FullAuditRecord,
  AuditListParams,
  CustomHoldingFormData,
} from '@/types/custom-holding';

const BASE_PATH = '/v1/custom-holdings';

/**
 * Get list of custom holdings with optional filtering
 */
export async function getCustomHoldings(
  params?: CustomHoldingListParams,
): Promise<CustomHoldingListResponse> {
  const queryParams: Record<string, string> = {};

  if (params?.search) queryParams.search = params.search;
  if (params?.portfolio) queryParams.portfolio = params.portfolio;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
  if (params?.sortBy) queryParams.sortBy = params.sortBy;
  if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

  return get<CustomHoldingListResponse>(BASE_PATH, queryParams);
}

/**
 * Get a single custom holding by ID
 */
export async function getCustomHolding(id: string): Promise<CustomHolding> {
  return get<CustomHolding>(`${BASE_PATH}/${id}`);
}

/**
 * Create a new custom holding
 */
export async function createCustomHolding(
  data: CustomHoldingFormData,
  lastChangedUser?: string,
): Promise<CustomHolding> {
  return post<CustomHolding>(BASE_PATH, data, lastChangedUser);
}

/**
 * Update an existing custom holding
 */
export async function updateCustomHolding(
  id: string,
  data: Partial<CustomHoldingFormData>,
  lastChangedUser?: string,
): Promise<CustomHolding> {
  return put<CustomHolding>(`${BASE_PATH}/${id}`, data, lastChangedUser);
}

/**
 * Delete a custom holding
 */
export async function deleteCustomHolding(
  id: string,
  lastChangedUser?: string,
): Promise<void> {
  return del<void>(`${BASE_PATH}/${id}`, lastChangedUser);
}

/**
 * Get audit trail for a specific holding
 */
export async function getHoldingAuditTrail(
  holdingId: string,
): Promise<AuditRecord[]> {
  return get<AuditRecord[]>(`${BASE_PATH}/${holdingId}/audit-trail`);
}

/**
 * Get full audit trail for all holdings
 */
export async function getFullAuditTrail(
  params?: AuditListParams,
): Promise<{ data: FullAuditRecord[]; total: number }> {
  const queryParams: Record<string, string> = {};

  if (params?.portfolio) queryParams.portfolio = params.portfolio;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.pageSize) queryParams.pageSize = String(params.pageSize);

  return get<{ data: FullAuditRecord[]; total: number }>(
    `${BASE_PATH}/audit-trail/full`,
    queryParams,
  );
}

/**
 * Export audit trail to Excel
 */
export async function exportAuditTrail(
  holdingId?: string,
  params?: AuditListParams,
): Promise<Blob> {
  const queryParams: Record<string, string> = { format: 'xlsx' };

  if (params?.portfolio) queryParams.portfolio = params.portfolio;
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;

  const endpoint = holdingId
    ? `${BASE_PATH}/${holdingId}/audit-trail/export`
    : `${BASE_PATH}/audit-trail/export`;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042'}${endpoint}?${new URLSearchParams(queryParams)}`,
    {
      method: 'GET',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to export audit trail');
  }

  return response.blob();
}

/**
 * Get list of portfolios for dropdown
 */
export async function getPortfolios(): Promise<Portfolio[]> {
  return get<Portfolio[]>('/v1/portfolios');
}

/**
 * Get list of instruments for dropdown
 */
export async function getInstruments(): Promise<Instrument[]> {
  return get<Instrument[]>('/v1/instruments');
}
