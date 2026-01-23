'use client';

/**
 * Monthly Workflow Page (Epic 10)
 *
 * Features:
 * - Story 10.1: View workflow steps with status, dependencies, owner
 * - Story 10.2: View step details with tasks
 * - Story 10.3: Mark step complete with confirmation
 * - Story 10.4: View blocked steps (red highlight)
 * - Story 10.5: View critical path
 * - Story 10.6: Assign step owner
 * - Story 10.7: Set due dates
 * - Story 10.8: View overall progress
 * - Story 10.9: Export workflow status
 * - Story 10.10: Add workflow comments
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/contexts/ToastContext';
import { get, post } from '@/lib/api/client';
import type {
  WorkflowStep,
  WorkflowStepDetails,
  WorkflowProgress,
  WorkflowComment,
} from '@/types/workflow';

// Mock batch ID for now - in real app would come from route params or context
const BATCH_ID = 'batch-123';
const CURRENT_USER = 'currentUser';

// Mock users for owner assignment
const USERS = [
  { id: 'user-123', name: 'John Doe' },
  { id: 'user-456', name: 'Jane Smith' },
  { id: 'new-user', name: 'New User' },
];

export default function WorkflowPage() {
  const { showToast } = useToast();

  // State
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [criticalPathError, setCriticalPathError] = useState<string | null>(
    null,
  );

  // Selected step details
  const [selectedStep, setSelectedStep] = useState<WorkflowStepDetails | null>(
    null,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Dialogs
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [showAssignOwner, setShowAssignOwner] = useState(false);
  const [showSetDueDate, setShowSetDueDate] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dueDateValue, setDueDateValue] = useState('');
  const [dueDateWarning, setDueDateWarning] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  // Comments
  const [comments, setComments] = useState<WorkflowComment[]>([]);

  // Load workflow data
  const loadWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Load steps first
      const stepsData = await get<WorkflowStep[]>(
        `/v1/monthly-workflow/${BATCH_ID}`,
      );
      setSteps(Array.isArray(stepsData) ? stepsData : []);

      // Then try to load progress (non-blocking if it fails)
      try {
        const progressData = await get<WorkflowProgress>(
          `/v1/monthly-workflow/${BATCH_ID}/progress`,
        );
        if (
          progressData &&
          typeof progressData === 'object' &&
          'percentage' in progressData
        ) {
          setProgress(progressData);
        }
      } catch {
        // Progress is optional, don't fail if it can't be loaded
        console.warn('Could not load progress');
      }
    } catch (err) {
      console.error('Failed to load workflow:', err);
      setError('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  // Load step details
  const handleStepClick = async (stepId: string) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      const details = await get<WorkflowStepDetails>(
        `/v1/monthly-workflow/steps/${stepId}`,
      );
      setSelectedStep(details);
    } catch (err) {
      console.error('Failed to load step details:', err);
      setDetailsError('Failed to load step details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Show critical path
  const handleShowCriticalPath = async () => {
    try {
      setCriticalPathError(null);
      // Refresh steps to get updated critical path info
      const stepsData = await get<WorkflowStep[]>(
        `/v1/monthly-workflow/${BATCH_ID}`,
      );
      setSteps(stepsData);
      setShowCriticalPath(true);
    } catch (err) {
      console.error('Failed to calculate critical path:', err);
      setCriticalPathError('Unable to calculate critical path');
    }
  };

  // Mark step complete
  const handleMarkComplete = async () => {
    if (!activeStepId) return;

    // Check if all tasks are complete
    if (selectedStep && selectedStep.tasks.some((t) => !t.completed)) {
      setCompleteError('All tasks must be completed first');
      return;
    }

    try {
      setCompleteError(null);
      await post(
        `/v1/monthly-workflow/steps/${activeStepId}/complete`,
        { confirmed: true },
        CURRENT_USER,
      );
      showToast({ variant: 'success', title: 'Step marked complete' });
      setShowConfirmComplete(false);
      setActiveStepId(null);
      // Reload workflow to get updated status
      await loadWorkflow();
    } catch (err) {
      console.error('Failed to mark complete:', err);
      setCompleteError('Failed to update step status');
    }
  };

  // Assign owner
  const handleAssignOwner = async () => {
    if (!activeStepId || !selectedUserId) return;

    try {
      setOwnerError(null);
      const result = await post<{ success: boolean; message: string }>(
        `/v1/monthly-workflow/steps/${activeStepId}/assign`,
        { userId: selectedUserId },
        CURRENT_USER,
      );
      showToast({
        variant: 'success',
        title: result.message || 'Owner assigned successfully',
      });
      setShowAssignOwner(false);
      setSelectedUserId('');
      setActiveStepId(null);
      await loadWorkflow();
    } catch (err) {
      console.error('Failed to assign owner:', err);
      setOwnerError('Failed to assign owner');
    }
  };

  // Set due date
  const handleSetDueDate = async () => {
    if (!activeStepId || !dueDateValue) return;

    // Check for prerequisite warning
    if (selectedStep?.prerequisites?.some((p) => p.includes('Due:'))) {
      const prereqDateMatch = selectedStep.prerequisites[0]?.match(
        /Due: (\d{4}-\d{2}-\d{2})/,
      );
      if (prereqDateMatch && dueDateValue < prereqDateMatch[1]) {
        setDueDateWarning('Due date is before prerequisites');
        return;
      }
    }

    try {
      setDueDateError(null);
      setDueDateWarning(null);
      await post(
        `/v1/monthly-workflow/steps/${activeStepId}/due-date`,
        { dueDate: dueDateValue },
        CURRENT_USER,
      );
      showToast({ variant: 'success', title: 'Due date set successfully' });
      setShowSetDueDate(false);
      setDueDateValue('');
      setActiveStepId(null);
      await loadWorkflow();
    } catch (err) {
      console.error('Failed to set due date:', err);
      setDueDateError('Failed to set due date');
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!activeStepId) return;

    if (!commentText.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    try {
      setCommentError(null);
      const newComment = await post<WorkflowComment>(
        `/v1/monthly-workflow/steps/${activeStepId}/comments`,
        { text: commentText },
        CURRENT_USER,
      );
      setComments([...comments, newComment]);
      showToast({ variant: 'success', title: 'Comment added successfully' });
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setCommentError('Failed to add comment');
    }
  };

  // Export workflow status
  const handleExportStatus = async () => {
    try {
      const blob = await get<Blob>(`/v1/monthly-workflow/${BATCH_ID}/export`, {
        isBinaryResponse: true,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const now = new Date();
      link.download = `MonthlyWorkflow_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      showToast({ variant: 'error', title: 'Export failed' });
    }
  };

  // Get status badge style
  const getStatusStyle = (status: string, isOverdue?: boolean) => {
    if (isOverdue) return { color: 'red' };
    switch (status) {
      case 'complete':
        return { backgroundColor: '#10B981', color: 'white' };
      case 'in-progress':
        return { backgroundColor: '#F59E0B', color: 'white' };
      case 'blocked':
        return { color: 'red' };
      default:
        return { backgroundColor: '#9CA3AF', color: 'white' };
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div role="status" className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">
            Loading workflow...
          </span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && steps.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render empty state
  if (steps.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No active workflow - create a new report batch to begin
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Monthly Workflow</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShowCriticalPath}>
            Show Critical Path
          </Button>
          <Button variant="outline" onClick={handleExportStatus}>
            Export Status
          </Button>
        </div>
      </div>

      {/* Progress Bar (Story 10.8) */}
      {progress && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {progress.percentage === 100
                  ? '100% Complete - Workflow Finished'
                  : `${progress.percentage}% Complete`}
              </span>
              {progress.estimatedCompletionDate && showCriticalPath && (
                <span className="text-sm text-muted-foreground">
                  Estimated completion: {progress.estimatedCompletionDate}
                </span>
              )}
            </div>
            <div
              role="progressbar"
              aria-valuenow={progress.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-4 w-full bg-gray-200 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Path Error */}
      {criticalPathError && (
        <div className="text-red-600 text-sm">{criticalPathError}</div>
      )}

      {/* Dependencies Error */}
      {error && error.includes('dependencies') && (
        <div className="text-red-600 text-sm">
          Unable to determine dependencies
        </div>
      )}

      {/* Workflow Steps (Story 10.1) */}
      <div className="grid gap-4">
        {steps.map((step) => (
          <article
            key={step.id}
            role="article"
            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
              step.status === 'blocked' ? 'blocked border-red-300' : ''
            } ${showCriticalPath && step.isOnCriticalPath ? 'critical-path ring-2 ring-orange-400' : ''}`}
            onClick={() => handleStepClick(step.id)}
            style={
              step.status === 'blocked' || step.isOverdue
                ? { color: 'red' }
                : undefined
            }
            title={
              step.status === 'blocked'
                ? `Blocked by: ${step.dependencies.join(', ')}`
                : showCriticalPath && step.isOnCriticalPath
                  ? 'Delay in this step will impact final deadline'
                  : undefined
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{step.name}</span>
                  {step.isOverdue && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                      OVERDUE
                    </span>
                  )}
                  <span
                    className="px-2 py-1 text-xs rounded"
                    style={getStatusStyle(step.status, step.isOverdue)}
                  >
                    {step.status === 'complete' ? 'Complete' : step.status}
                  </span>
                </div>
                {step.owner && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {step.owner}
                  </div>
                )}
                {step.dependencies.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Depends on:{' '}
                    {steps
                      .filter((s) => step.dependencies.includes(s.id))
                      .map((s) => s.name)
                      .join(', ') || step.dependencies.join(', ')}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStepId(step.id);
                    setShowConfirmComplete(true);
                  }}
                >
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStepId(step.id);
                    setShowAssignOwner(true);
                  }}
                >
                  Assign Owner
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStepId(step.id);
                    setShowSetDueDate(true);
                  }}
                >
                  Set Due Date
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveStepId(step.id);
                    setShowAddComment(true);
                  }}
                >
                  Add Comment
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Step Details Panel (Story 10.2) */}
      {detailsLoading && <div className="text-sm">Loading details...</div>}
      {detailsError && <div className="text-red-600">{detailsError}</div>}
      {selectedStep && !detailsLoading && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedStep.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Description</div>
              <div>{selectedStep.description}</div>
            </div>
            {selectedStep.prerequisites.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground">
                  Prerequisites
                </div>
                <div>{selectedStep.prerequisites.join(', ')}</div>
              </div>
            )}
            {selectedStep.blockedBy && selectedStep.blockedBy.length > 0 && (
              <div>
                <div className="text-sm text-muted-foreground">Blocked By</div>
                <div>{selectedStep.blockedBy.join(', ')}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Progress</div>
              <div>{selectedStep.progress}%</div>
            </div>
            {selectedStep.owner && (
              <div>
                <div className="text-sm text-muted-foreground">Owner</div>
                <div>{selectedStep.owner}</div>
              </div>
            )}
            {selectedStep.dueDate && (
              <div>
                <div className="text-sm text-muted-foreground">Due Date</div>
                <div>{selectedStep.dueDate}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground mb-2">Tasks</div>
              {selectedStep.tasks.length === 0 ? (
                <div className="text-muted-foreground">
                  No tasks defined for this step
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedStep.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="h-4 w-4"
                      />
                      {task.link ? (
                        <Link
                          href={task.link}
                          className="text-primary hover:underline"
                        >
                          {task.name}
                        </Link>
                      ) : (
                        <span>{task.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Display */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-2 last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{comment.username}</span>
                  <span className="text-muted-foreground">
                    {comment.timestamp.split('T')[0]}
                  </span>
                </div>
                <div className="mt-1">{comment.text}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Mark Complete Dialog (Story 10.3) */}
      <Dialog open={showConfirmComplete} onOpenChange={setShowConfirmComplete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Step Complete</DialogTitle>
            <DialogDescription>
              Are you sure this step is complete?
            </DialogDescription>
          </DialogHeader>
          {completeError && (
            <div className="text-red-600 text-sm">{completeError}</div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmComplete(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkComplete}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Owner Dialog (Story 10.6) */}
      <Dialog open={showAssignOwner} onOpenChange={setShowAssignOwner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Owner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-select">Select User</Label>
              <select
                id="user-select"
                aria-label="Select User"
                className="w-full mt-1 p-2 border rounded"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user...</option>
                {USERS.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            {ownerError && (
              <div className="text-red-600 text-sm">{ownerError}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignOwner(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignOwner}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Due Date Dialog (Story 10.7) */}
      <Dialog open={showSetDueDate} onOpenChange={setShowSetDueDate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Due Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDateValue}
                onChange={(e) => setDueDateValue(e.target.value)}
              />
            </div>
            {dueDateWarning && (
              <div className="text-yellow-600 text-sm">{dueDateWarning}</div>
            )}
            {dueDateError && (
              <div className="text-red-600 text-sm">{dueDateError}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetDueDate(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetDueDate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Comment Dialog (Story 10.10) */}
      <Dialog open={showAddComment} onOpenChange={setShowAddComment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment..."
              />
            </div>
            {commentError && (
              <div className="text-red-600 text-sm">{commentError}</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddComment(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddComment}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { WorkflowPage };
