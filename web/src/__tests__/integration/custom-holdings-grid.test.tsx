/**
 * Integration Test: Custom Holdings Grid (Stories 6.1, 6.7)
 *
 * Tests the Custom Holdings Grid functionality including:
 * - Grid rendering with all columns
 * - Search by portfolio
 * - Row click to view details
 * - Portfolio filter functionality
 * - Filter persistence
 * - Loading and error states
 * - Empty state handling
 *
 * NOTE: Tests use describe.skip() because components don't exist yet (TDD red phase)
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
import { CustomHoldingsGrid } from '@/components/CustomHoldingsGrid';

// Store original fetch
const originalFetch = global.fetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock data factory
const createMockHolding = (overrides: Record<string, unknown> = {}) => ({
  id: 'holding-001',
  portfolioCode: 'PORT-A',
  portfolioName: 'Portfolio A',
  isin: 'US0378331005',
  instrumentDescription: 'Apple Inc. Common Stock',
  amount: 1000,
  currency: 'USD',
  effectiveDate: '2024-01-15',
  ...overrides,
});

const createMockHoldingsList = (count: number) => {
  const portfolios = ['PORT-A', 'PORT-B', 'PORT-C'];
  const isins = ['US0378331005', 'US5949181045', 'US02079K1079'];
  const descriptions = [
    'Apple Inc. Common Stock',
    'Microsoft Corp. Common Stock',
    'Alphabet Inc. Class A',
  ];
  const currencies = ['USD', 'EUR', 'GBP'];

  return Array.from({ length: count }, (_, i) => ({
    id: `holding-${String(i + 1).padStart(3, '0')}`,
    portfolioCode: portfolios[i % 3],
    portfolioName: `Portfolio ${portfolios[i % 3]}`,
    isin: isins[i % 3],
    instrumentDescription: descriptions[i % 3],
    amount: (i + 1) * 100,
    currency: currencies[i % 3],
    effectiveDate: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
  }));
};

// Helper to create a mock response
const createMockResponse = (data: unknown[], total: number) => ({
  ok: true,
  status: 200,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => ({ data, total }),
});

// Mock portfolio list for filter dropdown
const createMockPortfolios = () => [
  { code: 'PORT-A', name: 'Portfolio A' },
  { code: 'PORT-B', name: 'Portfolio B' },
  { code: 'PORT-C', name: 'Portfolio C' },
];

describe.skip('Custom Holdings Grid - Story 6.1: View Custom Holdings Grid', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays grid with all columns when page loads', async () => {
      // Arrange
      const mockHoldings = createMockHoldingsList(5);
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockHoldings, 5),
      );

      // Act
      render(<CustomHoldingsGrid />);

      // Assert - wait for data to load
      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Verify all columns are present
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('ISIN')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Currency')).toBeInTheDocument();
      expect(screen.getByText('Effective Date')).toBeInTheDocument();
    });

    it('displays holding data in correct format', async () => {
      // Arrange
      const mockHolding = createMockHolding({
        portfolioCode: 'PORT-A',
        isin: 'US0378331005',
        instrumentDescription: 'Apple Inc. Common Stock',
        amount: 1500,
        currency: 'USD',
        effectiveDate: '2024-01-15',
      });

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse([mockHolding], 1),
      );

      // Act
      render(<CustomHoldingsGrid />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('PORT-A')).toBeInTheDocument();
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
        expect(screen.getByText('Apple Inc. Common Stock')).toBeInTheDocument();
        expect(screen.getByText('1,500')).toBeInTheDocument();
        expect(screen.getByText('USD')).toBeInTheDocument();
        expect(screen.getByText('01/15/2024')).toBeInTheDocument();
      });
    });

    it('navigates to details when row is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockHoldings = createMockHoldingsList(3);
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockHoldings, 3),
      );

      render(<CustomHoldingsGrid />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act - click on first row
      const firstRow = screen.getByText('US0378331005').closest('tr');
      await user.click(firstRow!);

      // Assert - should show detail view
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /holding details/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters holdings when searching by portfolio code', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockHoldings = createMockHoldingsList(10);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 10))
        .mockResolvedValueOnce(
          createMockResponse(
            mockHoldings.filter((h) => h.portfolioCode === 'PORT-A'),
            3,
          ),
        );

      render(<CustomHoldingsGrid />);

      await waitFor(() => {
        expect(screen.getByText('PORT-A')).toBeInTheDocument();
      });

      // Act
      const searchInput = screen.getByRole('searchbox', {
        name: /search by portfolio/i,
      });
      await user.type(searchInput, 'PORT-A');

      // Assert - wait for debounced search
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('search=PORT-A'),
            expect.anything(),
          );
        },
        { timeout: 500 },
      );
    });

    it('filters holdings when searching by ISIN', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockHoldings = createMockHoldingsList(5);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 5))
        .mockResolvedValueOnce(
          createMockResponse(
            mockHoldings.filter((h) => h.isin.includes('US037833')),
            1,
          ),
        );

      render(<CustomHoldingsGrid />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const searchInput = screen.getByRole('searchbox', {
        name: /search by portfolio/i,
      });
      await user.type(searchInput, 'US037833');

      // Assert
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('search=US037833'),
            expect.anything(),
          );
        },
        { timeout: 500 },
      );
    });

    it('shows no results message when search returns empty', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockHoldings = createMockHoldingsList(5);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 5))
        .mockResolvedValueOnce(createMockResponse([], 0));

      render(<CustomHoldingsGrid />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const searchInput = screen.getByRole('searchbox', {
        name: /search by portfolio/i,
      });
      await user.type(searchInput, 'NONEXISTENT');

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no custom holdings found/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty state when no holdings exist', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValueOnce(createMockResponse([], 0));

      // Act
      render(<CustomHoldingsGrid />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no custom holdings found/i),
        ).toBeInTheDocument();
      });
    });

    it('displays pagination controls for large datasets', async () => {
      // Arrange
      const mockHoldings = createMockHoldingsList(50);
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockHoldings.slice(0, 10), 50),
      );

      // Act
      render(<CustomHoldingsGrid />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error state when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch'),
      );

      // Act
      render(<CustomHoldingsGrid />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load custom holdings/i),
        ).toBeInTheDocument();
      });
    });

    it('shows API error message when server returns error', async () => {
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
      render(<CustomHoldingsGrid />);

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
      // Arrange - mock that never resolves
      (global.fetch as Mock).mockImplementationOnce(
        () => new Promise(() => {}),
      );

      // Act
      render(<CustomHoldingsGrid />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading holdings\.\.\./i)).toBeInTheDocument();
    });
  });
});

describe.skip('Custom Holdings Grid - Story 6.7: Filter by Portfolio', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Portfolio Filter', () => {
    it('displays portfolio dropdown filter', async () => {
      // Arrange
      const mockHoldings = createMockHoldingsList(5);
      const mockPortfolios = createMockPortfolios();

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 5))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockPortfolios,
        });

      // Act
      render(<CustomHoldingsGrid />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /filter by portfolio/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('All Portfolios')).toBeInTheDocument();
    });

    it('filters holdings when portfolio is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockHoldings = createMockHoldingsList(10);
      const mockPortfolios = createMockPortfolios();

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 10))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockPortfolios,
        })
        .mockResolvedValueOnce(
          createMockResponse(
            mockHoldings.filter((h) => h.portfolioCode === 'PORT-A'),
            4,
          ),
        );

      render(<CustomHoldingsGrid />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const portfolioFilter = screen.getByRole('combobox', {
        name: /filter by portfolio/i,
      });
      await user.selectOptions(portfolioFilter, 'PORT-A');

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('portfolio=PORT-A'),
          expect.anything(),
        );
      });
    });

    it('shows all holdings when "All Portfolios" is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockHoldings = createMockHoldingsList(10);
      const mockPortfolios = createMockPortfolios();

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 10))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockPortfolios,
        })
        .mockResolvedValueOnce(
          createMockResponse(
            mockHoldings.filter((h) => h.portfolioCode === 'PORT-A'),
            4,
          ),
        )
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 10));

      render(<CustomHoldingsGrid />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Filter to PORT-A first
      const portfolioFilter = screen.getByRole('combobox', {
        name: /filter by portfolio/i,
      });
      await user.selectOptions(portfolioFilter, 'PORT-A');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('portfolio=PORT-A'),
          expect.anything(),
        );
      });

      // Act - select "All Portfolios"
      await user.selectOptions(portfolioFilter, '');

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
          expect.not.stringContaining('portfolio='),
          expect.anything(),
        );
      });
    });

    it('shows empty state for portfolio with no holdings', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockHoldings = createMockHoldingsList(10);
      const mockPortfolios = createMockPortfolios();

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 10))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockPortfolios,
        })
        .mockResolvedValueOnce(createMockResponse([], 0));

      render(<CustomHoldingsGrid />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const portfolioFilter = screen.getByRole('combobox', {
        name: /filter by portfolio/i,
      });
      await user.selectOptions(portfolioFilter, 'PORT-C');

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no holdings found for this portfolio/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error when portfolio list fails to load', async () => {
      // Arrange
      const mockHoldings = createMockHoldingsList(5);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 5))
        .mockRejectedValueOnce(new Error('Failed to fetch portfolios'));

      // Act
      render(<CustomHoldingsGrid />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load portfolios/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Filter Persistence', () => {
    it('persists selected portfolio in localStorage', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockHoldings = createMockHoldingsList(10);
      const mockPortfolios = createMockPortfolios();

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 10))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockPortfolios,
        })
        .mockResolvedValueOnce(
          createMockResponse(
            mockHoldings.filter((h) => h.portfolioCode === 'PORT-B'),
            3,
          ),
        );

      render(<CustomHoldingsGrid />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const portfolioFilter = screen.getByRole('combobox', {
        name: /filter by portfolio/i,
      });
      await user.selectOptions(portfolioFilter, 'PORT-B');

      // Assert
      await waitFor(() => {
        expect(localStorageMock.getItem('customHoldings.portfolioFilter')).toBe(
          'PORT-B',
        );
      });
    });

    it('restores portfolio filter from localStorage on page load', async () => {
      // Arrange
      localStorageMock.setItem('customHoldings.portfolioFilter', 'PORT-A');

      const mockHoldings = createMockHoldingsList(10);
      const mockPortfolios = createMockPortfolios();

      (global.fetch as Mock)
        .mockResolvedValueOnce(
          createMockResponse(
            mockHoldings.filter((h) => h.portfolioCode === 'PORT-A'),
            4,
          ),
        )
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockPortfolios,
        });

      // Act
      render(<CustomHoldingsGrid />);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('portfolio=PORT-A'),
          expect.anything(),
        );
      });

      const portfolioFilter = screen.getByRole('combobox', {
        name: /filter by portfolio/i,
      }) as HTMLSelectElement;
      expect(portfolioFilter.value).toBe('PORT-A');
    });

    it('clears localStorage when "All Portfolios" is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      localStorageMock.setItem('customHoldings.portfolioFilter', 'PORT-A');

      const mockHoldings = createMockHoldingsList(10);
      const mockPortfolios = createMockPortfolios();

      (global.fetch as Mock)
        .mockResolvedValueOnce(
          createMockResponse(
            mockHoldings.filter((h) => h.portfolioCode === 'PORT-A'),
            4,
          ),
        )
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockPortfolios,
        })
        .mockResolvedValueOnce(createMockResponse(mockHoldings, 10));

      render(<CustomHoldingsGrid />);

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /filter by portfolio/i }),
        ).toBeInTheDocument();
      });

      // Act
      const portfolioFilter = screen.getByRole('combobox', {
        name: /filter by portfolio/i,
      });
      await user.selectOptions(portfolioFilter, '');

      // Assert
      await waitFor(() => {
        expect(
          localStorageMock.getItem('customHoldings.portfolioFilter'),
        ).toBeNull();
      });
    });
  });
});
