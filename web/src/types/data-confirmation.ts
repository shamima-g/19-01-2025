/**
 * Types for Data Confirmation & Verification (Epic 7)
 */

// File Check Types (Story 7.1)
export interface FileCheckItem {
  received: boolean;
  status: 'complete' | 'missing' | 'partial';
  timestamp?: string;
}

export interface FileCheckData {
  assetManagers: FileCheckItem;
  bloomberg: FileCheckItem;
  custodian: FileCheckItem;
}

// Main Data Check Types (Story 7.2)
export interface MainCheckItem {
  count: number;
  status: 'complete' | 'missing';
  lastUpdated?: string;
}

export interface MainCheckData {
  holdings: MainCheckItem;
  transactions: MainCheckItem;
  income: MainCheckItem;
  cash: MainCheckItem;
  performance: MainCheckItem;
}

// Other Data Check Types (Story 7.3)
export interface OtherCheckItem {
  count: number;
  status: 'complete' | 'warning' | 'error';
}

export interface OtherCheckData {
  incompleteInstruments: OtherCheckItem;
  missingIndexPrices: OtherCheckItem;
  missingDurations: OtherCheckItem;
  missingBetas: OtherCheckItem;
  missingCreditRatings: OtherCheckItem;
}

// Overall Status Types (Story 7.5)
export interface DataConfirmationStatus {
  readyForApproval: boolean;
  status: 'ready' | 'incomplete' | 'in_progress' | 'error';
  lastUpdated: string;
  summary?: {
    filesMissing: number;
    incompleteInstruments: number;
    otherIssues: number;
  };
}

// Tab Types
export type DataConfirmationTab = 'file-check' | 'main-check' | 'other-check';
