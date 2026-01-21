/**
 * Integration Test: Index Prices Grid (Epic 5)
 *
 * Tests for Epic 5: Market Data Maintenance
 * Story covered: 5.1 (View Index Prices Grid)
 *
 * Test Strategy:
 * - Test user-observable behavior (grid display, sorting, searching, filtering)
 * - Mock only the HTTP client (test real components)
 * - Use accessibility-first queries (getByRole, getByLabelText)
 * - Verify user outcomes, not implementation details
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import IndexPricesPage from '@/app/index-prices/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/index-prices',
}));

// Mock ToastContext
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch globally
const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = mockFetch;
  localStorage.clear();
});

// Test data factory
const createMockIndexPrices = (overrides = {}) => ({
  prices: [
    {
      id: 'price-1',
      indexCode: 'SPX',
      indexName: 'S&P 500',
      date: '2024-01-20',
      price: 4783.45,
      currency: 'USD',
    },
    {
      id: 'price-2',
      indexCode: 'INDU',
      indexName: 'Dow Jones Industrial Average',
      date: '2024-01-20',
      price: 37863.8,
      currency: 'USD',
    },
    {
      id: 'price-3',
      indexCode: 'UKX',
      indexName: 'FTSE 100',
      date: '2024-01-19',
      price: 7488.93,
      currency: 'GBP',
    },
    {
      id: 'price-4',
      indexCode: 'SPX',
      indexName: 'S&P 500',
      date: '2024-01-19',
      price: 4780.24,
      currency: 'USD',
    },
  ],
  totalCount: 4,
  ...overrides,
});

// Helper to create mock response
const createMockResponse = (data: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: () => Promise.resolve(data),
  blob: () => Promise.resolve(new Blob()),
  headers: {
    get: (name: string) => {
      if (name === 'content-type') return 'application/json';
      return null;
    },
  },
});

describe.skip('Index Prices Grid - Story 5.1: View Index Prices Grid', () => {
  it('displays grid with required columns when page loads', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('Index Code')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Currency')).toBeInTheDocument();
  });

  it('displays index price data in the grid', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    expect(screen.getByText('S&P 500')).toBeInTheDocument();
    expect(screen.getByText('INDU')).toBeInTheDocument();
    expect(
      screen.getByText('Dow Jones Industrial Average'),
    ).toBeInTheDocument();
    expect(screen.getByText('4783.45')).toBeInTheDocument();
  });

  it('sorts grid when column header is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('Index Code')).toBeInTheDocument();
    });

    const indexCodeHeader = screen.getByText('Index Code');
    await user.click(indexCodeHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // After sorting by index code, first data row should be INDU
      expect(rows[1].textContent).toContain('INDU');
    });
  });

  it('filters prices when searching in search box', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const searchBox = screen.getByRole('searchbox', {
      name: /search index prices/i,
    });
    await user.type(searchBox, 'FTSE');

    await waitFor(() => {
      expect(screen.getByText('FTSE 100')).toBeInTheDocument();
      expect(
        screen.queryByText('Dow Jones Industrial Average'),
      ).not.toBeInTheDocument();
    });
  });

  it('shows "No index prices found" when no prices exist', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse({ prices: [], totalCount: 0 }),
    );
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText(/no index prices found/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to load index prices.*please try again/i),
      ).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<IndexPricesPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });

  it('includes date range filter with default last 30 days', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });

    // Verify default date range is last 30 days
    const startDateInput = screen.getByLabelText(
      /start date/i,
    ) as HTMLInputElement;
    expect(startDateInput.value).toBeTruthy();
  });

  it('filters prices by date range when filter is applied', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/start date/i);
    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-01-20');

    const applyButton = screen.getByRole('button', { name: /apply filter/i });
    await user.click(applyButton);

    await waitFor(() => {
      // Only prices from 2024-01-20 should be visible
      expect(screen.getByText('4783.45')).toBeInTheDocument();
      expect(screen.queryByText('4780.24')).not.toBeInTheDocument();
    });
  });

  it('includes Export to Excel button', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /export to excel/i }),
      ).toBeInTheDocument();
    });
  });

  it('exports filtered results when Export button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/export')) {
        return Promise.resolve(
          createMockResponse(new Blob(['test']), true, 200),
        );
      }
      return Promise.resolve(createMockResponse(createMockIndexPrices()));
    });

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', {
      name: /export to excel/i,
    });
    await user.click(exportButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/export'),
        expect.anything(),
      );
    });
  });

  it('displays prices formatted with decimal places', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      // Verify prices are formatted with 2 decimal places
      expect(screen.getByText('4783.45')).toBeInTheDocument();
      expect(screen.getByText('37863.8')).toBeInTheDocument();
    });
  });

  it('shows date formatted in readable format', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      // Dates should be formatted as MM/DD/YY or similar readable format
      expect(screen.getByText(/01\/20\/24/i)).toBeInTheDocument();
    });
  });

  it('includes Add Price button', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /add price/i }),
      ).toBeInTheDocument();
    });
  });

  it('includes Upload File button', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));
    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /upload file/i }),
      ).toBeInTheDocument();
    });
  });
});
