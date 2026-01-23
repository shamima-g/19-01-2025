/**
 * Instruments API Functions (Stub)
 *
 * This is a stub file created for TDD (Test-Driven Development).
 * Tests have been written in __tests__/integration/instrument-static-data.test.tsx
 *
 * TODO: Implement these API functions to make the tests pass
 *
 * Epic 4: Instrument Static Data Management
 */

import { get, post, put, del } from './client';

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

// API Functions (to be implemented)

/**
 * Story 4.1: Get all instruments with optional filtering and pagination
 */
export const getInstruments = async (params?: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Instrument[]; total: number }> => {
  // TODO: Implement
  throw new Error('Not implemented');
};

/**
 * Story 4.2: Create a new instrument
 */
export const createInstrument = async (
  data: Omit<Instrument, 'id'>,
  lastChangedUser?: string,
): Promise<Instrument> => {
  // TODO: Implement
  throw new Error('Not implemented');
};

/**
 * Story 4.3: Update an existing instrument
 */
export const updateInstrument = async (
  id: string,
  data: Partial<Omit<Instrument, 'id' | 'isin'>>,
  lastChangedUser?: string,
): Promise<Instrument> => {
  // TODO: Implement
  throw new Error('Not implemented');
};

/**
 * Story 4.4: Upload instruments file
 */
export const uploadInstrumentsFile = async (
  file: File,
  lastChangedUser?: string,
): Promise<InstrumentUploadResult> => {
  // TODO: Implement
  throw new Error('Not implemented');
};

/**
 * Story 4.5: Get audit trail for an instrument
 */
export const getInstrumentAuditTrail = async (
  instrumentId: string,
  params?: { page?: number; limit?: number },
): Promise<InstrumentAuditRecord[]> => {
  // TODO: Implement
  throw new Error('Not implemented');
};

/**
 * Story 4.5: Export audit trail to Excel
 */
export const exportInstrumentAuditTrail = async (
  instrumentId: string,
): Promise<Blob> => {
  // TODO: Implement
  throw new Error('Not implemented');
};

/**
 * Story 4.6: Get history snapshots for an instrument
 */
export const getInstrumentHistory = async (
  instrumentId: string,
): Promise<InstrumentHistorySnapshot[]> => {
  // TODO: Implement
  throw new Error('Not implemented');
};

/**
 * Story 4.7: Export incomplete instruments to Excel
 */
export const exportIncompleteInstruments = async (): Promise<Blob> => {
  // TODO: Implement
  throw new Error('Not implemented');
};

/**
 * Story 4.8: Get instrument details (for popup)
 */
export const getInstrumentDetails = async (
  instrumentId: string,
): Promise<Instrument> => {
  // TODO: Implement
  throw new Error('Not implemented');
};
