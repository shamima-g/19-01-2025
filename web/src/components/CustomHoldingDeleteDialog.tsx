'use client';

/**
 * Custom Holding Delete Dialog Component (Story 6.4)
 *
 * Confirmation dialog for deleting custom holdings with:
 * - Holding details display
 * - Confirm/Cancel buttons
 * - Loading state during deletion
 * - Error handling
 * - Audit trail recording
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteCustomHolding } from '@/lib/api/custom-holdings';

interface HoldingToDelete {
  id: string;
  portfolioCode: string;
  portfolioName: string;
  isin: string;
  instrumentDescription: string;
  amount: number;
  currency: string;
  effectiveDate: string;
}

interface CustomHoldingDeleteDialogProps {
  isOpen: boolean;
  holding: HoldingToDelete | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomHoldingDeleteDialog({
  isOpen,
  holding,
  onClose,
  onSuccess,
}: CustomHoldingDeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!holding) return;

    setDeleting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Use a placeholder username - in production this would come from auth
      const username = 'CurrentUser';
      await deleteCustomHolding(holding.id, username);

      setSuccessMessage('Holding deleted successfully');

      // Call success callback and close after a brief delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to delete holding:', err);

      // Handle APIError objects from the API client
      const apiError = err as {
        message?: string;
        details?: string[];
        statusCode?: number;
      };

      // Check for network errors (statusCode 0) - show generic message
      if (apiError.statusCode === 0) {
        setError('Failed to delete. Please try again.');
      } else if (apiError.details && apiError.details.length > 0) {
        // Show specific API error messages from details array
        setError(apiError.details[0]);
      } else {
        setError('Failed to delete. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!deleting) {
      setError(null);
      setSuccessMessage(null);
      onClose();
    }
  };

  if (!isOpen || !holding) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Custom Holding</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this holding? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {/* Holding Details */}
        <div className="py-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Portfolio Code:</span>
              <span className="font-medium">{holding.portfolioCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ISIN:</span>
              <span className="font-medium">{holding.isin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Instrument:</span>
              <span className="font-medium">
                {holding.instrumentDescription}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {holding.amount.toLocaleString()} {holding.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Effective Date:</span>
              <span className="font-medium">{holding.effectiveDate}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
