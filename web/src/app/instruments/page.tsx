'use client';

/**
 * Instruments Static Data Management Page
 *
 * Epic 4: Instrument Static Data Management
 * Stories: 4.1, 4.4, 4.7, 4.9
 *
 * Features:
 * - Grid display with all columns (ISIN, Name, Asset Class, Currency, Status)
 * - Search and sort functionality
 * - Pagination
 * - File upload
 * - Export incomplete ISINs
 * - Column visibility toggle with localStorage persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/contexts/ToastContext';
import type { Instrument } from '@/lib/api/instruments';

// Column definitions
const ALL_COLUMNS = [
  { key: 'isin', label: 'ISIN' },
  { key: 'name', label: 'Name' },
  { key: 'assetClass', label: 'Asset Class' },
  { key: 'currency', label: 'Currency' },
  { key: 'status', label: 'Status' },
] as const;

type ColumnKey = (typeof ALL_COLUMNS)[number]['key'];

interface ColumnPreferences {
  [key: string]: boolean;
}

const DEFAULT_COLUMN_PREFERENCES: ColumnPreferences = {
  isin: true,
  name: true,
  assetClass: true,
  currency: true,
  status: true,
};

const STORAGE_KEY = 'instruments.columnPreferences';
const PAGE_SIZE = 50;

export function InstrumentsPage() {
  const { showToast } = useToast();

  // Data state
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and sort state
  const [inputValue, setInputValue] = useState(''); // Display value for input
  const [searchTerm, setSearchTerm] = useState(''); // Debounced search term for API
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Detail view state
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

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

  // Column toggle state
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);
  const [columnPreferences, setColumnPreferences] = useState<ColumnPreferences>(
    DEFAULT_COLUMN_PREFERENCES,
  );
  const [tempColumnPreferences, setTempColumnPreferences] =
    useState<ColumnPreferences>(DEFAULT_COLUMN_PREFERENCES);
  const [columnError, setColumnError] = useState<string | null>(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Load column preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColumnPreferences(parsed);
      } catch {
        // Use defaults if parsing fails
      }
    }
  }, []);

  // Fetch instruments
  const fetchInstruments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (sortColumn) {
        params.append('sort', sortColumn);
        params.append('direction', sortDirection);
      }
      params.append('page', String(currentPage));
      params.append('limit', String(PAGE_SIZE));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STATIC_DATA_API_URL || 'http://localhost:10004/investinsight/static-data'}/v1/instruments?${params.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const result = await response.json();
      setInstruments(result.data || []);
      setTotal(result.total || 0);
    } catch {
      setError('Failed to load instruments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortColumn, sortDirection, currentPage]);

  useEffect(() => {
    fetchInstruments();
  }, [fetchInstruments]);

  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setInputValue(value); // Update display immediately
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value); // Update search term after debounce
      setCurrentPage(1);
    }, 200);
  };

  // Sort handling
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Row click handling
  const handleRowClick = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
    setShowDetailView(true);
  };

  // File upload handling
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = ['.xlsx', '.csv', '.xls'];
      const hasValidExtension = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext),
      );

      if (!hasValidExtension) {
        setUploadError(
          'Invalid file format. Please upload an xlsx or csv file.',
        );
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STATIC_DATA_API_URL || 'http://localhost:10004/investinsight/static-data'}/v1/instruments/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadResult(result);

      // Refresh the grid
      await fetchInstruments();

      showToast({
        variant: 'success',
        title: `${result.added} instruments added, ${result.updated} updated`,
      });
    } catch {
      setUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadDialog = () => {
    setSelectedFile(null);
    setUploadError(null);
    setUploadResult(null);
    setShowUploadDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Column toggle handling
  const handleOpenColumnsDialog = () => {
    setTempColumnPreferences({ ...columnPreferences });
    setColumnError(null);
    setShowColumnsDialog(true);
  };

  const handleColumnToggle = (key: string, checked: boolean) => {
    setTempColumnPreferences((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleApplyColumns = () => {
    const visibleCount = Object.values(tempColumnPreferences).filter(
      Boolean,
    ).length;
    if (visibleCount === 0) {
      setColumnError('At least one column must be visible');
      return;
    }

    setColumnPreferences(tempColumnPreferences);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempColumnPreferences));
    setShowColumnsDialog(false);
  };

  const handleCloseColumnsDialog = () => {
    setShowColumnsDialog(false);
    setColumnError(null);
  };

  // Export incomplete ISINs
  const handleExportIncomplete = async () => {
    setExporting(true);
    setExportMessage(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STATIC_DATA_API_URL || 'http://localhost:10004/investinsight/static-data'}/v1/instruments/incomplete`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          setExportMessage('No incomplete instruments found');
          return;
        }
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'incomplete_instruments.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setExportMessage('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Visible columns
  const visibleColumns = ALL_COLUMNS.filter(
    (col) => columnPreferences[col.key],
  );

  // Pagination
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Instruments</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          type="search"
          placeholder="Search instruments..."
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-64"
          aria-label="Search"
          role="searchbox"
        />

        <Button
          variant="outline"
          onClick={() => setShowUploadDialog(true)}
          aria-label="Upload File"
        >
          Upload File
        </Button>

        <Button
          variant="outline"
          onClick={handleExportIncomplete}
          disabled={exporting}
          aria-label="Export Incomplete"
        >
          {exporting ? 'Exporting...' : 'Export Incomplete'}
        </Button>

        <Button
          variant="outline"
          onClick={handleOpenColumnsDialog}
          aria-label="Columns"
        >
          Columns
        </Button>
      </div>

      {/* Export message */}
      {exportMessage && (
        <div className="mb-4 text-amber-600">{exportMessage}</div>
      )}

      {/* Error state */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading state */}
      {loading ? (
        <div>Loading instruments...</div>
      ) : error ? null : instruments.length === 0 ? (
        <div>No instruments found</div>
      ) : (
        <>
          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((col) => (
                  <TableHead
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    {col.label}
                    {sortColumn === col.key && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {instruments.map((instrument) => (
                <TableRow
                  key={instrument.id}
                  onClick={() => handleRowClick(instrument)}
                  className="cursor-pointer hover:bg-muted"
                >
                  {visibleColumns.map((col) => (
                    <TableCell key={col.key}>
                      {instrument[col.key as keyof Instrument]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Next"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail View Dialog */}
      <Dialog open={showDetailView} onOpenChange={setShowDetailView}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instrument Details</DialogTitle>
          </DialogHeader>
          {selectedInstrument && (
            <div className="space-y-4">
              <div>
                <Label>ISIN</Label>
                <div>{selectedInstrument.isin}</div>
              </div>
              <div>
                <Label>Name</Label>
                <div>{selectedInstrument.name}</div>
              </div>
              <div>
                <Label>Asset Class</Label>
                <div>{selectedInstrument.assetClass}</div>
              </div>
              <div>
                <Label>Currency</Label>
                <div>{selectedInstrument.currency}</div>
              </div>
              <div>
                <Label>Status</Label>
                <div>{selectedInstrument.status}</div>
              </div>
              {selectedInstrument.issuer && (
                <div>
                  <Label>Issuer</Label>
                  <div>{selectedInstrument.issuer}</div>
                </div>
              )}
              {selectedInstrument.maturityDate && (
                <div>
                  <Label>Maturity Date</Label>
                  <div>{selectedInstrument.maturityDate}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={resetUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Instruments File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-input">Select File</Label>
              <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                accept=".xlsx,.csv,.xls"
                onChange={handleFileSelect}
                aria-label="Select file"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs file:border-0 file:bg-transparent file:text-sm file:font-medium"
              />
            </div>

            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                {selectedFile.name}
              </div>
            )}

            {uploadError && <div className="text-red-500">{uploadError}</div>}

            {uploadResult && (
              <div className="space-y-2">
                <div className="text-green-600">
                  {uploadResult.added} instruments added, {uploadResult.updated}{' '}
                  updated
                </div>
                {uploadResult.errors.length > 0 && (
                  <div className="space-y-1">
                    {uploadResult.errors.map((err, idx) => (
                      <div key={idx} className="text-red-500 text-sm">
                        Row {err.row}: {err.reason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={resetUploadDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                aria-label="Upload"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Columns Dialog */}
      <Dialog open={showColumnsDialog} onOpenChange={handleCloseColumnsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Toggle Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {ALL_COLUMNS.map((col) => (
              <div key={col.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`col-${col.key}`}
                  checked={tempColumnPreferences[col.key]}
                  onChange={(e) =>
                    handleColumnToggle(col.key, e.target.checked)
                  }
                  aria-label={col.label}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor={`col-${col.key}`}>{col.label}</Label>
              </div>
            ))}

            {columnError && <div className="text-red-500">{columnError}</div>}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCloseColumnsDialog}
                aria-label="Cancel"
              >
                Cancel
              </Button>
              <Button onClick={handleApplyColumns} aria-label="Apply">
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstrumentsPage;
