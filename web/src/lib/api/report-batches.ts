/**
 * Report Batches API Functions
 * API endpoints for Epic 1: Start Page & Report Batch Management
 */

import type {
  ReportBatch,
  ReportBatchListResponse,
  CreateBatchRequest,
  CreateBatchResponse,
} from '@/types/report-batch';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042';

/**
 * Fetch report batches with pagination and search
 */
export async function getReportBatches(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<ReportBatchListResponse> {
  const { page = 1, pageSize = 10, search } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (search) {
    queryParams.set('search', search);
  }

  const response = await fetch(
    `${API_BASE_URL}/v1/report-batches?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.Messages?.[0] || 'Failed to fetch report batches',
    );
  }

  return response.json();
}

/**
 * Create a new report batch
 */
export async function createReportBatch(
  data: CreateBatchRequest,
): Promise<CreateBatchResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/report-batches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.Messages?.[0] || 'Failed to create report batch');
  }

  return response.json();
}

/**
 * Get a single report batch by ID
 */
export async function getReportBatch(batchId: string): Promise<ReportBatch> {
  const response = await fetch(`${API_BASE_URL}/v1/report-batches/${batchId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expired');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.Messages?.[0] || 'Failed to fetch report batch');
  }

  return response.json();
}

/**
 * Export report batches to CSV
 */
export async function exportReportBatches(params: {
  includeFiltered?: boolean;
  search?: string;
}): Promise<Blob> {
  const { includeFiltered = false, search } = params;

  const queryParams = new URLSearchParams({
    includeFiltered: String(includeFiltered),
  });

  if (search) {
    queryParams.set('search', search);
  }

  const response = await fetch(
    `${API_BASE_URL}/v1/report-batches/export?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'text/csv',
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.Messages?.[0] || 'Failed to export report batches',
    );
  }

  return response.blob();
}
