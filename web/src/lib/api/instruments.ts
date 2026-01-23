/**
 * Instruments API Functions
 *
 * Epic 4: Instrument Static Data Management
 * Stories: 4.1 - 4.9
 */

import { STATIC_DATA_API_URL } from '@/lib/utils/constants';

// Type definitions
export interface Instrument {
  id: string;
  isin: string;
  name: string;
  assetClass: string;
  currency: string;
  status: string;
  issuer?: string;
  maturityDate?: string | null;
}

export interface InstrumentAuditRecord {
  id: string;
  date: string;
  user: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
}

export interface InstrumentHistorySnapshot {
  id: string;
  date: string;
  name: string;
  assetClass: string;
  currency: string;
  status: string;
}

export interface InstrumentUploadResult {
  added: number;
  updated: number;
  errors: Array<{ row: number; reason: string }>;
}

/**
 * Story 4.1: Get all instruments with optional filtering and pagination
 */
export const getInstruments = async (params?: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Instrument[]; total: number }> => {
  const url = new URL(`${STATIC_DATA_API_URL}/v1/instruments`);

  if (params?.search) {
    url.searchParams.append('search', params.search);
  }
  if (params?.sort) {
    url.searchParams.append('sort', params.sort);
  }
  if (params?.page !== undefined) {
    url.searchParams.append('page', String(params.page));
  }
  if (params?.limit !== undefined) {
    url.searchParams.append('limit', String(params.limit));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch instruments');
  }

  return response.json();
};

/**
 * Story 4.2: Create a new instrument
 */
export const createInstrument = async (
  data: Omit<Instrument, 'id'>,
  lastChangedUser?: string,
): Promise<Instrument> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (lastChangedUser) {
    headers['LastChangedUser'] = lastChangedUser;
  }

  const response = await fetch(`${STATIC_DATA_API_URL}/v1/instruments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.Messages?.[0] || 'Failed to create instrument';
    throw new Error(message);
  }

  return response.json();
};

/**
 * Story 4.3: Update an existing instrument
 */
export const updateInstrument = async (
  id: string,
  data: Partial<Omit<Instrument, 'id' | 'isin'>>,
  lastChangedUser?: string,
): Promise<Instrument> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (lastChangedUser) {
    headers['LastChangedUser'] = lastChangedUser;
  }

  const response = await fetch(`${STATIC_DATA_API_URL}/v1/instruments/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.Messages?.[0] || 'Failed to update instrument';
    throw new Error(message);
  }

  return response.json();
};

/**
 * Story 4.4: Upload instruments file
 */
export const uploadInstrumentsFile = async (
  file: File,
  lastChangedUser?: string,
): Promise<InstrumentUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};

  if (lastChangedUser) {
    headers['LastChangedUser'] = lastChangedUser;
  }

  const response = await fetch(`${STATIC_DATA_API_URL}/v1/instruments/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
};

/**
 * Story 4.5: Get audit trail for an instrument
 */
export const getInstrumentAuditTrail = async (
  instrumentId: string,
  params?: { page?: number; limit?: number },
): Promise<InstrumentAuditRecord[]> => {
  const url = new URL(
    `${STATIC_DATA_API_URL}/v1/instruments/${instrumentId}/audit-trail`,
  );

  if (params?.page !== undefined) {
    url.searchParams.append('page', String(params.page));
  }
  if (params?.limit !== undefined) {
    url.searchParams.append('limit', String(params.limit));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch audit trail');
  }

  return response.json();
};

/**
 * Story 4.5: Export audit trail to Excel
 */
export const exportInstrumentAuditTrail = async (
  instrumentId: string,
): Promise<Blob> => {
  const response = await fetch(
    `${STATIC_DATA_API_URL}/v1/instruments/${instrumentId}/audit-trail/export`,
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to export audit trail');
  }

  return response.blob();
};

/**
 * Story 4.6: Get history snapshots for an instrument
 */
export const getInstrumentHistory = async (
  instrumentId: string,
): Promise<InstrumentHistorySnapshot[]> => {
  const response = await fetch(
    `${STATIC_DATA_API_URL}/v1/instruments/${instrumentId}/history`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json();
};

/**
 * Story 4.7: Export incomplete instruments to Excel
 */
export const exportIncompleteInstruments = async (): Promise<Blob> => {
  const response = await fetch(
    `${STATIC_DATA_API_URL}/v1/instruments/incomplete`,
    {
      method: 'GET',
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.Messages?.[0] || 'No incomplete instruments found';
    throw new Error(message);
  }

  return response.blob();
};

/**
 * Story 4.8: Get instrument details (for popup)
 */
export const getInstrumentDetails = async (
  instrumentId: string,
): Promise<Instrument> => {
  const response = await fetch(
    `${STATIC_DATA_API_URL}/v1/instruments/${instrumentId}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch instrument details');
  }

  return response.json();
};
