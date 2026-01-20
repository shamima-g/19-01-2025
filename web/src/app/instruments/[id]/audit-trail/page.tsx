'use client';

/**
 * Instrument Audit Trail
 * Epic 4, Story 4.5
 *
 * Displays read-only audit trail of all changes to an instrument.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getInstrumentAuditTrail,
  exportInstruments,
} from '@/lib/api/instruments';
import type { InstrumentAuditEntry } from '@/types/instrument';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

function getChangedFields(
  entry: InstrumentAuditEntry,
): { field: string; oldValue: string | null; newValue: string | null }[] {
  const changes: {
    field: string;
    oldValue: string | null;
    newValue: string | null;
  }[] = [];

  if (entry.action === 'Created' && entry.newValues) {
    Object.entries(entry.newValues).forEach(([field, value]) => {
      if (field !== 'id' && field !== 'createdAt' && field !== 'updatedAt') {
        changes.push({ field, oldValue: null, newValue: String(value ?? '') });
      }
    });
  } else if (entry.action === 'Updated') {
    const prev = entry.previousValues || {};
    const next = entry.newValues || {};
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);

    allKeys.forEach((field) => {
      if (field !== 'id' && field !== 'createdAt' && field !== 'updatedAt') {
        const oldVal = prev[field as keyof typeof prev];
        const newVal = next[field as keyof typeof next];
        if (oldVal !== newVal) {
          changes.push({
            field,
            oldValue: oldVal != null ? String(oldVal) : null,
            newValue: newVal != null ? String(newVal) : null,
          });
        }
      }
    });
  }

  return changes;
}

export default function InstrumentAuditTrailPage() {
  const params = useParams();
  const instrumentId = params.id as string;

  const [entries, setEntries] = useState<InstrumentAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([]);

  const fetchAuditTrail = useCallback(
    async (pageNum: number, append = false) => {
      try {
        setLoading(true);
        const response = await getInstrumentAuditTrail(instrumentId, {
          page: pageNum,
          pageSize: 50,
        });

        const newEntries = response.entries.sort(
          (a, b) =>
            new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
        );

        if (append) {
          setEntries((prev) => [...prev, ...newEntries]);
        } else {
          setEntries(newEntries);
          // Extract unique users
          const users = [...new Set(newEntries.map((e) => e.changedBy))];
          setUniqueUsers(users);
        }

        setHasMore(response.hasMore || false);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load audit trail. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    },
    [instrumentId],
  );

  useEffect(() => {
    fetchAuditTrail(1);
  }, [fetchAuditTrail]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAuditTrail(nextPage, true);
  };

  const handleExport = async () => {
    try {
      const blob = await exportInstruments();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-trail-${instrumentId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // Filter entries based on date range and user
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.changedAt);

    if (startDate) {
      const start = new Date(startDate);
      if (entryDate < start) return false;
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (entryDate > end) return false;
    }

    if (userFilter && entry.changedBy !== userFilter) {
      return false;
    }

    return true;
  });

  if (loading && entries.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Loading audit trail...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="mt-1 text-sm text-gray-500">
            All changes to instrument {instrumentId}
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" aria-label="Export">
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="space-y-1">
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            aria-label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            aria-label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="user-filter">Filter by User</Label>
          <Select
            value={userFilter || '__all__'}
            onValueChange={(val) => setUserFilter(val === '__all__' ? '' : val)}
          >
            <SelectTrigger
              id="user-filter"
              aria-label="Filter by User"
              className="w-40"
            >
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All users</SelectItem>
              {uniqueUsers.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No changes recorded
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Field Changed</TableHead>
                <TableHead>Old Value</TableHead>
                <TableHead>New Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const changes = getChangedFields(entry);

                if (changes.length === 0) {
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.changedAt)}</TableCell>
                      <TableCell>{entry.changedBy}</TableCell>
                      <TableCell>{entry.action}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  );
                }

                return changes.map((change, idx) => (
                  <TableRow key={`${entry.id}-${idx}`}>
                    {idx === 0 && (
                      <>
                        <TableCell rowSpan={changes.length}>
                          {formatDate(entry.changedAt)}
                        </TableCell>
                        <TableCell rowSpan={changes.length}>
                          {entry.changedBy}
                        </TableCell>
                        <TableCell rowSpan={changes.length}>
                          {entry.action}
                        </TableCell>
                      </>
                    )}
                    <TableCell>{change.field}</TableCell>
                    <TableCell>{change.oldValue || '-'}</TableCell>
                    <TableCell>{change.newValue || '-'}</TableCell>
                  </TableRow>
                ));
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {hasMore && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
