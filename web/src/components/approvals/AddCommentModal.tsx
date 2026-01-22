'use client';

/**
 * Add Comment Modal (Story 8.12)
 *
 * Allows users to add comments to a batch.
 */

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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { addComment } from '@/lib/api/approvals';
import { useToast } from '@/contexts/ToastContext';

interface AddCommentModalProps {
  batchId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCommentModal({
  batchId,
  isOpen,
  onClose,
  onSuccess,
}: AddCommentModalProps) {
  const { showToast } = useToast();
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate comment
    if (!comment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await addComment(batchId, { text: comment.trim() });
      setSuccessMessage('Comment added successfully');
      showToast({ variant: 'success', title: 'Comment added successfully' });
      setComment('');
      // Don't close immediately - show success message first
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1000);
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setComment('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Add a note to this report batch.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="add-comment-text">Comment</Label>
          <Textarea
            id="add-comment-text"
            name="comment"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError(null);
              setSuccessMessage(null);
            }}
            placeholder="Enter your comment..."
            className="mt-2"
            rows={4}
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          {successMessage && (
            <p className="text-sm text-green-600 mt-2">{successMessage}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddCommentModal;
