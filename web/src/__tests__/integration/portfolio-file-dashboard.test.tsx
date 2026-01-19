/**
 * Integration Test: Portfolio File Dashboard (Epic 2)
 *
 * Tests for Epic 2: Portfolio File Import Dashboard
 * Stories covered: 2.1-2.7
 *
 * Test Strategy:
 * - Test user-observable behavior (what users see/interact with)
 * - Mock fetch globally (API uses fetch directly)
 * - Use accessibility-first queries (getByRole, getByLabelText)
 * - Assert specific content, not implementation details
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import PortfolioFileDashboard from '@/app/batches/[batchId]/portfolio-files/page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  useParams: () => ({ batchId: 'batch-123' }),
  usePathname: () => '/batches/batch-123/portfolio-files',
}));

// Mock ToastContext
const mockShowToast = vi.fn();
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Test data factories
const createMockPortfolioFileGrid = (overrides = {}) => ({
  portfolios: [
    {
      portfolioId: 'portfolio-1',
      portfolioName: 'Portfolio A',
      files: {
        holdings: {
          status: 'Success',
          fileName: 'holdings_jan2024.csv',
          uploadedBy: 'John Smith',
          uploadedAt: '2024-01-15T10:30:00Z',
          errorCount: 0,
        },
        transactions: {
          status: 'Pending',
        },
        cashFlow: {
          status: 'Processing',
          fileName: 'cashflow_jan2024.csv',
        },
        benchmark: {
          status: 'Warning',
          fileName: 'benchmark_jan2024.csv',
          uploadedBy: 'Jane Doe',
          uploadedAt: '2024-01-15T11:00:00Z',
          errorCount: 5,
        },
        performance: {
          status: 'Failed',
          fileName: 'performance_jan2024.csv',
          uploadedBy: 'Bob Wilson',
          uploadedAt: '2024-01-15T09:45:00Z',
          errorCount: 25,
        },
        risk: { status: 'Pending' },
        compliance: { status: 'Pending' },
      },
    },
    {
      portfolioId: 'portfolio-2',
      portfolioName: 'Portfolio B',
      files: {
        holdings: { status: 'Success', fileName: 'holdings_b.csv' },
        transactions: { status: 'Success', fileName: 'transactions_b.csv' },
        cashFlow: { status: 'Success', fileName: 'cashflow_b.csv' },
        benchmark: { status: 'Success', fileName: 'benchmark_b.csv' },
        performance: { status: 'Success', fileName: 'performance_b.csv' },
        risk: { status: 'Success', fileName: 'risk_b.csv' },
        compliance: { status: 'Success', fileName: 'compliance_b.csv' },
      },
    },
  ],
  ...overrides,
});

// Mock fetch globally
const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = mockFetch;
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Helper to create mock response
const createMockResponse = (data: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
  blob: () => Promise.resolve(new Blob()),
});

describe('Portfolio File Dashboard - Story 2.1: Display File Grid', () => {
  it('displays grid with 7 file type columns when page loads', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Holdings')).toBeInTheDocument();
    });

    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Cash Flow')).toBeInTheDocument();
    expect(screen.getByText('Benchmark')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Risk')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
  });

  it('displays portfolio names in leftmost column', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Portfolio A')).toBeInTheDocument();
    });

    expect(screen.getByText('Portfolio B')).toBeInTheDocument();
  });

  it('displays status icons with correct semantic meaning', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      // Success status - accessible as image with "success" in alt text
      const successIcons = screen.getAllByRole('img', { name: /success/i });
      expect(successIcons.length).toBeGreaterThan(0);
    });

    // Warning status
    expect(screen.getByRole('img', { name: /warning/i })).toBeInTheDocument();

    // Failed status
    expect(screen.getByRole('img', { name: /failed/i })).toBeInTheDocument();

    // Processing status
    expect(
      screen.getByRole('img', { name: /processing/i }),
    ).toBeInTheDocument();
  });

  it('displays file name and upload date for uploaded files', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(screen.getByText('holdings_jan2024.csv')).toBeInTheDocument();
    });

    // Upload date should be visible (multiple dates may exist, use getAllBy)
    expect(screen.getAllByText(/01\/15\/24/i).length).toBeGreaterThan(0);

    // Uploaded by information
    expect(screen.getByText(/J\. Smith/i)).toBeInTheDocument();
  });

  it('displays multiple portfolios in alphabetical order', async () => {
    const multiPortfolioData = createMockPortfolioFileGrid({
      portfolios: [
        {
          portfolioId: 'p3',
          portfolioName: 'Zebra Portfolio',
          files: {
            holdings: { status: 'Pending' },
            transactions: { status: 'Pending' },
            cashFlow: { status: 'Pending' },
            benchmark: { status: 'Pending' },
            performance: { status: 'Pending' },
            risk: { status: 'Pending' },
            compliance: { status: 'Pending' },
          },
        },
        {
          portfolioId: 'p1',
          portfolioName: 'Alpha Portfolio',
          files: {
            holdings: { status: 'Pending' },
            transactions: { status: 'Pending' },
            cashFlow: { status: 'Pending' },
            benchmark: { status: 'Pending' },
            performance: { status: 'Pending' },
            risk: { status: 'Pending' },
            compliance: { status: 'Pending' },
          },
        },
        {
          portfolioId: 'p2',
          portfolioName: 'Beta Portfolio',
          files: {
            holdings: { status: 'Pending' },
            transactions: { status: 'Pending' },
            cashFlow: { status: 'Pending' },
            benchmark: { status: 'Pending' },
            performance: { status: 'Pending' },
            risk: { status: 'Pending' },
            compliance: { status: 'Pending' },
          },
        },
      ],
    });

    mockFetch.mockResolvedValue(createMockResponse(multiPortfolioData));
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // Skip header row, get portfolio names from data rows
      const portfolioNames = rows.slice(1).map((row) => {
        const cell = within(row).getAllByRole('cell')[0];
        return cell.textContent;
      });
      expect(portfolioNames).toEqual([
        'Alpha Portfolio',
        'Beta Portfolio',
        'Zebra Portfolio',
      ]);
    });
  });

  it('shows Upload button for Pending status files', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      const uploadButtons = screen.getAllByRole('button', {
        name: /^upload$/i,
      });
      expect(uploadButtons.length).toBeGreaterThan(0);
    });
  });

  it('shows Re-import button for Success status files', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      const reimportButtons = screen.getAllByRole('button', {
        name: /re-import/i,
      });
      expect(reimportButtons.length).toBeGreaterThan(0);
    });
  });

  it('shows View Errors button for Warning status files', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /view errors/i }).length,
      ).toBeGreaterThan(0);
    });
  });

  it('shows Cancel button for Processing status files', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /^cancel$/i }).length,
      ).toBeGreaterThan(0);
    });
  });

  it('shows green left border indicator when all files are Success', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      const portfolioBRow = screen.getByText('Portfolio B').closest('tr');
      expect(portfolioBRow).toHaveClass('border-green-500');
    });
  });

  it('shows "No portfolios found" message when no portfolios exist', async () => {
    mockFetch.mockResolvedValue(createMockResponse({ portfolios: [] }));
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/no portfolios found for this batch/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error message when API is unavailable', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/unable to load file status/i),
      ).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<PortfolioFileDashboard />);

    expect(screen.getByText(/loading portfolio files/i)).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });

  it('truncates long file names with ellipsis', async () => {
    const longFileName = 'very_long_file_name_that_exceeds_twenty_chars.csv';
    const dataWithLongName = createMockPortfolioFileGrid();
    dataWithLongName.portfolios[0].files.holdings.fileName = longFileName;

    mockFetch.mockResolvedValue(createMockResponse(dataWithLongName));
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      // The truncated element has the full name in its title attribute
      const elements = screen.getAllByTitle(longFileName);
      expect(elements.length).toBeGreaterThan(0);
      // Should show truncated text (contains "..." in the display)
      expect(elements[0].textContent).toContain('...');
    });
  });
});

describe('Portfolio File Dashboard - Story 2.4: View Errors', () => {
  it('opens Error Details modal when View Errors button is clicked', async () => {
    const user = userEvent.setup();
    const errorData = {
      summary: { totalErrors: 5, criticalCount: 3, warningCount: 2 },
      errors: [],
      hasMore: false,
    };

    mockFetch
      .mockResolvedValueOnce(createMockResponse(createMockPortfolioFileGrid()))
      .mockResolvedValueOnce(createMockResponse(errorData));

    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /view errors/i }).length,
      ).toBeGreaterThan(0);
    });

    const viewErrorsButton = screen.getAllByRole('button', {
      name: /view errors/i,
    })[0];
    await user.click(viewErrorsButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('displays error list with row number, column, message, and severity', async () => {
    const user = userEvent.setup();
    const errorData = {
      summary: {
        totalErrors: 25,
        criticalCount: 15,
        warningCount: 10,
        infoCount: 0,
      },
      errors: [
        {
          rowNumber: 5,
          column: 'Price',
          message: 'Invalid number format',
          severity: 'Critical',
          originalValue: 'abc123',
        },
        {
          rowNumber: 10,
          column: 'Date',
          message: 'Future date not allowed',
          severity: 'Warning',
          originalValue: '2025-12-31',
        },
      ],
      hasMore: true,
    };

    mockFetch
      .mockResolvedValueOnce(createMockResponse(createMockPortfolioFileGrid()))
      .mockResolvedValueOnce(createMockResponse(errorData));

    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /view errors/i }).length,
      ).toBeGreaterThan(0);
    });

    await user.click(
      screen.getAllByRole('button', { name: /view errors/i })[0],
    );

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('5')).toBeInTheDocument(); // Row number
      expect(within(dialog).getByText('Price')).toBeInTheDocument(); // Column
      expect(
        within(dialog).getByText('Invalid number format'),
      ).toBeInTheDocument(); // Message
      expect(within(dialog).getByText('Critical')).toBeInTheDocument(); // Severity
    });
  });

  it('displays error summary with counts by severity', async () => {
    const user = userEvent.setup();
    const errorData = {
      summary: {
        totalErrors: 25,
        criticalCount: 15,
        warningCount: 10,
        infoCount: 0,
      },
      errors: [],
      hasMore: false,
    };

    mockFetch
      .mockResolvedValueOnce(createMockResponse(createMockPortfolioFileGrid()))
      .mockResolvedValueOnce(createMockResponse(errorData));

    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /view errors/i }).length,
      ).toBeGreaterThan(0);
    });

    await user.click(
      screen.getAllByRole('button', { name: /view errors/i })[0],
    );

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/15 critical/i)).toBeInTheDocument();
      expect(within(dialog).getByText(/10 warnings/i)).toBeInTheDocument();
    });
  });

  it('loads more errors when Load More button is clicked', async () => {
    const user = userEvent.setup();
    const firstPage = {
      summary: { totalErrors: 50, criticalCount: 25, warningCount: 25 },
      errors: Array(20)
        .fill(null)
        .map((_, i) => ({
          rowNumber: i + 1,
          column: 'Test',
          message: 'Error',
          severity: 'Critical',
        })),
      hasMore: true,
    };

    const secondPage = {
      summary: { totalErrors: 50, criticalCount: 25, warningCount: 25 },
      errors: Array(20)
        .fill(null)
        .map((_, i) => ({
          rowNumber: i + 21,
          column: 'Test2',
          message: 'Error2',
          severity: 'Warning',
        })),
      hasMore: false,
    };

    mockFetch
      .mockResolvedValueOnce(createMockResponse(createMockPortfolioFileGrid()))
      .mockResolvedValueOnce(createMockResponse(firstPage))
      .mockResolvedValueOnce(createMockResponse(secondPage));

    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /view errors/i }).length,
      ).toBeGreaterThan(0);
    });

    await user.click(
      screen.getAllByRole('button', { name: /view errors/i })[0],
    );

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByRole('button', { name: /load more/i }),
      ).toBeInTheDocument();
    });

    const loadMoreButton = within(screen.getByRole('dialog')).getByRole(
      'button',
      { name: /load more/i },
    );
    await user.click(loadMoreButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});

describe('Portfolio File Dashboard - Story 2.5: Cancel Import', () => {
  it('shows confirmation dialog when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /^cancel$/i }).length,
      ).toBeGreaterThan(0);
    });

    const cancelButton = screen.getAllByRole('button', {
      name: /^cancel$/i,
    })[0];
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/processing will stop and data will not be saved/i),
    ).toBeInTheDocument();
  });

  it('cancels import when user confirms cancellation', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(createMockPortfolioFileGrid()))
      .mockResolvedValueOnce(
        createMockResponse({
          success: true,
          message: 'Import canceled',
          fileStatus: 'Pending',
        }),
      )
      .mockResolvedValueOnce(createMockResponse(createMockPortfolioFileGrid()));

    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /^cancel$/i }).length,
      ).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByRole('button', { name: /^cancel$/i })[0]);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /yes, cancel import/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /yes, cancel import/i }),
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/cancel'),
        expect.anything(),
      );
    });
  });

  it('continues processing when user declines cancellation', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /^cancel$/i }).length,
      ).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByRole('button', { name: /^cancel$/i })[0]);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /no, continue processing/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /no, continue processing/i }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /yes, cancel import/i }),
      ).not.toBeInTheDocument();
    });

    // Only the initial load should have happened
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('Portfolio File Dashboard - Story 2.6: Auto-refresh', () => {
  it('refreshes immediately when Refresh Now button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );

    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /refresh now/i }),
      ).toBeInTheDocument();
    });

    const initialCallCount = mockFetch.mock.calls.length;

    await user.click(screen.getByRole('button', { name: /refresh now/i }));

    await waitFor(() => {
      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('displays pause auto-refresh button when files are processing', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );

    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      // Files are processing, so pause button should be visible
      expect(
        screen.getByRole('button', { name: /pause auto-refresh/i }),
      ).toBeInTheDocument();
    });
  });

  it('does not show pause button when no files are processing', async () => {
    const allCompleteData = createMockPortfolioFileGrid();
    allCompleteData.portfolios[0].files.cashFlow.status = 'Success';

    mockFetch.mockResolvedValue(createMockResponse(allCompleteData));

    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Portfolio A')).toBeInTheDocument();
    });

    // Pause button should not be visible when no processing files
    expect(
      screen.queryByRole('button', { name: /pause auto-refresh/i }),
    ).not.toBeInTheDocument();
  });
});

describe('Portfolio File Dashboard - Story 2.7: Navigate to Other Files', () => {
  it('navigates to Other Files dashboard when all files are successful', async () => {
    const user = userEvent.setup();
    const allSuccessData = createMockPortfolioFileGrid();
    allSuccessData.portfolios = [allSuccessData.portfolios[1]]; // Portfolio B with all success

    mockFetch.mockResolvedValue(createMockResponse(allSuccessData));
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /proceed to other files/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /proceed to other files/i }),
    );

    // Should navigate without showing warning dialog
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/other-files'),
      );
    });
  });

  it('shows warning dialog when files are still processing', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse(createMockPortfolioFileGrid()),
    );
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Portfolio A')).toBeInTheDocument();
    });

    // Find the Proceed button (text without tooltip)
    const proceedButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.textContent?.includes('Proceed to Other Files'));
    expect(proceedButtons.length).toBeGreaterThan(0);

    await user.click(proceedButtons[0]);

    // Wait for warning dialog to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Check the warning message is in the dialog
    expect(screen.getByText(/files are still processing/i)).toBeInTheDocument();
  });

  it('shows warning dialog when all files are pending', async () => {
    const user = userEvent.setup();
    const allPendingData = createMockPortfolioFileGrid({
      portfolios: [
        {
          portfolioId: 'portfolio-1',
          portfolioName: 'Portfolio A',
          files: {
            holdings: { status: 'Pending' },
            transactions: { status: 'Pending' },
            cashFlow: { status: 'Pending' },
            benchmark: { status: 'Pending' },
            performance: { status: 'Pending' },
            risk: { status: 'Pending' },
            compliance: { status: 'Pending' },
          },
        },
        {
          portfolioId: 'portfolio-2',
          portfolioName: 'Portfolio B',
          files: {
            holdings: { status: 'Pending' },
            transactions: { status: 'Pending' },
            cashFlow: { status: 'Pending' },
            benchmark: { status: 'Pending' },
            performance: { status: 'Pending' },
            risk: { status: 'Pending' },
            compliance: { status: 'Pending' },
          },
        },
      ],
    });

    mockFetch.mockResolvedValue(createMockResponse(allPendingData));
    render(<PortfolioFileDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Portfolio A')).toBeInTheDocument();
    });

    // Find the Proceed button by its text content
    const proceedButton = screen.getByText(/Proceed to Other Files/i);
    expect(proceedButton).toBeInTheDocument();

    // Click the button (or its parent button element)
    await user.click(proceedButton.closest('button') || proceedButton);

    // Wait for warning dialog to appear
    await waitFor(
      () => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Check the warning message is in the dialog
    expect(
      screen.getByText(/no portfolio files have been uploaded/i),
    ).toBeInTheDocument();
  });
});
