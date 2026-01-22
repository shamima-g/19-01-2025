/**
 * API Client for Multi-Level Approval Workflow (Epic 8)
 */

import { get, post } from './client';
import type {
  ApprovalData,
  ApprovalHistory,
  CommentsData,
  ApprovalLogsData,
  ApprovalResponse,
  RejectionRequest,
  AddCommentRequest,
} from '@/types/approval';

// Level 1 Approval
export const getLevel1ApprovalData = (batchId: string) =>
  get<ApprovalData>(`/v1/approvals/level1/${batchId}`);

export const approveLevel1 = (batchId: string) =>
  post<ApprovalResponse>(`/v1/approvals/level1/${batchId}/approve`);

export const rejectLevel1 = (batchId: string, request: RejectionRequest) =>
  post<ApprovalResponse>(`/v1/approvals/level1/${batchId}/reject`, request);

// Level 2 Approval
export const getLevel2ApprovalData = (batchId: string) =>
  get<ApprovalData>(`/v1/approvals/level2/${batchId}`);

export const approveLevel2 = (batchId: string) =>
  post<ApprovalResponse>(`/v1/approvals/level2/${batchId}/approve`);

export const rejectLevel2 = (batchId: string, request: RejectionRequest) =>
  post<ApprovalResponse>(`/v1/approvals/level2/${batchId}/reject`, request);

// Level 3 Approval (Final)
export const getLevel3ApprovalData = (batchId: string) =>
  get<ApprovalData>(`/v1/approvals/level3/${batchId}`);

export const approveLevel3 = (batchId: string) =>
  post<ApprovalResponse>(`/v1/approvals/level3/${batchId}/approve`);

export const rejectLevel3 = (batchId: string, request: RejectionRequest) =>
  post<ApprovalResponse>(`/v1/approvals/level3/${batchId}/reject`, request);

// Approval History
export const getApprovalHistory = (batchId: string) =>
  get<ApprovalHistory>(`/v1/approvals/${batchId}/history`);

// Comments
export const getComments = (batchId: string) =>
  get<CommentsData>(`/v1/report-comments?batchId=${batchId}`);

export const addComment = (batchId: string, request: AddCommentRequest) =>
  post<{ success: boolean; comment: { id: string } }>(`/v1/report-comments`, {
    ...request,
    batchId,
  });

// Approval Logs
export const getApprovalLogs = (params?: {
  startDate?: string;
  endDate?: string;
  level?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.level) queryParams.append('level', params.level.toString());

  const queryString = queryParams.toString();
  return get<ApprovalLogsData>(
    `/v1/approval-logs${queryString ? `?${queryString}` : ''}`,
  );
};

export const exportApprovalLogs = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const queryString = queryParams.toString();
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042';
  const url = `${baseUrl}/v1/approval-logs/export${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
};

// Reject After Final Approval
export const getFinalApprovedBatches = () =>
  get<{ batches: { batchId: string; batchDate: string; status: string }[] }>(
    '/v1/approvals/reject-final',
  );

export const rejectFinalReport = (batchId: string, request: RejectionRequest) =>
  post<ApprovalResponse>(`/v1/approvals/reject-final/${batchId}`, request);

// Get Current Batch ID (utility)
export const getCurrentBatchId = () =>
  get<{ batchId: string }>('/v1/approvals/current-batch');
