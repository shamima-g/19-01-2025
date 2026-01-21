'use client';

/**
 * Custom Holdings Grid Component (Story 6.1, 6.7)
 *
 * Displays custom holdings in a searchable, filterable grid with:
 * - Columns: Portfolio, ISIN, Description, Amount, Currency, Effective Date
 * - Search by portfolio/ISIN
 * - Portfolio filter dropdown with localStorage persistence
 * - Click row to see details
 * - Pagination
 * - Loading and error states
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getCustomHoldings, getPortfolios } from '@/lib/api/custom-holdings';
import type {
  CustomHolding,
  Portfolio,
  CustomHoldingListParams,
} from '@/types/custom-holding';
import { formatAmount, formatDate } from '@/types/custom-holding';

const PAGE_SIZE = 10;
const STORAGE_KEY = 'customHoldings.portfolioFilter';

export function CustomHoldingsGrid() {
  // State
  const [holdings, setHoldings] = useState<CustomHolding[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHolding, setSelectedHolding] = useState<CustomHolding | null>(
    null,
  );

  // Load portfolio filter from localStorage on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem(STORAGE_KEY);
    if (savedFilter) {
      setSelectedPortfolio(savedFilter);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch portfolios for dropdown
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const data = await getPortfolios();
        setPortfolios(Array.isArray(data) ? data : []);
        setPortfolioError(null);
      } catch (err) {
        setPortfolioError('Failed to load portfolios');
        console.error('Error fetching portfolios:', err);
      }
    };

    fetchPortfolios();
  }, []);

  // Fetch holdings
  const fetchHoldings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: CustomHoldingListParams = {
        page: currentPage,
        pageSize: PAGE_SIZE,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (selectedPortfolio) {
        params.portfolio = selectedPortfolio;
      }

      const response = await getCustomHoldings(params);
      setHoldings(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      // Handle both Error and APIError objects
      const apiError = err as { message?: string; details?: string[] };
      const message =
        apiError.details?.[0] ||
        apiError.message ||
        'Failed to load custom holdings';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedPortfolio]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  // Handle portfolio filter change
  const handlePortfolioChange = (value: string) => {
    setSelectedPortfolio(value);
    setCurrentPage(1);

    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Determine empty state message
  const emptyMessage = useMemo(() => {
    const holdingsLength = holdings?.length ?? 0;
    if (selectedPortfolio && holdingsLength === 0 && !loading) {
      return 'No holdings found for this portfolio';
    }
    return 'No custom holdings found';
  }, [selectedPortfolio, holdings, loading]);

  // Loading state
  const holdingsLength = holdings?.length ?? 0;
  if (loading && holdingsLength === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div
          role="status"
          aria-label="Loading"
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        />
        <p className="mt-4 text-gray-600">Loading holdings...</p>
      </div>
    );
  }

  // Error state
  if (error && holdingsLength === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div role="alert" className="text-red-600">
          {error}
        </div>
        <Button onClick={fetchHoldings} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portfolio error */}
      {portfolioError && (
        <div className="text-red-600 text-sm">{portfolioError}</div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            role="searchbox"
            aria-label="Search by portfolio"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by portfolio or ISIN..."
            className="pl-10"
          />
        </div>

        {/* Portfolio Filter */}
        <div className="min-w-[200px]">
          <select
            value={selectedPortfolio}
            onChange={(e) => handlePortfolioChange(e.target.value)}
            aria-label="Filter by portfolio"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All Portfolios</option>
            {(portfolios || []).map((portfolio) => (
              <option key={portfolio.code} value={portfolio.code}>
                {portfolio.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty state */}
      {holdingsLength === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      )}

      {/* Grid */}
      {holdings.length > 0 && (
        <>
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Portfolio</TableHead>
                  <TableHead>ISIN</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Effective Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(holdings || []).map((holding) => (
                  <TableRow
                    key={holding.id}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedHolding(holding)}
                  >
                    <TableCell>{holding.portfolioCode}</TableCell>
                    <TableCell>{holding.isin}</TableCell>
                    <TableCell>{holding.instrumentDescription}</TableCell>
                    <TableCell className="text-right">
                      {formatAmount(holding.amount)}
                    </TableCell>
                    <TableCell>{holding.currency}</TableCell>
                    <TableCell>{formatDate(holding.effectiveDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!hasPreviousPage}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!hasNextPage}
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading indicator for subsequent loads */}
      {loading && holdings.length > 0 && (
        <div className="flex justify-center py-4">
          <div
            role="status"
            aria-label="Loading more"
            className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"
          />
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedHolding}
        onOpenChange={(open) => !open && setSelectedHolding(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Holding Details</DialogTitle>
          </DialogHeader>

          {selectedHolding && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Portfolio</p>
                  <p className="font-medium">
                    {selectedHolding.portfolioCode} -{' '}
                    {selectedHolding.portfolioName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ISIN</p>
                  <p className="font-medium">{selectedHolding.isin}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="font-medium">
                    {selectedHolding.instrumentDescription}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">
                    {formatAmount(selectedHolding.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Currency</p>
                  <p className="font-medium">{selectedHolding.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Effective Date</p>
                  <p className="font-medium">
                    {formatDate(selectedHolding.effectiveDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
