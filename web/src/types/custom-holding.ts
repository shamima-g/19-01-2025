/**
 * Types for Custom Holdings (Epic 6)
 */

export interface CustomHolding {
  id: string;
  portfolioCode: string;
  portfolioName: string;
  isin: string;
  instrumentCode?: string;
  instrumentDescription: string;
  amount: number;
  currency: string;
  effectiveDate: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CustomHoldingListResponse {
  data: CustomHolding[];
  total: number;
}

export interface CustomHoldingListParams {
  search?: string;
  portfolio?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Portfolio {
  code: string;
  name: string;
}

export interface Instrument {
  code: string;
  description: string;
}

export interface AuditRecord {
  id: string;
  holdingId: string;
  timestamp: string;
  user: string;
  action: 'Add' | 'Update' | 'Delete';
  changes: AuditChange[];
}

export interface AuditChange {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface FullAuditRecord extends AuditRecord {
  portfolioCode: string;
  portfolioName: string;
  instrumentDescription: string;
}

export interface AuditListParams {
  portfolio?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// Form data for creating/updating holdings
export interface CustomHoldingFormData {
  portfolioCode: string;
  instrumentCode: string;
  amount: number;
  currency: string;
  effectiveDate: string;
}

// Helper to format amount with thousands separator
export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US');
}

// Helper to format date in US format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}
