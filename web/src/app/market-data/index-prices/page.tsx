'use client';

/**
 * Index Prices Page (Stories 5.1, 5.4)
 *
 * Epic 5: Market Data Maintenance
 *
 * Features:
 * - Grid display with columns: Index Code, Name, Date, Price, Currency
 * - Search and sort functionality
 * - File upload with validation
 * - Export functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/contexts/ToastContext';
import { getIndexPrices, type IndexPrice } from '@/lib/api/market-data';
import { STATIC_DATA_API_URL } from '@/lib/utils/constants';

const PAGE_SIZE = 50;

export function IndexPricesPage() {
  const { showToast } = useToast();

  // Data state
  const [prices, setPrices] = useState<IndexPrice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and sort state
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // File upload state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    added: number;
    updated: number;
    errors: Array<{ row: number; reason: string }>;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const response = await getIndexPrices(params);
      setPrices(response.data);
      setTotal(response.total);
    } catch {
      setError('Failed to load index prices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortColumn, sortDirection, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle sort click
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      if (
        !validTypes.includes(file.type) &&
        !file.name.endsWith('.xlsx') &&
        !file.name.endsWith('.csv')
      ) {
        setUploadError(
          'Invalid file format. Please upload an XLSX or CSV file.',
        );
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(
        `${STATIC_DATA_API_URL}/v1/index-prices/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            LastChangedUser: 'currentUser',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);

      if (result.errors.length === 0) {
        showToast({
          variant: 'success',
          title: `${result.added} prices added, ${result.updated} updated`,
        });
      }

      // Refresh grid
      fetchData();
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Close upload dialog
  const handleCloseUploadDialog = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    setUploadError(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Index Prices</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Index Prices</h1>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          type="search"
          role="searchbox"
          aria-label="Search"
          placeholder="Search..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-sm"
        />

        <Button onClick={() => setShowUploadDialog(true)}>Upload File</Button>
      </div>

      {/* Loading state */}
      {loading && <div>Loading...</div>}

      {/* Empty state */}
      {!loading && prices.length === 0 && (
        <div className="text-muted-foreground">No index prices found</div>
      )}

      {/* Data table */}
      {!loading && prices.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('indexCode')}
                >
                  Index Code
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('indexName')}
                >
                  Name
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  Date
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Price
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort('currency')}
                >
                  Currency
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((price) => (
                <TableRow key={price.id}>
                  <TableCell>{price.indexCode}</TableCell>
                  <TableCell>{price.indexName}</TableCell>
                  <TableCell>{formatDate(price.date)}</TableCell>
                  <TableCell>{formatPrice(price.price)}</TableCell>
                  <TableCell>{price.currency}</TableCell>
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

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={handleCloseUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Index Prices</DialogTitle>
            <DialogDescription>
              Upload an Excel or CSV file containing index prices.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="file-input">Select File</Label>
              <Input
                id="file-input"
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.csv"
                onChange={handleFileChange}
              />
            </div>

            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                {selectedFile.name}
              </div>
            )}

            {uploadError && (
              <div className="text-sm text-red-500">{uploadError}</div>
            )}

            {uploadResult && (
              <div className="space-y-2">
                <div className="text-sm">
                  {uploadResult.added} prices added, {uploadResult.updated}{' '}
                  updated
                </div>
                {uploadResult.errors.length > 0 && (
                  <div className="text-sm text-red-500 space-y-1">
                    {uploadResult.errors.map((err, idx) => (
                      <div key={idx}>
                        Row {err.row}: {err.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseUploadDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default IndexPricesPage;
