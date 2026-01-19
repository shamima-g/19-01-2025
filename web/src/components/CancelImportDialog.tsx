'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/contexts/ToastContext';
import { cancelFileImport } from '@/lib/api/portfolio-files';
import type { PortfolioFileType } from '@/types/portfolio-file';

interface CancelImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCanceled: () => void;
  batchId: string;
  portfolioId: string;
  portfolioName: string;
  fileType: PortfolioFileType;
  fileName: string;
}

export function CancelImportDialog({
  isOpen,
  onClose,
  onCanceled,
  batchId,
  portfolioId,
  portfolioName,
  fileType,
  fileName,
}: CancelImportDialogProps) {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      const response = await cancelFileImport(batchId, portfolioId, fileType);
      if (response.success) {
        showToast({
          title: 'Import Canceled',
          message: 'Import canceled successfully',
          variant: 'success',
        });
        onCanceled();
        onClose();
      } else {
        showToast({
          title: 'Error',
          message: response.message || 'Failed to cancel import',
          variant: 'error',
        });
      }
    } catch (error) {
      showToast({
        title: 'Error',
        message:
          error instanceof Error ? error.message : 'Failed to cancel import',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-label="Cancel file import">
        <DialogHeader>
          <DialogTitle>Cancel File Import?</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel the import of {fileName} for{' '}
            {portfolioName}?
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertDescription>
            Processing will stop and data will not be saved. You will need to
            re-upload the file to import it again.
          </AlertDescription>
        </Alert>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            No, continue processing
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Canceling...' : 'Yes, cancel import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
