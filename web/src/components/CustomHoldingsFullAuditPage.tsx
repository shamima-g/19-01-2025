'use client';

/**
 * Custom Holdings Full Audit Page Component (Story 6.6)
 *
 * Displays full audit trail for all custom holdings:
 * - Filter by portfolio and date range
 * - Date, User, Action, Portfolio, ISIN, Changes columns
 * - Pagination support
 * - Loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getFullAuditTrail, getPortfolios } from '@/lib/api/custom-holdings';
import type {
  FullAuditRecord,
  Portfolio,
  AuditListParams,
} from '@/types/custom-holding';

const PAGE_SIZE = 10;

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
function formatChanges(changes: FullAuditRecord['changes']): string {
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

export function CustomHoldingsFullAuditPage() {
  const [auditRecords, setAuditRecords] = useState<FullAuditRecord[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter state
  const [portfolioFilter, setPortfolioFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

  const loadAuditRecords = useCallback(
    async (params: AuditListParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getFullAuditTrail({
          ...params,
          page: params.page ?? currentPage,
          pageSize: PAGE_SIZE,
        });
        // Ensure audit records is always an array
        setAuditRecords(Array.isArray(response?.data) ? response.data : []);
        setTotalRecords(response?.total ?? 0);
      } catch (err) {
        console.error('Failed to load audit records:', err);
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
          setError('Failed to load audit records');
        }
      } finally {
        setLoading(false);
      }
    },
    [currentPage],
  );

  // Load portfolios for filter dropdown
  useEffect(() => {
    async function loadPortfolios() {
      try {
        const data = await getPortfolios();
        // Ensure portfolios is always an array
        setPortfolios(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load portfolios:', err);
        setPortfolios([]);
      }
    }
    loadPortfolios();
  }, []);

  // Load audit records on mount and when page changes
  useEffect(() => {
    loadAuditRecords({
      portfolio: portfolioFilter || undefined,
      startDate: fromDate || undefined,
      endDate: toDate || undefined,
      page: currentPage,
    });
  }, [currentPage, loadAuditRecords, portfolioFilter, fromDate, toDate]);

  const handleApplyFilter = () => {
    setCurrentPage(1);
    loadAuditRecords({
      portfolio: portfolioFilter || undefined,
      startDate: fromDate || undefined,
      endDate: toDate || undefined,
      page: 1,
    });
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setPortfolioFilter(value);
    setCurrentPage(1);
    loadAuditRecords({
      portfolio: value || undefined,
      startDate: fromDate || undefined,
      endDate: toDate || undefined,
      page: 1,
    });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Holdings Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Portfolio Filter */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="portfolioFilter">Filter by Portfolio</Label>
            <select
              id="portfolioFilter"
              aria-label="Filter by Portfolio"
              value={portfolioFilter}
              onChange={handlePortfolioChange}
              className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Portfolios</option>
              {portfolios.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filters */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="fromDate">From Date</Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-40"
              aria-label="From Date"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="toDate">To Date</Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-40"
              aria-label="To Date"
            />
          </div>

          {/* Apply Filter Button */}
          <div className="flex items-end">
            <Button onClick={handleApplyFilter}>Apply Filter</Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div role="status" className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Loading audit records...
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
            <p className="text-muted-foreground">No audit records found</p>
          </div>
        )}

        {/* Audit Table */}
        {!loading && !error && auditRecords.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>ISIN</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.timestamp)}</TableCell>
                    <TableCell>{record.user}</TableCell>
                    <TableCell>{record.action}</TableCell>
                    <TableCell>{record.portfolioCode}</TableCell>
                    <TableCell>{record.holdingId}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {formatChanges(record.changes)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
