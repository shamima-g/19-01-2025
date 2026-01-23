'use client';

/**
 * Betas Page (Stories 5.10-5.12)
 *
 * Epic 5: Market Data Maintenance
 *
 * Features:
 * - Grid display with columns: ISIN, Name, Beta, Benchmark, Effective Date
 * - Search by ISIN functionality
 * - Click to view beta details
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
import { getInstrumentBetas, type InstrumentBeta } from '@/lib/api/market-data';
import { BetaForm } from '@/components/BetaForm';

const PAGE_SIZE = 50;

export function BetasPage() {
  const { showToast } = useToast();

  // Data state
  const [betas, setBetas] = useState<InstrumentBeta[]>([]);
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
  const [selectedBeta, setSelectedBeta] = useState<InstrumentBeta | null>(null);
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

      const response = await getInstrumentBetas(params);
      setBetas(response.data);
      setTotal(response.total);
    } catch {
      setError('Failed to load betas');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortColumn, sortDirection, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle row click
  const handleRowClick = (beta: InstrumentBeta) => {
    setSelectedBeta(beta);
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
        <h1 className="text-2xl font-bold mb-4">Instrument Betas</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Instrument Betas</h1>

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
      {!loading && betas.length === 0 && (
        <div className="text-muted-foreground">No beta data found</div>
      )}

      {/* Data table */}
      {!loading && betas.length > 0 && (
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
                  onClick={() => handleSort('beta')}
                >
                  Beta
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('benchmark')}
                >
                  Benchmark
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
              {betas.map((beta) => (
                <TableRow
                  key={beta.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(beta)}
                >
                  <TableCell>{beta.isin}</TableCell>
                  <TableCell>{beta.instrumentName}</TableCell>
                  <TableCell>{beta.beta.toFixed(2)}</TableCell>
                  <TableCell>{beta.benchmark}</TableCell>
                  <TableCell>{formatDate(beta.effectiveDate)}</TableCell>
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
            <DialogTitle>Beta Details</DialogTitle>
            <DialogDescription>
              View and edit beta information
            </DialogDescription>
          </DialogHeader>

          {selectedBeta && (
            <BetaForm
              mode="edit"
              betaId={selectedBeta.id}
              initialData={selectedBeta}
              onSuccess={() => {
                setShowDetailDialog(false);
                fetchData();
                showToast({
                  variant: 'success',
                  title: 'Beta updated successfully',
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

export default BetasPage;
