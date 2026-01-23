/**
 * API Client: Market Data Maintenance
 *
 * Provides type-safe API functions for:
 * - Index Prices (CRUD + file upload + history)
 * - Instrument Durations (CRUD)
 * - Instrument Betas (CRUD)
 */

import { get, post, put, del } from './client';

// ============================================================================
// Types - Index Prices
// ============================================================================

export interface IndexPrice {
  id: string;
  indexCode: string;
  indexName: string;
  date: string;
  price: number;
  currency: string;
  changePercent?: number;
  user?: string;
}

export interface IndexPriceHistory {
  id: string;
  date: string;
  price: number;
  changePercent: number;
  user: string;
}

export interface IndexPriceDetail {
  id: string;
  indexCode: string;
  indexName: string;
  currentPrice: number;
  previousPrice: number;
  changePercent: number;
  date: string;
  currency: string;
}

export interface IndexPriceUploadResult {
  added: number;
  updated: number;
  errors: Array<{ row: number; reason: string }>;
}

// ============================================================================
// Types - Durations
// ============================================================================

export interface InstrumentDuration {
  id: string;
  isin: string;
  instrumentName: string;
  duration: number;
  ytm: number;
  effectiveDate: string;
  user?: string;
}

// ============================================================================
// Types - Betas
// ============================================================================

export interface InstrumentBeta {
  id: string;
  isin: string;
  instrumentName: string;
  beta: number;
  benchmark: string;
  effectiveDate: string;
  user?: string;
}

// ============================================================================
// Index Prices API Functions
// ============================================================================

/**
 * Get paginated list of index prices with optional filters
 */
export const getIndexPrices = (params?: {
  search?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}) => get<{ data: IndexPrice[]; total: number }>('/v1/index-prices', params);

/**
 * Get a single index price by ID
 */
export const getIndexPrice = (id: string) =>
  get<IndexPriceDetail>(`/v1/index-prices/${id}`);

/**
 * Create a new index price
 */
export const createIndexPrice = (
  data: Omit<IndexPrice, 'id'>,
  lastChangedUser: string,
) => post<IndexPrice>('/v1/index-prices', data, lastChangedUser);

/**
 * Update an existing index price
 */
export const updateIndexPrice = (
  id: string,
  data: Partial<IndexPrice>,
  lastChangedUser: string,
) => put<IndexPrice>(`/v1/index-prices/${id}`, data, lastChangedUser);

/**
 * Delete an index price
 */
export const deleteIndexPrice = (id: string, lastChangedUser: string) =>
  del(`/v1/index-prices/${id}`, lastChangedUser);

/**
 * Upload index prices file (Excel or CSV)
 */
export const uploadIndexPricesFile = (file: File, lastChangedUser: string) => {
  const formData = new FormData();
  formData.append('file', file);
  return post<IndexPriceUploadResult>(
    '/v1/index-prices/upload',
    formData,
    lastChangedUser,
  );
};

/**
 * Get price history for a specific index
 */
export const getIndexPriceHistory = (
  indexCode: string,
  params?: {
    startDate?: string;
    endDate?: string;
  },
) => get<IndexPriceHistory[]>(`/v1/index-prices/history/${indexCode}`, params);

/**
 * Export index prices to Excel
 */
export const exportIndexPrices = (params?: {
  startDate?: string;
  endDate?: string;
}) =>
  get<Blob>('/v1/index-prices/export', { ...params, isBinaryResponse: true });

// ============================================================================
// Durations API Functions
// ============================================================================

/**
 * Get paginated list of instrument durations with optional filters
 */
export const getInstrumentDurations = (params?: {
  search?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
}) =>
  get<{ data: InstrumentDuration[]; total: number }>(
    '/v1/instrument-durations',
    params,
  );

/**
 * Get a single duration by ID
 */
export const getInstrumentDuration = (id: string) =>
  get<InstrumentDuration>(`/v1/instrument-durations/${id}`);

/**
 * Create a new instrument duration
 */
export const createInstrumentDuration = (
  data: Omit<InstrumentDuration, 'id'>,
  lastChangedUser: string,
) =>
  post<InstrumentDuration>('/v1/instrument-durations', data, lastChangedUser);

/**
 * Update an existing instrument duration
 */
export const updateInstrumentDuration = (
  id: string,
  data: Partial<InstrumentDuration>,
  lastChangedUser: string,
) =>
  put<InstrumentDuration>(
    `/v1/instrument-durations/${id}`,
    data,
    lastChangedUser,
  );

/**
 * Delete an instrument duration
 */
export const deleteInstrumentDuration = (id: string, lastChangedUser: string) =>
  del(`/v1/instrument-durations/${id}`, lastChangedUser);

/**
 * Export durations to Excel
 */
export const exportInstrumentDurations = (params?: {
  startDate?: string;
  endDate?: string;
}) =>
  get<Blob>('/v1/instrument-durations/export', {
    ...params,
    isBinaryResponse: true,
  });

// ============================================================================
// Betas API Functions
// ============================================================================

/**
 * Get paginated list of instrument betas with optional filters
 */
export const getInstrumentBetas = (params?: {
  search?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
  benchmark?: string;
  startDate?: string;
  endDate?: string;
}) =>
  get<{ data: InstrumentBeta[]; total: number }>(
    '/v1/instrument-betas',
    params,
  );

/**
 * Get a single beta by ID
 */
export const getInstrumentBeta = (id: string) =>
  get<InstrumentBeta>(`/v1/instrument-betas/${id}`);

/**
 * Create a new instrument beta
 */
export const createInstrumentBeta = (
  data: Omit<InstrumentBeta, 'id'>,
  lastChangedUser: string,
) => post<InstrumentBeta>('/v1/instrument-betas', data, lastChangedUser);

/**
 * Update an existing instrument beta
 */
export const updateInstrumentBeta = (
  id: string,
  data: Partial<InstrumentBeta>,
  lastChangedUser: string,
) => put<InstrumentBeta>(`/v1/instrument-betas/${id}`, data, lastChangedUser);

/**
 * Delete an instrument beta
 */
export const deleteInstrumentBeta = (id: string, lastChangedUser: string) =>
  del(`/v1/instrument-betas/${id}`, lastChangedUser);

/**
 * Export betas to Excel
 */
export const exportInstrumentBetas = (params?: {
  benchmark?: string;
  startDate?: string;
  endDate?: string;
}) =>
  get<Blob>('/v1/instrument-betas/export', {
    ...params,
    isBinaryResponse: true,
  });

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get list of available indexes for dropdown
 */
export const getIndexList = () =>
  get<Array<{ code: string; name: string }>>('/v1/indexes');

/**
 * Get list of available benchmarks for dropdown
 */
export const getBenchmarkList = () =>
  get<Array<{ code: string; name: string }>>('/v1/benchmarks');

/**
 * Get list of instruments for ISIN dropdown
 */
export const getInstrumentList = () =>
  get<Array<{ isin: string; name: string }>>('/v1/instruments');
