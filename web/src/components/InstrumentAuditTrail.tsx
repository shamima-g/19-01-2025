'use client';

/**
 * Instrument Audit Trail Component
 *
 * Epic 4: Instrument Static Data Management
 * Story: 4.5 (View Audit Trail)
 *
 * Features:
 * - Displays chronological list of all changes to an instrument
 * - Shows Date, User, Field Changed, Old Value, New Value
 * - Export to Excel functionality
 * - Pagination for large audit trails
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { STATIC_DATA_API_URL } from '@/lib/utils/constants';
import type { InstrumentAuditRecord } from '@/lib/api/instruments';

interface InstrumentAuditTrailProps {
  instrumentId: string;
}

const PAGE_SIZE = 50;

export function InstrumentAuditTrail({
  instrumentId,
}: InstrumentAuditTrailProps) {
  const [auditRecords, setAuditRecords] = useState<InstrumentAuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchAuditTrail = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${STATIC_DATA_API_URL}/v1/instruments/${instrumentId}/audit-trail?page=${currentPage}&limit=${PAGE_SIZE}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setAuditRecords(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      setError('Failed to load audit trail. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [instrumentId, currentPage]);

  useEffect(() => {
    fetchAuditTrail();
  }, [fetchAuditTrail]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const response = await fetch(
        `${STATIC_DATA_API_URL}/v1/instruments/${instrumentId}/audit-trail/export`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_trail_${instrumentId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export audit trail');
    } finally {
      setExporting(false);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (loading) {
    return <div>Loading audit trail...</div>;
  }

  if (auditRecords.length === 0) {
    return <div>No changes recorded</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Audit Trail</h2>
        <Button onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Field Changed</TableHead>
            <TableHead>Old Value</TableHead>
            <TableHead>New Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditRecords.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{formatDate(record.date)}</TableCell>
              <TableCell>{record.user}</TableCell>
              <TableCell>{record.fieldChanged}</TableCell>
              <TableCell>{record.oldValue}</TableCell>
              <TableCell>{record.newValue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Next"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default InstrumentAuditTrail;
