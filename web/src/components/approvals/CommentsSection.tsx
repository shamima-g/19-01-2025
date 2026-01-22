'use client';

/**
 * Comments Section (Story 8.11)
 *
 * Displays a list of comments for a batch.
 */

import { useState, useEffect, useCallback } from 'react';
import { get } from '@/lib/api/client';
import type { Comment, CommentsData } from '@/types/approval';

interface CommentsSectionProps {
  batchId: string;
  onAddComment?: () => void;
}

export function CommentsSection({
  batchId,
  onAddComment,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await get<CommentsData>(
        `/v1/report-comments?batchId=${batchId}`,
      );
      setComments(data.comments);
    } catch (err) {
      console.error('Failed to load comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    if (batchId) {
      loadComments();
    }
  }, [batchId, loadComments]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toISOString().split('T')[0]} ${date.toLocaleTimeString()}`;
  };

  if (loading) {
    return (
      <div role="status" className="flex items-center gap-2 py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">
          Loading comments...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="p-4 text-sm text-red-700 bg-red-100 rounded-md"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Comments</h3>
        {onAddComment && (
          <button
            onClick={onAddComment}
            className="text-sm text-primary hover:underline"
          >
            Add Comment
          </button>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="py-4 text-center text-muted-foreground">
          No comments added
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(comment.timestamp)}
                </span>
              </div>
              <p className="text-sm">{comment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
