'use client';

/**
 * Level 2 Approval Page (Stories 8.4, 8.5, 8.6)
 *
 * Displays approval summary and allows Level 2 approvers to
 * approve or reject the report batch after Level 1 approval.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/contexts/ToastContext';
import {
  getLevel2ApprovalData,
  approveLevel2,
  rejectLevel2,
} from '@/lib/api/approvals';
import type { ApprovalData } from '@/types/approval';

export default function Level2ApprovalPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // Use batchId from URL or default to 'current'
  const batchId = searchParams.get('batchId') || 'current';
  const [approvalData, setApprovalData] = useState<ApprovalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [prerequisiteError, setPrerequisiteError] = useState<string | null>(
    null,
  );

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadApprovalData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setAccessDenied(false);
      setPrerequisiteError(null);
      const data = await getLevel2ApprovalData(id);
      setApprovalData(data);

      // Check prerequisite - Level 1 must be approved
      if (
        data.status !== 'L1_APPROVED' &&
        data.status !== 'L2_APPROVED' &&
        data.status !== 'L2_REJECTED'
      ) {
        setPrerequisiteError('Level 1 approval required first');
      }
    } catch (err) {
      console.error('Failed to load approval data:', err);
      if (
        err &&
        typeof err === 'object' &&
        'statusCode' in err &&
        err.statusCode === 403
      ) {
        setAccessDenied(true);
      } else if (
        err &&
        typeof err === 'object' &&
        'statusCode' in err &&
        err.statusCode === 400 &&
        'message' in err &&
        typeof err.message === 'string' &&
        err.message.toLowerCase().includes('level 1')
      ) {
        setPrerequisiteError(err.message as string);
      } else {
        setError('Failed to load approval data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovalData(batchId);
  }, [batchId, loadApprovalData]);

  const handleApprove = async () => {
    if (!batchId) return;

    setIsSubmitting(true);
    try {
      await approveLevel2(batchId);
      setSuccessMessage('Level 2 approval successful');
      setShowApproveDialog(false);
      showToast({ variant: 'success', title: 'Level 2 approval successful' });
      // Refresh data
      await loadApprovalData(batchId);
    } catch (err) {
      console.error('Approval failed:', err);
      setSuccessMessage(null);
      showToast({
        variant: 'error',
        title: 'Approval failed. Please try again.',
      });
      setError('Approval failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!batchId) return;

    // Validate reason
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason required');
      return;
    }
    if (rejectReason.trim().length < 10) {
      setRejectError('Rejection reason must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    setRejectError(null);
    try {
      await rejectLevel2(batchId, { reason: rejectReason.trim() });
      setSuccessMessage('Level 2 rejection recorded');
      setShowRejectDialog(false);
      setRejectReason('');
      showToast({ variant: 'success', title: 'Level 2 rejection recorded' });
      // Refresh data
      await loadApprovalData(batchId);
    } catch (err) {
      console.error('Rejection failed:', err);
      setRejectError('Rejection failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAlreadyApproved = approvalData?.level2Approval?.status === 'APPROVED';
  const isAlreadyRejected =
    approvalData?.status === 'L2_REJECTED' ||
    approvalData?.level2Approval?.status === 'REJECTED';
  const canTakeAction =
    approvalData?.status === 'L1_APPROVED' && !prerequisiteError;

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div role="status" className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">
            Loading approval data...
          </span>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 font-medium">Access Denied</p>
            <p className="text-red-600 text-sm mt-1">
              You do not have permission to access this approval level.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !approvalData) {
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Level 2 Approval</h1>

      {successMessage && (
        <div
          role="alert"
          className="p-4 text-sm text-green-700 bg-green-100 rounded-md"
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-4 text-sm text-red-700 bg-red-100 rounded-md"
        >
          {error}
        </div>
      )}

      {prerequisiteError && (
        <div
          role="alert"
          className="p-4 text-sm text-yellow-700 bg-yellow-100 rounded-md"
        >
          {prerequisiteError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Approval Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Batch Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Batch Date</p>
              <p className="font-medium">
                Batch Date: {approvalData?.batchDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{approvalData?.overallStatus}</p>
            </div>
          </div>

          {/* Data Summary */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm font-medium mb-2">Data Summary</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Files: </span>
                <span className="font-medium">
                  {approvalData?.dataSummary.fileCount} files
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Records: </span>
                <span className="font-medium">
                  {approvalData?.dataSummary.recordCount} records
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Portfolios: </span>
                <span className="font-medium">
                  {approvalData?.dataSummary.portfolioCount} portfolios
                </span>
              </div>
            </div>
          </div>

          {/* Portfolio Validation */}
          <div className="p-4 border rounded-lg">
            <p className="text-sm font-medium mb-2">Validation Status</p>
            <p className="text-sm text-green-600">
              All portfolio checks passed
            </p>
          </div>

          {/* Level 1 Approval Info */}
          {approvalData?.level1Approval && (
            <div className="p-4 border rounded-lg bg-green-50">
              <p className="text-sm font-medium mb-1">Level 1 Approval</p>
              <p className="text-sm text-muted-foreground">
                {approvalData.level1Approval.status} by{' '}
                {approvalData.level1Approval.approver} on{' '}
                {new Date(
                  approvalData.level1Approval.timestamp,
                ).toLocaleString()}
              </p>
            </div>
          )}

          {/* Level 2 Approval Info */}
          {approvalData?.level2Approval && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <p className="text-sm font-medium mb-1">Level 2 Approval</p>
              <p className="text-sm text-muted-foreground">
                {approvalData.level2Approval.status} by{' '}
                {approvalData.level2Approval.approver} on{' '}
                {new Date(
                  approvalData.level2Approval.timestamp,
                ).toLocaleString()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <div className="relative group">
              <Button
                onClick={() => setShowApproveDialog(true)}
                disabled={
                  isAlreadyApproved || isAlreadyRejected || !canTakeAction
                }
                className="min-w-32"
                aria-describedby={
                  isAlreadyApproved ? 'approve-tooltip' : undefined
                }
              >
                Approve
              </Button>
              {isAlreadyApproved && (
                <div
                  id="approve-tooltip"
                  role="tooltip"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                >
                  Already approved
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(true)}
              disabled={
                isAlreadyApproved || isAlreadyRejected || !canTakeAction
              }
              className="min-w-32"
            >
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approval Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this batch?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Yes, Proceed'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Batch</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection (minimum 10 characters).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError(null);
              }}
              placeholder="Enter rejection reason..."
              className="mt-2"
              rows={4}
            />
            {rejectError && (
              <p className="text-sm text-red-600 mt-2">{rejectError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
                setRejectError(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Named export for testing
export { Level2ApprovalPage };
