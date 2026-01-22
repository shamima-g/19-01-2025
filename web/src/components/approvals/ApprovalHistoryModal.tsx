'use client';

/**
 * Approval History Modal (Story 8.10)
 *
 * Displays a chronological list of approval actions for a batch.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getApprovalHistory } from '@/lib/api/approvals';
import type { ApprovalHistoryItem } from '@/types/approval';

interface ApprovalHistoryModalProps {
  batchId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ApprovalHistoryModal({
  batchId,
  isOpen,
  onClose,
}: ApprovalHistoryModalProps) {
  const [history, setHistory] = useState<ApprovalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApprovalHistory(batchId);
      setHistory(data.history);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (isOpen && batchId) {
      loadHistory();
    }
  }, [isOpen, batchId, loadHistory]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toISOString().split('T')[0]} ${date.toLocaleTimeString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Approval History</DialogTitle>
        </DialogHeader>

        {loading && (
          <div role="status" className="flex items-center gap-2 py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              Loading history...
            </span>
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

        {!loading && !error && history.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No approval actions recorded
          </div>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={`${item.level}-${item.timestamp}-${index}`}
                className={`p-4 border rounded-lg ${
                  item.action === 'APPROVED' ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    Level {item.level} {item.action.toLowerCase()} by{' '}
                    {item.user}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
                {item.reason && (
                  <div className="text-sm mt-2">
                    <span className="text-muted-foreground">Reason: </span>
                    <span>{item.reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ApprovalHistoryModal;
