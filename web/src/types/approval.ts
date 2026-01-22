/**
 * Types for Multi-Level Approval Workflow (Epic 8)
 */

export type ApprovalLevel = 1 | 2 | 3;

export type ApprovalStatus =
  | 'PENDING'
  | 'READY_FOR_L1'
  | 'L1_APPROVED'
  | 'L1_REJECTED'
  | 'L2_APPROVED'
  | 'L2_REJECTED'
  | 'L3_APPROVED'
  | 'L3_REJECTED'
  | 'FINAL_APPROVED'
  | 'FINAL_REJECTED';

export type ApprovalAction = 'APPROVED' | 'REJECTED';

export interface LevelApproval {
  approver: string;
  timestamp: string;
  status: ApprovalAction;
  reason?: string | null;
}

export interface DataSummary {
  fileCount: number;
  recordCount: number;
  portfolioCount: number;
}

export interface ApprovalData {
  batchId: string;
  batchDate: string;
  status: ApprovalStatus;
  overallStatus: string;
  dataSummary: DataSummary;
  level1Approval: LevelApproval | null;
  level2Approval: LevelApproval | null;
  level3Approval?: LevelApproval | null;
}

export interface ApprovalHistoryItem {
  level: ApprovalLevel;
  action: ApprovalAction;
  user: string;
  timestamp: string;
  reason: string | null;
}

export interface ApprovalHistory {
  history: ApprovalHistoryItem[];
}

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface CommentsData {
  comments: Comment[];
}

export interface ApprovalLogItem {
  batchDate: string;
  level: ApprovalLevel;
  approver: string;
  action: ApprovalAction;
  timestamp: string;
  reason: string | null;
}

export interface ApprovalLogsData {
  logs: ApprovalLogItem[];
}

export interface ApprovalResponse {
  success: boolean;
  message?: string;
  auditLog?: {
    user: string;
    timestamp: string;
  };
}

export interface RejectionRequest {
  reason: string;
}

export interface AddCommentRequest {
  text: string;
}

export interface Notification {
  id: string;
  type: 'APPROVAL' | 'REJECTION' | 'COMMENT';
  level?: ApprovalLevel;
  message: string;
  timestamp: string;
  read: boolean;
}
