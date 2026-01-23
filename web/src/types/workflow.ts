/**
 * Type definitions for Monthly Process Workflow Orchestration
 */

export type WorkflowStepStatus =
  | 'complete'
  | 'in-progress'
  | 'not-started'
  | 'blocked';

export interface WorkflowStep {
  id: string;
  name: string;
  status: WorkflowStepStatus;
  dependencies: string[]; // Step IDs that must complete before this step
  owner?: string;
  dueDate?: string;
  progress: number; // 0-100
  isOnCriticalPath: boolean;
  isOverdue: boolean;
  commentCount: number;
}

export interface WorkflowTask {
  id: string;
  name: string;
  completed: boolean;
  link?: string; // Link to relevant page
}

export interface WorkflowStepDetails {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  tasks: WorkflowTask[];
  progress: number;
  owner?: string;
  dueDate?: string;
  status: WorkflowStepStatus;
  blockedBy?: string[]; // Step names that are blocking this step
}

export interface WorkflowProgress {
  batchId: string;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  estimatedCompletionDate?: string;
  status: 'not-started' | 'in-progress' | 'complete';
}

export interface WorkflowComment {
  id: string;
  stepId: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface AssignOwnerRequest {
  userId: string;
}

export interface SetDueDateRequest {
  dueDate: string;
}

export interface MarkCompleteRequest {
  confirmed: boolean;
}

export interface AddCommentRequest {
  text: string;
}
