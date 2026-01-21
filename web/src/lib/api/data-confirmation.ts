/**
 * API functions for Data Confirmation & Verification (Epic 7)
 */

import { get } from './client';
import type {
  FileCheckData,
  MainCheckData,
  OtherCheckData,
  DataConfirmationStatus,
} from '@/types/data-confirmation';

const BASE_PATH = '/v1/data-confirmation';

/**
 * Get file check status
 */
export async function getFileCheck(): Promise<FileCheckData> {
  return get<FileCheckData>(`${BASE_PATH}/file-check`);
}

/**
 * Get main data check status
 */
export async function getMainCheck(): Promise<MainCheckData> {
  return get<MainCheckData>(`${BASE_PATH}/main-check`);
}

/**
 * Get other data check status
 */
export async function getOtherCheck(): Promise<OtherCheckData> {
  return get<OtherCheckData>(`${BASE_PATH}/other-check`);
}

/**
 * Get overall data confirmation status
 */
export async function getDataConfirmationStatus(): Promise<DataConfirmationStatus> {
  return get<DataConfirmationStatus>(`${BASE_PATH}/status`);
}

/**
 * Export data confirmation report to Excel
 */
export async function exportConfirmationReport(): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042'}${BASE_PATH}/export`,
    {
      method: 'GET',
      headers: {
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to export confirmation report');
  }

  return response.blob();
}
