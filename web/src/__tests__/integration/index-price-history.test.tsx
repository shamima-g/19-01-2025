/**
 * Integration Test: Index Price History and Popup (Epic 5)
 *
 * Tests for Epic 5: Market Data Maintenance
 * Stories covered: 5.5 (View Price History), 5.6 (View Price Popup)
 *
 * Test Strategy:
 * - Test price history display and filtering
 * - Test popup modal behavior
 * - Mock only the HTTP client (test real components)
 * - Use accessibility-first queries
 * - Verify user sees correct data and interactions
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import IndexPriceHistoryPage from '@/app/index-prices/[indexCode]/history/page';
import IndexPricesPage from '@/app/index-prices/page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  useParams: () => ({ indexCode: 'SPX' }),
  usePathname: () => '/index-prices/SPX/history',
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

// Test data for price history
const createMockPriceHistory = () => ({
  history: [
    {
      id: 'hist-1',
      indexCode: 'SPX',
      indexName: 'S&P 500',
      date: '2024-01-20',
      price: 4783.45,
      changePercent: 0.15,
      user: 'jane.doe',
    },
    {
      id: 'hist-2',
      indexCode: 'SPX',
      indexName: 'S&P 500',
      date: '2024-01-19',
      price: 4776.32,
      changePercent: -0.23,
      user: 'john.smith',
    },
    {
      id: 'hist-3',
      indexCode: 'SPX',
      indexName: 'S&P 500',
      date: '2024-01-18',
      price: 4787.43,
      changePercent: 0.45,
      user: 'jane.doe',
    },
  ],
  totalCount: 3,
});

describe.skip('Index Price History - Story 5.5: View Price History', () => {
  it('displays all prices sorted by date descending when History is opened', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockPriceHistory()));

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('01/20/24')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('01/20/24')).toBeInTheDocument();
    expect(within(rows[2]).getByText('01/19/24')).toBeInTheDocument();
  });

  it('displays required fields in history list', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockPriceHistory()));

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Change %')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    expect(screen.getByText('4783.45')).toBeInTheDocument();
    expect(screen.getByText('jane.doe')).toBeInTheDocument();
  });

  it('displays change percentage for each price', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockPriceHistory()));

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('+0.15%')).toBeInTheDocument();
      expect(screen.getByText('-0.23%')).toBeInTheDocument();
      expect(screen.getByText('+0.45%')).toBeInTheDocument();
    });
  });

  it('includes date range filter for history', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockPriceHistory()));

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });
  });

  it('filters prices by date range when filter is applied', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockPriceHistory()));

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/start date/i);
    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-01-19');

    const endDateInput = screen.getByLabelText(/end date/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2024-01-20');

    const applyButton = screen.getByRole('button', { name: /apply filter/i });
    await user.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('01/20/24')).toBeInTheDocument();
      expect(screen.getByText('01/19/24')).toBeInTheDocument();
      expect(screen.queryByText('01/18/24')).not.toBeInTheDocument();
    });
  });

  it('shows "No historical data" when index has no history', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse({ history: [], totalCount: 0 }),
    );

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/no historical data/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to load history'));

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load history/i)).toBeInTheDocument();
    });
  });

  it('includes chart visualization for price history', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockPriceHistory()));

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      // Chart should render as img role with accessible label
      expect(
        screen.getByRole('img', { name: /price history chart/i }),
      ).toBeInTheDocument();
    });
  });

  it('includes Export to Excel button', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockPriceHistory()));

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /export to excel/i }),
      ).toBeInTheDocument();
    });
  });

  it('downloads file when Export button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(createMockPriceHistory()))
      .mockResolvedValueOnce({
        ...createMockResponse(new Blob(['test'])),
        headers: {
          get: (name: string) => {
            if (name === 'content-type') return 'application/octet-stream';
            return null;
          },
        },
      });

    const mockCreateObjectURL = vi.fn(() => 'blob:test-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /export to excel/i }),
      ).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', {
      name: /export to excel/i,
    });
    await user.click(exportButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('displays index name in page title', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockPriceHistory()));

    render(<IndexPriceHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/s&p 500.*history/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching history', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<IndexPriceHistoryPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });
});

describe.skip('Index Price Popup - Story 5.6: View Price Popup', () => {
  const createMockIndexPrices = () => ({
    prices: [
      {
        id: 'price-1',
        indexCode: 'SPX',
        indexName: 'S&P 500',
        date: '2024-01-20',
        price: 4783.45,
        currency: 'USD',
        previousPrice: 4776.32,
        changePercent: 0.15,
      },
      {
        id: 'price-2',
        indexCode: 'INDU',
        indexName: 'Dow Jones Industrial Average',
        date: '2024-01-20',
        price: 37863.8,
        currency: 'USD',
        previousPrice: 37845.2,
        changePercent: 0.05,
      },
    ],
    totalCount: 2,
  });

  it('opens popup when clicking on an index row', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('displays required fields in popup', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');

      expect(within(dialog).getByText(/spx/i)).toBeInTheDocument();
      expect(within(dialog).getByText('S&P 500')).toBeInTheDocument();
      expect(within(dialog).getByText('4783.45')).toBeInTheDocument();
      expect(within(dialog).getByText('4776.32')).toBeInTheDocument();
      expect(within(dialog).getByText('+0.15%')).toBeInTheDocument();
    });
  });

  it('displays current price in popup', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/current price/i)).toBeInTheDocument();
      expect(within(dialog).getByText('4783.45')).toBeInTheDocument();
    });
  });

  it('displays previous price in popup', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/previous price/i)).toBeInTheDocument();
      expect(within(dialog).getByText('4776.32')).toBeInTheDocument();
    });
  });

  it('displays change percentage in popup', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/change/i)).toBeInTheDocument();
      expect(within(dialog).getByText('+0.15%')).toBeInTheDocument();
    });
  });

  it('includes View History button in popup', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByRole('button', { name: /view history/i }),
      ).toBeInTheDocument();
    });
  });

  it('navigates to history page when View History is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    const viewHistoryButton = within(screen.getByRole('dialog')).getByRole(
      'button',
      { name: /view history/i },
    );
    await user.click(viewHistoryButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/index-prices/SPX/history');
    });
  });

  it('closes popup when clicking outside', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows error message when popup fails to load details', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(createMockIndexPrices()))
      .mockRejectedValueOnce(new Error('Failed to load details'));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      expect(screen.getByText(/failed to load details/i)).toBeInTheDocument();
    });
  });

  it('includes Edit button if user has permissions', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockIndexPrices()));

    render(<IndexPricesPage />);

    await waitFor(() => {
      expect(screen.getByText('SPX')).toBeInTheDocument();
    });

    const row = screen.getByText('SPX').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByRole('button', { name: /edit/i }),
      ).toBeInTheDocument();
    });
  });
});
