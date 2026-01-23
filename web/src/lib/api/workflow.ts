/**
 * API client functions for Monthly Process Workflow Orchestration
 */

import { get, post } from './client';
import type {
  WorkflowStep,
  WorkflowStepDetails,
  WorkflowProgress,
  WorkflowComment,
  AssignOwnerRequest,
  SetDueDateRequest,
  MarkCompleteRequest,
  AddCommentRequest,
} from '@/types/workflow';

/**
 * Get all workflow steps for a batch
 */
export const getWorkflowSteps = (batchId: string) =>
  get<WorkflowStep[]>(`/v1/monthly-workflow/${batchId}`);

/**
 * Get detailed information for a specific step
 */
export const getStepDetails = (stepId: string) =>
  get<WorkflowStepDetails>(`/v1/monthly-workflow/steps/${stepId}`);

/**
 * Mark a workflow step as complete
 */
export const markStepComplete = (
  stepId: string,
  data: MarkCompleteRequest,
  lastChangedUser: string,
) =>
  post<{ success: boolean; message: string }>(
    `/v1/monthly-workflow/steps/${stepId}/complete`,
    data,
    lastChangedUser,
  );

/**
 * Assign an owner to a workflow step
 */
export const assignStepOwner = (
  stepId: string,
  data: AssignOwnerRequest,
  lastChangedUser: string,
) =>
  post<{ success: boolean; message: string }>(
    `/v1/monthly-workflow/steps/${stepId}/assign`,
    data,
    lastChangedUser,
  );

/**
 * Set due date for a workflow step
 */
export const setStepDueDate = (
  stepId: string,
  data: SetDueDateRequest,
  lastChangedUser: string,
) =>
  post<{ success: boolean; message: string }>(
    `/v1/monthly-workflow/steps/${stepId}/due-date`,
    data,
    lastChangedUser,
  );

/**
 * Get workflow progress summary
 */
export const getWorkflowProgress = (batchId: string) =>
  get<WorkflowProgress>(`/v1/monthly-workflow/${batchId}/progress`);

/**
 * Export workflow status to Excel
 */
export const exportWorkflowStatus = (batchId: string) =>
  get<Blob>(`/v1/monthly-workflow/${batchId}/export`, {
    isBinaryResponse: true,
  });

/**
 * Add a comment to a workflow step
 */
export const addStepComment = (
  stepId: string,
  data: AddCommentRequest,
  lastChangedUser: string,
) =>
  post<WorkflowComment>(
    `/v1/monthly-workflow/steps/${stepId}/comments`,
    data,
    lastChangedUser,
  );

/**
 * Get comments for a workflow step
 */
export const getStepComments = (stepId: string) =>
  get<WorkflowComment[]>(`/v1/monthly-workflow/steps/${stepId}/comments`);
