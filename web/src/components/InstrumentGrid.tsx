'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getInstruments, exportInstruments } from '@/lib/api/instruments';
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
import { Badge } from '@/components/ui/badge';
import { ColumnVisibilityDialog } from './ColumnVisibilityDialog';
import type {
  Instrument,
  ColumnVisibility,
  InstrumentListParams,
} from '@/types/instrument';
import {
  DEFAULT_COLUMN_VISIBILITY,
  COLUMN_PREFERENCES_KEY,
  INSTRUMENT_COLUMNS,
} from '@/types/instrument';
import { ArrowUpDown, Download, Columns, Search } from 'lucide-react';

interface InstrumentGridProps {
  onSelectInstrument?: (instrument: Instrument) => void;
}

interface SortConfig {
  key: string;
  order: 'asc' | 'desc';
}

export function InstrumentGrid({ onSelectInstrument }: InstrumentGridProps) {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
    () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(COLUMN_PREFERENCES_KEY);
        if (saved) {
          try {
            return JSON.parse(saved) as ColumnVisibility;
          } catch {
            return DEFAULT_COLUMN_VISIBILITY;
          }
        }
      }
      return DEFAULT_COLUMN_VISIBILITY;
    },
  );

  const pageSize = 50;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch instruments
  const fetchInstruments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: InstrumentListParams = {
        page,
        pageSize,
        search: debouncedSearch || undefined,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.order,
      };

      const result = await getInstruments(params);
      setInstruments(result.instruments);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore ?? false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load instruments. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortConfig]);

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  // Save column preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        COLUMN_PREFERENCES_KEY,
        JSON.stringify(columnVisibility),
      );
    }
  }, [columnVisibility]);

  // Handle sort
  const handleSort = useCallback((columnKey: string) => {
    setSortConfig((prev) => {
      if (prev?.key === columnKey) {
        return { key: columnKey, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { key: columnKey, order: 'asc' };
    });
    setPage(1);
  }, []);

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportInstruments({
        search: debouncedSearch || undefined,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.order,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instruments-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to export instruments.',
      );
    } finally {
      setExporting(false);
    }
  };

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const bottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 100;

      if (bottom && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    },
    [hasMore, loading],
  );

  // Filter visible columns
  const visibleColumns = useMemo(
    () =>
      INSTRUMENT_COLUMNS.filter(
        (col) => columnVisibility[col.key as keyof ColumnVisibility],
      ),
    [columnVisibility],
  );

  // Client-side filtering for search (in addition to server-side)
  const filteredInstruments = useMemo(() => {
    if (!debouncedSearch) return instruments;

    const searchLower = debouncedSearch.toLowerCase();
    return instruments.filter(
      (inst) =>
        inst.isin.toLowerCase().includes(searchLower) ||
        inst.name.toLowerCase().includes(searchLower) ||
        inst.assetClass.toLowerCase().includes(searchLower) ||
        inst.currency.toLowerCase().includes(searchLower) ||
        (inst.issuer && inst.issuer.toLowerCase().includes(searchLower)),
    );
  }, [instruments, debouncedSearch]);

  // Client-side sorting
  const sortedInstruments = useMemo(() => {
    if (!sortConfig) return filteredInstruments;

    return [...filteredInstruments].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Instrument];
      const bValue = b[sortConfig.key as keyof Instrument];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });
  }, [filteredInstruments, sortConfig]);

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Render cell value
  const renderCellValue = (
    instrument: Instrument,
    columnKey: string,
  ): React.ReactNode => {
    switch (columnKey) {
      case 'status':
        return (
          <Badge
            variant={
              instrument.status === 'Complete' ? 'default' : 'destructive'
            }
          >
            {instrument.status}
          </Badge>
        );
      case 'maturityDate':
        return formatDate(instrument.maturityDate);
      case 'issuer':
        return instrument.issuer || '-';
      default:
        return instrument[columnKey as keyof Instrument] as string;
    }
  };

  // Loading state
  if (loading && instruments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div
          role="progressbar"
          aria-label="Loading"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        />
        <p className="mt-4 text-gray-600">Loading instruments...</p>
      </div>
    );
  }

  // Error state
  if (error && instruments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div role="alert" className="text-red-600">
          Failed to load instruments. Please try again.
        </div>
        <Button onClick={fetchInstruments} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (totalCount === 0 && !debouncedSearch && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600">No instruments found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            role="searchbox"
            aria-label="Search instruments"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ISIN, name, or issuer..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setColumnDialogOpen(true)}
            aria-label="Columns"
          >
            <Columns className="h-4 w-4 mr-2" />
            Columns
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            aria-label="Export to Excel"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </Button>
        </div>
      </div>

      {/* Empty search results */}
      {sortedInstruments.length === 0 && debouncedSearch && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-600">No instruments found</p>
        </div>
      )}

      {/* Grid */}
      {sortedInstruments.length > 0 && (
        <div
          role="grid"
          className="border rounded-lg overflow-auto max-h-[600px]"
          onScroll={handleScroll}
        >
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 z-10">
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead
                    key={column.key}
                    role="columnheader"
                    className={
                      column.sortable ? 'cursor-pointer select-none' : ''
                    }
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && (
                        <ArrowUpDown
                          className={`h-4 w-4 ${
                            sortConfig?.key === column.key
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInstruments.map((instrument) => (
                <TableRow
                  key={instrument.id}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => onSelectInstrument?.(instrument)}
                >
                  {visibleColumns.map((column) => (
                    <TableCell key={`${instrument.id}-${column.key}`}>
                      {renderCellValue(instrument, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && instruments.length > 0 && (
        <div className="flex justify-center py-4">
          <div
            role="progressbar"
            aria-label="Loading more"
            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
          />
        </div>
      )}

      {/* Column visibility dialog */}
      <ColumnVisibilityDialog
        open={columnDialogOpen}
        onOpenChange={setColumnDialogOpen}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
      />
    </div>
  );
}
