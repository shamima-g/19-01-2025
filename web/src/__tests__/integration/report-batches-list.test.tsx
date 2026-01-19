/**
 * Integration Test: Report Batches List (Story 1.1)
 *
 * Tests the Start Page batch list functionality including:
 * - Viewing batches in a paginated table
 * - Search and filter functionality
 * - Status badge rendering
 * - Loading and error states
 * - Edge cases (empty state, pagination)
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
import { ReportBatchesTable } from '@/components/ReportBatchesTable';

// Store original fetch
const originalFetch = global.fetch;

// Mock data factory
const createMockBatch = (overrides: Record<string, unknown> = {}) => ({
  id: 'batch-001',
  month: 'January',
  year: 2024,
  status: 'Pending' as const,
  createdDate: '2024-01-15T10:00:00Z',
  createdBy: 'admin@example.com',
  ...overrides,
});

const createMockBatchList = (count: number) => {
  const statuses = ['Pending', 'In Progress', 'Completed', 'Failed'] as const;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `batch-${String(i + 1).padStart(3, '0')}`,
    month: months[i % 12],
    year: 2024 - Math.floor(i / 12),
    status: statuses[i % 4],
    createdDate: `2024-01-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
    createdBy: 'admin@example.com',
  }));
};

// Helper to create a mock response
const createMockResponse = (data: unknown[], total: number) => ({
  ok: true,
  status: 200,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => ({ data, total }),
});

describe('Report Batches List - Story 1.1', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = vi.fn();
  });

  afterEach(() => {
    // Restore original fetch and cleanup
    global.fetch = originalFetch;
    cleanup();
    vi.clearAllMocks();
  });

  describe('Happy Path', () => {
    it('displays table with all columns when page loads', async () => {
      // Arrange
      const mockBatches = createMockBatchList(5);
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockBatches, 5),
      );

      // Act
      render(<ReportBatchesTable />);

      // Assert - wait for data to load
      await waitFor(() => {
        expect(screen.getByText('January')).toBeInTheDocument();
      });

      // Verify all columns are present
      expect(screen.getByText('Batch ID')).toBeInTheDocument();
      expect(screen.getByText('Month')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created Date')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('displays pagination controls when there are 10+ batches', async () => {
      // Arrange
      const mockBatches = createMockBatchList(25);
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockBatches.slice(0, 10), 25),
      );

      // Act
      render(<ReportBatchesTable />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('January')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });

    it('navigates to next page when Next button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBatches = createMockBatchList(25);

      // First page
      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockBatches.slice(0, 10), 25))
        .mockResolvedValueOnce(
          createMockResponse(mockBatches.slice(10, 20), 25),
        );

      render(<ReportBatchesTable />);

      await waitFor(() => {
        expect(screen.getByText('batch-001')).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('batch-011')).toBeInTheDocument();
      });
    });

    it('returns to first page when Previous button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBatches = createMockBatchList(25);

      // Set up all mocks in order
      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockBatches.slice(0, 10), 25))
        .mockResolvedValueOnce(
          createMockResponse(mockBatches.slice(10, 20), 25),
        )
        .mockResolvedValueOnce(
          createMockResponse(mockBatches.slice(0, 10), 25),
        );

      render(<ReportBatchesTable />);

      await waitFor(() => {
        expect(screen.getByText('batch-001')).toBeInTheDocument();
      });

      // Navigate to second page
      await user.click(screen.getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText('batch-011')).toBeInTheDocument();
      });

      // Act - navigate back
      await user.click(screen.getByRole('button', { name: /previous/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText('batch-001')).toBeInTheDocument();
      });
    });

    it('displays color-coded status badges', async () => {
      // Arrange
      const mockBatches = [
        createMockBatch({ status: 'Pending', id: 'batch-001' }),
        createMockBatch({ status: 'In Progress', id: 'batch-002' }),
        createMockBatch({ status: 'Completed', id: 'batch-003' }),
        createMockBatch({ status: 'Failed', id: 'batch-004' }),
      ];

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockBatches, 4),
      );

      // Act
      render(<ReportBatchesTable />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  describe('Search & Filter', () => {
    it('filters batches when searching for year', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBatches = createMockBatchList(5);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockBatches, 5))
        .mockResolvedValueOnce(
          createMockResponse(
            mockBatches.filter((b) => b.year === 2024),
            5,
          ),
        );

      render(<ReportBatchesTable />);

      await waitFor(() => {
        expect(screen.getByText('January')).toBeInTheDocument();
      });

      // Act
      const searchInput = screen.getByRole('searchbox', { name: /search/i });
      await user.type(searchInput, '2024');

      // Assert - wait for debounced search
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('search=2024'),
            expect.anything(),
          );
        },
        { timeout: 500 },
      );
    });

    it('filters batches when searching for month', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBatches = createMockBatchList(12);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockBatches, 12))
        .mockResolvedValueOnce(
          createMockResponse(
            mockBatches.filter((b) => b.month === 'January'),
            1,
          ),
        );

      render(<ReportBatchesTable />);

      await waitFor(() => {
        expect(screen.getByText('January')).toBeInTheDocument();
      });

      // Act
      const searchInput = screen.getByRole('searchbox', { name: /search/i });
      await user.type(searchInput, 'January');

      // Assert
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('search=January'),
            expect.anything(),
          );
        },
        { timeout: 500 },
      );
    });

    it('shows no results message when search returns empty', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBatches = createMockBatchList(5);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockBatches, 5))
        .mockResolvedValueOnce(createMockResponse([], 0));

      render(<ReportBatchesTable />);

      await waitFor(() => {
        expect(screen.getByText('January')).toBeInTheDocument();
      });

      // Act
      const searchInput = screen.getByRole('searchbox', { name: /search/i });
      await user.type(searchInput, 'NonExistentBatch');

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no batches found/i)).toBeInTheDocument();
      });
    });

    it('shows all batches when search is cleared', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBatches = createMockBatchList(5);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockBatches, 5))
        .mockResolvedValueOnce(createMockResponse([mockBatches[0]], 1))
        .mockResolvedValueOnce(createMockResponse(mockBatches, 5));

      render(<ReportBatchesTable />);

      await waitFor(() => {
        expect(screen.getByText('January')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('searchbox', { name: /search/i });
      await user.type(searchInput, 'January');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('search=January'),
          expect.anything(),
        );
      });

      // Act - clear search
      await user.clear(searchInput);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
          expect.not.stringContaining('search='),
          expect.anything(),
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty state when no batches exist', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValueOnce(createMockResponse([], 0));

      // Act
      render(<ReportBatchesTable />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /no report batches found\. create your first batch to get started\./i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('does not show pagination controls for exactly 10 batches', async () => {
      // Arrange
      const mockBatches = createMockBatchList(10);
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockBatches, 10),
      );

      // Act
      render(<ReportBatchesTable />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('January')).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /next/i }),
      ).not.toBeInTheDocument();
    });

    it('shows correct page indicator for 25 batches', async () => {
      // Arrange
      const mockBatches = createMockBatchList(25);
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockBatches.slice(0, 10), 25),
      );

      // Act
      render(<ReportBatchesTable />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API is unavailable', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch'),
      );

      // Act
      render(<ReportBatchesTable />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /unable to load batches\. please try again later\./i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows API error message when API returns error', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          Messages: ['Database connection failed'],
        }),
      });

      // Act
      render(<ReportBatchesTable />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          /database connection failed/i,
        );
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner while fetching data', async () => {
      // Arrange - mock that never resolves (stays loading)
      (global.fetch as Mock).mockImplementationOnce(
        () => new Promise(() => {}),
      );

      // Act
      render(<ReportBatchesTable />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading batches\.\.\./i)).toBeInTheDocument();
    });

    it('shows loading indicator during initial load', async () => {
      // Arrange - mock that never resolves (stays loading)
      let resolveFetch: (value: ReturnType<typeof createMockResponse>) => void;
      const fetchPromise = new Promise<ReturnType<typeof createMockResponse>>(
        (resolve) => {
          resolveFetch = resolve;
        },
      );
      (global.fetch as Mock).mockReturnValueOnce(fetchPromise);

      // Act
      render(<ReportBatchesTable />);

      // Assert - should show loading state
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading batches\.\.\./i)).toBeInTheDocument();

      // Resolve fetch to clean up
      const mockBatches = createMockBatchList(5);
      resolveFetch!(createMockResponse(mockBatches, 5));
    });
  });
});
