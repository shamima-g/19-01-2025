/**
 * Instrument Types
 * Types for Epic 4: Instrument Static Data Management
 */

/**
 * Instrument status values
 */
export type InstrumentStatus = 'Complete' | 'Incomplete';

/**
 * Asset class categories
 */
export type AssetClass =
  | 'Equity'
  | 'Fixed Income'
  | 'Money Market'
  | 'Derivatives'
  | 'Alternative'
  | 'Real Estate'
  | 'Commodities'
  | 'Other';

/**
 * Currency codes (ISO 4217)
 */
export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CHF'
  | 'AUD'
  | 'CAD'
  | 'ZAR'
  | 'Other';

/**
 * Individual instrument record
 */
export interface Instrument {
  id: string;
  isin: string;
  name: string;
  assetClass: AssetClass | string;
  currency: CurrencyCode | string;
  status: InstrumentStatus;
  issuer?: string | null;
  maturityDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  lastChangedBy?: string;
}

/**
 * API response for instrument list
 */
export interface InstrumentListResponse {
  instruments: Instrument[];
  totalCount: number;
  hasMore?: boolean;
}

/**
 * API request parameters for listing instruments
 */
export interface InstrumentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: InstrumentStatus;
  assetClass?: AssetClass | string;
}

/**
 * Create/Update instrument request
 */
export interface InstrumentRequest {
  isin: string;
  name: string;
  assetClass: AssetClass | string;
  currency: CurrencyCode | string;
  issuer?: string;
  maturityDate?: string;
}

/**
 * Instrument audit trail entry
 */
export interface InstrumentAuditEntry {
  id: string;
  instrumentId: string;
  action: 'Created' | 'Updated' | 'Deleted';
  changedBy: string;
  changedAt: string;
  previousValues?: Partial<Instrument>;
  newValues?: Partial<Instrument>;
}

/**
 * API response for audit trail
 */
export interface InstrumentAuditResponse {
  entries: InstrumentAuditEntry[];
  totalCount: number;
  hasMore?: boolean;
}

/**
 * Instrument history entry (field-level changes)
 */
export interface InstrumentHistoryEntry {
  id: string;
  instrumentId: string;
  field: string;
  previousValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
}

/**
 * API response for instrument history
 */
export interface InstrumentHistoryResponse {
  history: InstrumentHistoryEntry[];
  totalCount: number;
  hasMore?: boolean;
}

/**
 * Upload instruments file response
 */
export interface InstrumentUploadResponse {
  success: boolean;
  message: string;
  importedCount?: number;
  errorCount?: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

/**
 * Export incomplete ISINs response
 */
export interface IncompleteIsinsExportParams {
  format?: 'csv' | 'excel';
  assetClass?: AssetClass | string;
}

/**
 * Column visibility configuration
 */
export interface ColumnVisibility {
  isin: boolean;
  name: boolean;
  assetClass: boolean;
  currency: boolean;
  status: boolean;
  issuer: boolean;
  maturityDate: boolean;
}

/**
 * Default column visibility (includes Status for grid view)
 */
export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  isin: true,
  name: true,
  assetClass: true,
  currency: true,
  status: true,
  issuer: false,
  maturityDate: false,
};

/**
 * Summary column visibility (minimal columns for Summary view)
 */
export const SUMMARY_COLUMN_VISIBILITY: ColumnVisibility = {
  isin: true,
  name: true,
  assetClass: true,
  currency: true,
  status: false,
  issuer: false,
  maturityDate: false,
};

/**
 * All columns visible configuration
 */
export const ALL_COLUMNS_VISIBILITY: ColumnVisibility = {
  isin: true,
  name: true,
  assetClass: true,
  currency: true,
  status: true,
  issuer: true,
  maturityDate: true,
};

/**
 * Column definitions for the grid
 */
export const INSTRUMENT_COLUMNS = [
  { key: 'isin', label: 'ISIN', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'assetClass', label: 'Asset Class', sortable: true },
  { key: 'currency', label: 'Currency', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'issuer', label: 'Issuer', sortable: true },
  { key: 'maturityDate', label: 'Maturity Date', sortable: true },
] as const;

/**
 * LocalStorage key for column preferences
 */
export const COLUMN_PREFERENCES_KEY = 'instrument-column-visibility';
