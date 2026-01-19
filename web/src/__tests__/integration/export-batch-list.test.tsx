/**
 * Integration Test: Export Batch List (Story 1.5)
 *
 * Tests CSV export functionality including:
 * - Export all batches vs filtered results
 * - CSV format and structure
 * - File naming and download
 * - Loading and error states
 * - Large dataset handling
 */

import {
  vi,
  type Mock,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportBatchList } from '@/components/ExportBatchList';

// Store original fetch
const originalFetch = global.fetch;
const originalCreateObjectURL = global.URL.createObjectURL;
const originalRevokeObjectURL = global.URL.revokeObjectURL;

// Mock toast context
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock file download
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock link click for download
const mockLinkClick = vi.fn();
HTMLAnchorElement.prototype.click = mockLinkClick;

// Helper to create a mock CSV response
const createMockCSVResponse = (csvContent: string) => ({
  ok: true,
  status: 200,
  headers: new Headers({ 'content-type': 'text/csv' }),
  blob: async () => new Blob([csvContent], { type: 'text/csv' }),
});

describe('Export Batch List - Story 1.5', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
    cleanup();
  });

  describe('Happy Path', () => {
    it('downloads CSV file when Export to CSV is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCSV =
        'Batch ID,Month,Year,Status,Created Date,Created By\nbatch-001,January,2024,Pending,2024-01-15,admin@example.com';

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockCSVResponse(mockCSV),
      );

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/report-batches/export'),
          expect.anything(),
        );
      });
    });

    it('exports all batches when no filter is applied', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCSV = 'Batch ID,Month,Year,Status,Created Date,Created By\n';

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockCSVResponse(mockCSV),
      );

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('includeFiltered=false'),
          expect.anything(),
        );
      });
    });
  });

  describe('Export Options', () => {
    it('shows confirmation dialog when filters are applied', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<ExportBatchList totalBatches={25} filteredBatches={5} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /export all batches \(25\) or only filtered results \(5\)\?/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('exports all batches when Export All is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCSV = 'Batch ID,Month,Year,Status,Created Date,Created By\n';

      render(<ExportBatchList totalBatches={25} filteredBatches={5} />);

      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockCSVResponse(mockCSV),
      );

      // Act
      await user.click(screen.getByRole('button', { name: /export all/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('includeFiltered=false'),
          expect.anything(),
        );
      });
    });

    it('exports only filtered results when Export Filtered is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCSV = 'Batch ID,Month,Year,Status,Created Date,Created By\n';

      render(<ExportBatchList totalBatches={25} filteredBatches={5} />);

      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockCSVResponse(mockCSV),
      );

      // Act
      await user.click(
        screen.getByRole('button', { name: /export filtered/i }),
      );

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('includeFiltered=true'),
          expect.anything(),
        );
      });
    });

    it('downloads immediately without confirmation when no filter', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCSV = 'Batch ID,Month,Year,Status,Created Date,Created By\n';

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockCSVResponse(mockCSV),
      );

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert - no confirmation dialog
      expect(screen.queryByText(/export all batches/i)).not.toBeInTheDocument();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Button States', () => {
    it('has tooltip text on Export button', async () => {
      // Arrange & Act
      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Assert
      const button = screen.getByRole('button', { name: /export to csv/i });
      expect(button).toHaveAttribute(
        'title',
        'Download batch list as CSV file',
      );
    });

    it('shows spinner and Exporting text during export', async () => {
      // Arrange
      const user = userEvent.setup();

      // Create a deferred promise
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as Mock).mockReturnValueOnce(fetchPromise);

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /exporting\.\.\./i }),
        ).toBeInTheDocument();
      });

      // Resolve to clean up
      resolveFetch!(createMockCSVResponse('data'));
    });

    it('disables button during export', async () => {
      // Arrange
      const user = userEvent.setup();

      // Create a deferred promise
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as Mock).mockReturnValueOnce(fetchPromise);

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /exporting\.\.\./i }),
        ).toBeDisabled();
      });

      // Resolve to clean up
      resolveFetch!(createMockCSVResponse('data'));
    });
  });

  describe('Edge Cases', () => {
    it('shows error when no batches exist', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<ExportBatchList totalBatches={0} filteredBatches={0} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no batches to export/i)).toBeInTheDocument();
      });
    });

    it('shows warning for large exports over 1000 rows', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<ExportBatchList totalBatches={1500} filteredBatches={1500} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /large export \(1000\+ rows\) may take a moment\. continue\?/i,
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API is unavailable', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch'),
      );

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /unable to export batches\. please try again later\./i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows API error message when server returns 500', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          Messages: ['Export failed due to data error. Contact support.'],
        }),
      });

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /export failed due to data error\. contact support\./i,
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows progress indicator during export generation', async () => {
      // Arrange
      const user = userEvent.setup();

      // Create a deferred promise
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as Mock).mockReturnValueOnce(fetchPromise);

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/preparing export/i)).toBeInTheDocument();
      });

      // Resolve to clean up
      resolveFetch!(createMockCSVResponse('data'));
    });

    it('shows download ready notification when file is ready', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCSV = 'Batch ID,Month,Year,Status,Created Date,Created By\n';

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockCSVResponse(mockCSV),
      );

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/download ready/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Naming', () => {
    it('triggers download when export completes', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCSV = 'Batch ID,Month,Year,Status,Created Date,Created By\n';

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockCSVResponse(mockCSV),
      );

      render(<ExportBatchList totalBatches={25} filteredBatches={25} />);

      // Act
      await user.click(screen.getByRole('button', { name: /export to csv/i }));

      // Assert - download link click was triggered
      await waitFor(() => {
        expect(mockLinkClick).toHaveBeenCalled();
      });

      // Verify "download ready" message appears
      expect(screen.getByText(/download ready/i)).toBeInTheDocument();
    });
  });
});
