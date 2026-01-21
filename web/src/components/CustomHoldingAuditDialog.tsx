'use client';

/**
 * Custom Holding Audit Dialog Component (Story 6.5)
 *
 * Displays audit trail for a single holding:
 * - Chronological list of changes
 * - Date, User, Action, Changes columns
 * - Export to Excel functionality
 * - Loading and error states
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getHoldingAuditTrail,
  exportAuditTrail,
} from '@/lib/api/custom-holdings';
import type { AuditRecord } from '@/types/custom-holding';

interface CustomHoldingAuditDialogProps {
  isOpen: boolean;
  holdingId: string;
  holding: {
    id: string;
    portfolioCode: string;
    isin: string;
  } | null;
  onClose: () => void;
}

// Format date to display format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day}/${year} ${hours}:${minutes}`;
}

// Format changes for display
function formatChanges(changes: AuditRecord['changes']): string {
  if (!changes || changes.length === 0) {
    return '-';
  }

  return changes
    .map((change) => {
      const from = change.oldValue ?? 'null';
      const to = change.newValue ?? 'null';
      return `${change.field}: ${from} → ${to}`;
    })
    .join(', ');
}

export function CustomHoldingAuditDialog({
  isOpen,
  holdingId,
  holding,
  onClose,
}: CustomHoldingAuditDialogProps) {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isOpen && holdingId) {
      loadAuditTrail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, holdingId]);

  const loadAuditTrail = async () => {
    setLoading(true);
    setError(null);

    try {
      const records = await getHoldingAuditTrail(holdingId);
      setAuditRecords(records);
    } catch (err) {
      console.error('Failed to load audit trail:', err);
      // Check both message and details for specific error messages
      const errorMessage = err instanceof Error ? err.message : '';
      const errorDetails =
        err && typeof err === 'object' && 'details' in err
          ? (err as { details: string[] }).details
          : [];
      const hasDbError =
        errorMessage.includes('Database connection failed') ||
        errorDetails.some((d) => d.includes('Database connection failed'));

      if (hasDbError) {
        setError('Database connection failed');
      } else {
        setError('Failed to load audit trail');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportAuditTrail(holdingId);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-trail-${holdingId}.xlsx`;
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export audit trail:', err);
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Audit Trail</DialogTitle>
          {holding && (
            <p className="text-sm text-muted-foreground">
              Portfolio: {holding.portfolioCode} | ISIN: {holding.isin}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Loading State */}
          {loading && (
            <div
              role="status"
              className="flex items-center justify-center py-8"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  Loading audit trail...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div
              role="alert"
              className="p-4 text-sm text-red-700 bg-red-100 rounded-md"
            >
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && auditRecords.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No changes recorded</p>
            </div>
          )}

          {/* Audit Table */}
          {!loading && !error && auditRecords.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.timestamp)}</TableCell>
                    <TableCell>{record.user}</TableCell>
                    <TableCell>{record.action}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {formatChanges(record.changes)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer with Export Button */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={loading || exporting || auditRecords.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
