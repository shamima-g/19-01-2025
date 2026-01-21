'use client';

/**
 * Approval Page (Story 7.8)
 *
 * Level 1 Approval page that checks data confirmation status
 * and disables approval buttons when data is incomplete.
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDataConfirmationStatus } from '@/lib/api/data-confirmation';
import type { DataConfirmationStatus } from '@/types/data-confirmation';

export default function ApprovalPage() {
  const [status, setStatus] = useState<DataConfirmationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const data = await getDataConfirmationStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load confirmation status:', err);
      setError('Failed to load status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();

    // Poll for status changes
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  const isApprovalEnabled = status?.readyForApproval === true;
  const tooltipText = !isApprovalEnabled
    ? getDisabledTooltip(status)
    : undefined;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Level 1 Approval</h1>

      <Card>
        <CardHeader>
          <CardTitle>Approve Report Batch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div role="status" className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">
                Checking data confirmation status...
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

          {!loading && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Data Confirmation Status:
                </p>
                {status?.readyForApproval ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <span role="img" aria-label="check">
                      ✓
                    </span>
                    <span>All checks passed - Ready for approval</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <span role="img" aria-label="error">
                      ✕
                    </span>
                    <span>Issues found - Review required</span>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="relative group">
                  <Button
                    disabled={!isApprovalEnabled}
                    className="min-w-32"
                    aria-describedby={
                      !isApprovalEnabled ? 'approval-tooltip' : undefined
                    }
                  >
                    Approve
                  </Button>
                  {!isApprovalEnabled && tooltipText && (
                    <div
                      id="approval-tooltip"
                      role="tooltip"
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                    >
                      {tooltipText}
                    </div>
                  )}
                </div>

                <Button variant="outline" className="min-w-32">
                  Reject
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getDisabledTooltip(status: DataConfirmationStatus | null): string {
  if (!status) {
    return 'Complete data confirmation first';
  }

  const issues: string[] = [];

  if (status.summary) {
    if (status.summary.filesMissing > 0) {
      issues.push(`${status.summary.filesMissing} files missing`);
    }
    if (status.summary.incompleteInstruments > 0) {
      issues.push(
        `${status.summary.incompleteInstruments} instruments incomplete`,
      );
    }
    if (status.summary.otherIssues > 0) {
      issues.push(`${status.summary.otherIssues} other issues`);
    }
  }

  if (issues.length > 0) {
    return issues.join(', ');
  }

  return 'Complete data confirmation first';
}

// Named export for testing
export { ApprovalPage };
