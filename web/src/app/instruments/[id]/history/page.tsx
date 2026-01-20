'use client';

/**
 * Instrument History
 * Epic 4, Story 4.6
 *
 * Displays historical snapshots and allows comparison between versions.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getInstrumentHistory } from '@/lib/api/instruments';
import type { InstrumentHistoryEntry } from '@/types/instrument';

interface Snapshot {
  id: string;
  date: string;
  name: string;
  assetClass: string;
  currency: string;
  status: string;
  issuer?: string;
  maturityDate?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });
}

// Convert history entries to point-in-time snapshots
function buildSnapshots(history: InstrumentHistoryEntry[]): Snapshot[] {
  // Group by date to create snapshots
  const dateGroups = new Map<string, InstrumentHistoryEntry[]>();

  history.forEach((entry) => {
    const dateKey = entry.changedAt.split('T')[0];
    if (!dateGroups.has(dateKey)) {
      dateGroups.set(dateKey, []);
    }
    dateGroups.get(dateKey)!.push(entry);
  });

  // Build cumulative snapshots
  const snapshots: Snapshot[] = [];
  const currentState: Partial<Snapshot> = {};

  // Sort dates ascending to build state progressively
  const sortedDates = Array.from(dateGroups.keys()).sort();

  sortedDates.forEach((dateKey, index) => {
    const entries = dateGroups.get(dateKey)!;

    // Apply all changes for this date
    entries.forEach((entry) => {
      currentState[entry.field as keyof Snapshot] = entry.newValue || '';
    });

    snapshots.push({
      id: `snap-${index}`,
      date: entries[0].changedAt,
      name: String(currentState.name || ''),
      assetClass: String(currentState.assetClass || ''),
      currency: String(currentState.currency || ''),
      status: String(currentState.status || ''),
      issuer: currentState.issuer ? String(currentState.issuer) : undefined,
      maturityDate: currentState.maturityDate
        ? String(currentState.maturityDate)
        : undefined,
    });
  });

  // Return in descending order (newest first)
  return snapshots.reverse();
}

export default function InstrumentHistoryPage() {
  const params = useParams();
  const instrumentId = params.id as string;

  const [, setHistory] = useState<InstrumentHistoryEntry[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comparison state
  const [selectedSnapshots, setSelectedSnapshots] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [maxSelectionMessage, setMaxSelectionMessage] = useState<string | null>(
    null,
  );

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getInstrumentHistory(instrumentId, {
        pageSize: 100,
      });

      // Sort by date descending
      const sortedHistory = response.history.sort(
        (a, b) =>
          new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
      );

      setHistory(sortedHistory);
      setSnapshots(buildSnapshots(sortedHistory));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load history. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [instrumentId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSnapshotSelect = (snapshotId: string) => {
    setMaxSelectionMessage(null);

    if (selectedSnapshots.includes(snapshotId)) {
      // Deselect
      setSelectedSnapshots((prev) => prev.filter((id) => id !== snapshotId));
    } else if (selectedSnapshots.length < 2) {
      // Select (max 2)
      setSelectedSnapshots((prev) => [...prev, snapshotId]);
    } else {
      // Already 2 selected
      setMaxSelectionMessage('You can only compare 2 snapshots at a time');
    }
  };

  const handleCompare = () => {
    if (selectedSnapshots.length === 2) {
      setShowComparison(true);
    }
  };

  const getComparisonData = () => {
    if (selectedSnapshots.length !== 2) return null;

    const snap1 = snapshots.find((s) => s.id === selectedSnapshots[0]);
    const snap2 = snapshots.find((s) => s.id === selectedSnapshots[1]);

    if (!snap1 || !snap2) return null;

    // Order by date (older first, newer second)
    const [older, newer] =
      new Date(snap1.date) < new Date(snap2.date)
        ? [snap1, snap2]
        : [snap2, snap1];

    const fields = [
      'name',
      'assetClass',
      'currency',
      'status',
      'issuer',
      'maturityDate',
    ] as const;

    return fields.map((field) => ({
      field:
        field.charAt(0).toUpperCase() +
        field.slice(1).replace(/([A-Z])/g, ' $1'),
      oldValue: older[field] || '-',
      newValue: newer[field] || '-',
      changed: older[field] !== newer[field],
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Loading history...</span>
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

  if (snapshots.length === 0) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Instrument History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Historical versions of instrument {instrumentId}
          </p>
        </div>
        <div className="text-center py-12 text-gray-500">
          No historical data available
        </div>
      </div>
    );
  }

  const comparisonData = getComparisonData();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Instrument History
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Select two snapshots to compare versions
          </p>
        </div>
        <Button
          onClick={handleCompare}
          disabled={selectedSnapshots.length !== 2}
          aria-label="Compare"
        >
          Compare
        </Button>
      </div>

      {maxSelectionMessage && (
        <div className="mb-4 text-sm text-amber-600">{maxSelectionMessage}</div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Asset Class</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshots.map((snapshot) => (
              <TableRow key={snapshot.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    role="checkbox"
                    checked={selectedSnapshots.includes(snapshot.id)}
                    onChange={() => handleSnapshotSelect(snapshot.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableCell>
                <TableCell>{formatDate(snapshot.date)}</TableCell>
                <TableCell>{snapshot.name}</TableCell>
                <TableCell>{snapshot.assetClass}</TableCell>
                <TableCell>{snapshot.currency}</TableCell>
                <TableCell>{snapshot.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version Comparison</DialogTitle>
            <DialogDescription>
              Comparing two historical snapshots. Changed fields are
              highlighted.
            </DialogDescription>
          </DialogHeader>

          {comparisonData && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Older Version</TableHead>
                  <TableHead>Newer Version</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonData.map((row) => (
                  <TableRow
                    key={row.field}
                    className={
                      row.changed ? 'bg-yellow-50 highlight changed' : ''
                    }
                  >
                    <TableCell className="font-medium">{row.field}</TableCell>
                    <TableCell>{row.oldValue}</TableCell>
                    <TableCell>{row.newValue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowComparison(false)}
              aria-label="Close"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
