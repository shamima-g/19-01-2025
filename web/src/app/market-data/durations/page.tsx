'use client';

/**
 * Durations Page (Stories 5.7-5.9)
 *
 * Epic 5: Market Data Maintenance
 *
 * Features:
 * - Grid display with columns: ISIN, Name, Duration, YTM, Effective Date
 * - Search by ISIN functionality
 * - Click to view duration details
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/contexts/ToastContext';
import {
  getInstrumentDurations,
  type InstrumentDuration,
} from '@/lib/api/market-data';
import { DurationForm } from '@/components/DurationForm';

const PAGE_SIZE = 50;

export function DurationsPage() {
  const { showToast } = useToast();

  // Data state
  const [durations, setDurations] = useState<InstrumentDuration[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and sort state
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Detail view state
  const [selectedDuration, setSelectedDuration] =
    useState<InstrumentDuration | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 200);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: {
        search?: string;
        sort?: string;
        page?: number;
        pageSize?: number;
      } = {
        page: currentPage,
        pageSize: PAGE_SIZE,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (sortColumn) {
        params.sort = `${sortColumn}:${sortDirection}`;
      }

      const response = await getInstrumentDurations(params);
      setDurations(response.data);
      setTotal(response.total);
    } catch {
      setError('Failed to load durations');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortColumn, sortDirection, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle row click
  const handleRowClick = (duration: InstrumentDuration) => {
    setSelectedDuration(duration);
    setShowDetailDialog(true);
  };

  // Handle sort click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Instrument Durations</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Instrument Durations</h1>

      {/* Search */}
      <div className="flex items-center gap-4">
        <Input
          type="search"
          role="searchbox"
          aria-label="Search by ISIN"
          placeholder="Search by ISIN..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Loading state */}
      {loading && <div>Loading...</div>}

      {/* Empty state */}
      {!loading && durations.length === 0 && (
        <div className="text-muted-foreground">No duration data found</div>
      )}

      {/* Data table */}
      {!loading && durations.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('isin')}
                >
                  ISIN
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('instrumentName')}
                >
                  Name
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('duration')}
                >
                  Duration
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('ytm')}
                >
                  YTM
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('effectiveDate')}
                >
                  Effective Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {durations.map((duration) => (
                <TableRow
                  key={duration.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(duration)}
                >
                  <TableCell>{duration.isin}</TableCell>
                  <TableCell>{duration.instrumentName}</TableCell>
                  <TableCell>{duration.duration.toFixed(2)}</TableCell>
                  <TableCell>{duration.ytm.toFixed(2)}%</TableCell>
                  <TableCell>{formatDate(duration.effectiveDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duration Details</DialogTitle>
            <DialogDescription>
              View and edit duration information
            </DialogDescription>
          </DialogHeader>

          {selectedDuration && (
            <DurationForm
              mode="edit"
              durationId={selectedDuration.id}
              initialData={selectedDuration}
              onSuccess={() => {
                setShowDetailDialog(false);
                fetchData();
                showToast({
                  variant: 'success',
                  title: 'Duration updated successfully',
                });
              }}
              onCancel={() => setShowDetailDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DurationsPage;
