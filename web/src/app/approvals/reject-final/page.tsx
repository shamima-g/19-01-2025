'use client';

/**
 * Reject Final Report Page (Story 8.15)
 *
 * Allows administrators to reject a report after final approval
 * in exceptional circumstances.
 */

import { useState, useEffect, useCallback } from 'react';
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
  getFinalApprovedBatches,
  rejectFinalReport,
} from '@/lib/api/approvals';

interface FinalBatch {
  batchId: string;
  batchDate: string;
  status: string;
}

export default function RejectFinalReportPage() {
  const { showToast } = useToast();

  const [batches, setBatches] = useState<FinalBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<FinalBatch | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFinalApprovedBatches();
      setBatches(data.batches);
    } catch (err) {
      console.error('Failed to load batches:', err);
      setError('Failed to load approved batches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleOpenRejectDialog = (batch: FinalBatch) => {
    setSelectedBatch(batch);
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!selectedBatch) return;

    // Validate reason - requires minimum 30 characters for final rejection
    if (!rejectReason.trim()) {
      setRejectError('Rejection reason is required');
      return;
    }
    if (rejectReason.trim().length < 30) {
      setRejectError(
        'Minimum 30 characters required for post-approval rejection',
      );
      return;
    }

    setIsSubmitting(true);
    setRejectError(null);
    try {
      await rejectFinalReport(selectedBatch.batchId, {
        reason: rejectReason.trim(),
      });
      setSuccessMessage('Batch rejected and returned to preparation');
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedBatch(null);
      showToast({
        variant: 'success',
        title: 'Batch rejected and returned to preparation',
      });
      // Refresh data
      await loadBatches();
    } catch (err) {
      console.error('Rejection failed:', err);
      setRejectError('Rejection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div role="status" className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">
            Loading approved batches...
          </span>
        </div>
      </div>
    );
  }

  if (error && batches.length === 0) {
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
      <h1 className="text-2xl font-bold">Reject Final Reports</h1>

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

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-yellow-800 font-medium">Warning</p>
          <p className="text-yellow-700 text-sm mt-1">
            This action will reject a report that has already been fully
            approved. This should only be used in exceptional circumstances.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {batches.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No approved batches available for rejection
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Batch Date</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr
                      key={batch.batchId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{batch.batchDate}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenRejectDialog(batch)}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Final Report</DialogTitle>
            <DialogDescription>
              This will reject a report that has been fully approved. Please
              provide a detailed reason (minimum 30 characters).
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
              placeholder="Enter detailed rejection reason..."
              className="mt-2"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {rejectReason.length}/30 characters minimum
            </p>
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
                setSelectedBatch(null);
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
              {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Named export for testing
export { RejectFinalReportPage };
