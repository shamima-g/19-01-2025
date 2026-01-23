/**
 * Integration Test: Market Data Maintenance (Epic 5: Stories 5.1 - 5.12)
 *
 * Tests the Market Data Maintenance functionality including:
 *
 * INDEX PRICES (Stories 5.1-5.6):
 * - View index prices grid with search and sort (Story 5.1)
 * - Add index price (Story 5.2)
 * - Update index price (Story 5.3)
 * - Upload index prices file (Story 5.4)
 * - View price history (Story 5.5)
 * - View price popup (Story 5.6)
 *
 * DURATIONS (Stories 5.7-5.9):
 * - View instrument durations grid (Story 5.7)
 * - Add duration (Story 5.8)
 * - Update duration (Story 5.9)
 *
 * BETAS (Stories 5.10-5.12):
 * - View instrument betas grid (Story 5.10)
 * - Add beta (Story 5.11)
 * - Update beta (Story 5.12)
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
import { IndexPricesPage } from '@/app/market-data/index-prices/page';
import { DurationsPage } from '@/app/market-data/durations/page';
import { BetasPage } from '@/app/market-data/betas/page';
import { IndexPriceForm } from '@/components/IndexPriceForm';
import { IndexPriceHistory } from '@/components/IndexPriceHistory';
import { IndexPricePopup } from '@/components/IndexPricePopup';
import { DurationForm } from '@/components/DurationForm';
import { BetaForm } from '@/components/BetaForm';

// Store original fetch
const originalFetch = global.fetch;

// Mock the toast context
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock data factories - Index Prices
const createMockIndexPrice = (overrides: Record<string, unknown> = {}) => ({
  id: 'price-001',
  indexCode: 'S&P500',
  indexName: 'S&P 500 Index',
  date: '2024-01-15',
  price: 4780.24,
  currency: 'USD',
  changePercent: 0.85,
  user: 'john.doe',
  ...overrides,
});

const createMockIndexPricesList = (count: number) => {
  const indices = ['S&P500', 'NASDAQ', 'DOW', 'FTSE100', 'DAX'];
  const names = [
    'S&P 500 Index',
    'NASDAQ Composite',
    'Dow Jones Industrial Average',
    'FTSE 100 Index',
    'DAX Index',
  ];
  const currencies = ['USD', 'USD', 'USD', 'GBP', 'EUR'];

  return Array.from({ length: count }, (_, i) => ({
    id: `price-${String(i + 1).padStart(3, '0')}`,
    indexCode: indices[i % indices.length],
    indexName: names[i % names.length],
    date: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
    price: 4000 + i * 50,
    currency: currencies[i % currencies.length],
    changePercent: ((i % 5) - 2) * 0.5,
    user: `user${i % 3}`,
  }));
};

// Mock data factories - Durations
const createMockDuration = (overrides: Record<string, unknown> = {}) => ({
  id: 'duration-001',
  isin: 'US0378331005',
  instrumentName: 'Apple Inc. Common Stock',
  duration: 5.25,
  ytm: 3.45,
  effectiveDate: '2024-01-15',
  user: 'jane.smith',
  ...overrides,
});

const createMockDurationsList = (count: number) => {
  const isins = [
    'US0378331005',
    'US5949181045',
    'US02079K1079',
    'GB0002374006',
    'DE0005140008',
  ];
  const names = [
    'Apple Inc. Common Stock',
    'Microsoft Corp. Common Stock',
    'Alphabet Inc. Class A',
    'BP PLC Ordinary Shares',
    'Deutsche Bank AG',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `duration-${String(i + 1).padStart(3, '0')}`,
    isin: isins[i % isins.length],
    instrumentName: names[i % names.length],
    duration: 3.0 + i * 0.5,
    ytm: 2.0 + i * 0.25,
    effectiveDate: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
    user: `user${i % 3}`,
  }));
};

// Mock data factories - Betas
const createMockBeta = (overrides: Record<string, unknown> = {}) => ({
  id: 'beta-001',
  isin: 'US0378331005',
  instrumentName: 'Apple Inc. Common Stock',
  beta: 1.25,
  benchmark: 'S&P500',
  effectiveDate: '2024-01-15',
  user: 'john.doe',
  ...overrides,
});

const createMockBetasList = (count: number) => {
  const isins = [
    'US0378331005',
    'US5949181045',
    'US02079K1079',
    'GB0002374006',
    'DE0005140008',
  ];
  const names = [
    'Apple Inc. Common Stock',
    'Microsoft Corp. Common Stock',
    'Alphabet Inc. Class A',
    'BP PLC Ordinary Shares',
    'Deutsche Bank AG',
  ];
  const benchmarks = ['S&P500', 'NASDAQ', 'DOW', 'FTSE100', 'DAX'];

  return Array.from({ length: count }, (_, i) => ({
    id: `beta-${String(i + 1).padStart(3, '0')}`,
    isin: isins[i % isins.length],
    instrumentName: names[i % names.length],
    beta: 0.5 + i * 0.1,
    benchmark: benchmarks[i % benchmarks.length],
    effectiveDate: `2024-01-${String((i % 28) + 1).padStart(2, '0')}`,
    user: `user${i % 3}`,
  }));
};

// Helper to create a mock response
const createMockResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => data,
});

// Helper to setup fetch mock for list endpoints
const setupFetchMock = (response: unknown[], total: number) => {
  (global.fetch as Mock).mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => ({ data: response, total }),
  });
};

// ============================================================================
// INDEX PRICES - Story 5.1: View Index Prices Grid
// ============================================================================

describe.skip('Market Data - Story 5.1: View Index Prices Grid', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays grid with Index Code, Name, Date, Price, Currency columns', async () => {
      // Arrange
      const mockPrices = createMockIndexPricesList(5);
      setupFetchMock(mockPrices, 5);

      // Act
      render(<IndexPricesPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('S&P500')).toBeInTheDocument();
      });

      expect(screen.getByText('Index Code')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Currency')).toBeInTheDocument();
    });

    it('sorts grid when column header is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockPrices = createMockIndexPricesList(5);
      setupFetchMock(mockPrices, 5);

      render(<IndexPricesPage />);

      await waitFor(() => {
        expect(screen.getByText('S&P500')).toBeInTheDocument();
      });

      // Act
      const dateHeader = screen.getByText('Date');
      await user.click(dateHeader);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('sort=date'),
          expect.anything(),
        );
      });
    });

    it('filters grid when typing in search box', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockPrices = createMockIndexPricesList(10);
      setupFetchMock(mockPrices, 10);

      render(<IndexPricesPage />);

      await waitFor(() => {
        expect(screen.getByText('S&P500')).toBeInTheDocument();
      });

      // Act
      const searchInput = screen.getByRole('searchbox', { name: /search/i });
      await user.type(searchInput, 'S&P500');

      // Assert
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('search=S&P500'),
            expect.anything(),
          );
        },
        { timeout: 500 },
      );
    });
  });

  describe('Edge Cases', () => {
    it('shows empty message when no prices exist', async () => {
      // Arrange
      setupFetchMock([], 0);

      // Act
      render(<IndexPricesPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no index prices found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValue(
        new TypeError('Failed to fetch'),
      );

      // Act
      render(<IndexPricesPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load index prices\. please try again\./i),
        ).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// INDEX PRICES - Story 5.2: Add Index Price
// ============================================================================

describe.skip('Market Data - Story 5.2: Add Index Price', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays form with Index Code, Date, Price, Currency fields', async () => {
      // Act
      render(<IndexPriceForm mode="add" onSuccess={vi.fn()} />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /add price/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/index code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
    });

    it('shows success message when price is added', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(
          {
            id: 'price-001',
            indexCode: 'S&P500',
            date: '2024-01-15',
            price: 4780.24,
            currency: 'USD',
          },
          201,
        ),
      );

      render(<IndexPriceForm mode="add" onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/index code/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(screen.getByLabelText(/index code/i), 'S&P500');
      await user.type(screen.getByLabelText(/date/i), '2024-01-15');
      await user.type(screen.getByLabelText(/price/i), '4780.24');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(screen.getByText(/price added successfully/i)).toBeInTheDocument();
    });

    it('records username in audit trail', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({ id: 'price-001' }, 201),
      );

      render(<IndexPriceForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/index code/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(screen.getByLabelText(/index code/i), 'S&P500');
      await user.type(screen.getByLabelText(/date/i), '2024-01-15');
      await user.type(screen.getByLabelText(/price/i), '4780.24');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[0];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows error when duplicate Index + Date exists', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          Messages: ['Price already exists for this date'],
        }),
      });

      render(<IndexPriceForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/index code/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(screen.getByLabelText(/index code/i), 'S&P500');
      await user.type(screen.getByLabelText(/date/i), '2024-01-15');
      await user.type(screen.getByLabelText(/price/i), '4780.24');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/price already exists for this date/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows validation errors when required fields are empty', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<IndexPriceForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/index code/i)).toBeInTheDocument();
      });

      // Act - submit without filling fields
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/index code is required/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// INDEX PRICES - Story 5.3: Update Index Price
// ============================================================================

describe.skip('Market Data - Story 5.3: Update Index Price', () => {
  const mockPrice = {
    id: 'price-001',
    indexCode: 'S&P500',
    indexName: 'S&P 500 Index',
    date: '2024-01-15',
    price: 4780.24,
    currency: 'USD',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays form pre-filled with current values', async () => {
      // Act
      render(
        <IndexPriceForm
          mode="edit"
          priceId="price-001"
          initialData={mockPrice}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /edit price/i }),
        ).toBeInTheDocument();
      });

      const indexCodeInput = screen.getByLabelText(
        /index code/i,
      ) as HTMLInputElement;
      expect(indexCodeInput.value).toBe('S&P500');
      expect(indexCodeInput).toBeDisabled();

      const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
      expect(dateInput.value).toBe('2024-01-15');
      expect(dateInput).toBeDisabled();

      const priceInput = screen.getByLabelText(/price/i) as HTMLInputElement;
      expect(priceInput.value).toBe('4780.24');
    });

    it('shows success message when price is updated', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({
          ...mockPrice,
          price: 4800.5,
        }),
      );

      render(
        <IndexPriceForm
          mode="edit"
          priceId="price-001"
          initialData={mockPrice}
          onSuccess={mockOnSuccess}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      });

      // Act
      const priceInput = screen.getByLabelText(/price/i);
      await user.clear(priceInput);
      await user.type(priceInput, '4800.50');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(
        screen.getByText(/price updated successfully/i),
      ).toBeInTheDocument();
    });

    it('records change in audit trail', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(createMockResponse(mockPrice));

      render(
        <IndexPriceForm
          mode="edit"
          priceId="price-001"
          initialData={mockPrice}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      });

      // Act
      const priceInput = screen.getByLabelText(/price/i);
      await user.clear(priceInput);
      await user.type(priceInput, '4800.50');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[0];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      render(
        <IndexPriceForm
          mode="edit"
          priceId="price-001"
          initialData={mockPrice}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      });

      // Act
      const priceInput = screen.getByLabelText(/price/i);
      await user.clear(priceInput);
      await user.type(priceInput, '4800.50');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to update\. please try again\./i),
        ).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// INDEX PRICES - Story 5.4: Upload Index Prices File
// ============================================================================

describe.skip('Market Data - Story 5.4: Upload Index Prices File', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays file name when valid file is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'index-prices.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      render(<IndexPricesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /upload file/i }),
        ).toBeInTheDocument();
      });

      // Act
      const uploadButton = screen.getByRole('button', { name: /upload file/i });
      await user.click(uploadButton);

      const fileInput = screen.getByLabelText(/select file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('index-prices.xlsx')).toBeInTheDocument();
      });
    });

    it('shows success summary when upload completes', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'index-prices.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({
          added: 25,
          updated: 10,
          errors: [],
        }),
      );

      render(<IndexPricesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /upload file/i }),
        ).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload file/i });
      await user.click(uploadButton);

      const fileInput = screen.getByLabelText(/select file/i);
      await user.upload(fileInput, file);

      // Act
      const submitButton = screen.getByRole('button', { name: /upload/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/25 prices added, 10 updated/i),
        ).toBeInTheDocument();
      });
    });

    it('refreshes grid after successful upload', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'index-prices.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const mockPrices = createMockIndexPricesList(5);

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: mockPrices, total: 5 }),
        })
        .mockResolvedValueOnce(
          createMockResponse({
            added: 25,
            updated: 10,
            errors: [],
          }),
        )
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            data: createMockIndexPricesList(40),
            total: 40,
          }),
        });

      render(<IndexPricesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /upload file/i }),
        ).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload file/i });
      await user.click(uploadButton);

      const fileInput = screen.getByLabelText(/select file/i);
      await user.upload(fileInput, file);

      // Act
      const submitButton = screen.getByRole('button', { name: /upload/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows error list when file has invalid prices', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'index-prices.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({
          added: 20,
          updated: 5,
          errors: [
            { row: 8, reason: 'Negative price value' },
            { row: 15, reason: 'Invalid currency code' },
          ],
        }),
      );

      render(<IndexPricesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /upload file/i }),
        ).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload file/i });
      await user.click(uploadButton);

      const fileInput = screen.getByLabelText(/select file/i);
      await user.upload(fileInput, file);

      // Act
      const submitButton = screen.getByRole('button', { name: /upload/i });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/row 8.*negative price value/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/row 15.*invalid currency code/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error for invalid file format', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'document.pdf', {
        type: 'application/pdf',
      });

      render(<IndexPricesPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /upload file/i }),
        ).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload file/i });
      await user.click(uploadButton);

      // Act
      const fileInput = screen.getByLabelText(/select file/i);
      await user.upload(fileInput, file);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid file format/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// INDEX PRICES - Story 5.5: View Index Price History
// ============================================================================

describe.skip('Market Data - Story 5.5: View Index Price History', () => {
  const mockHistory = [
    {
      id: 'price-001',
      date: '2024-01-15',
      price: 4780.24,
      changePercent: 0.85,
      user: 'john.doe',
    },
    {
      id: 'price-002',
      date: '2024-01-10',
      price: 4740.1,
      changePercent: -0.42,
      user: 'jane.smith',
    },
  ];

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays all prices sorted by date descending', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue(createMockResponse(mockHistory));

      // Act
      render(<IndexPriceHistory indexCode="S&P500" />);

      // Assert
      await waitFor(() => {
        const dates = screen.getAllByText(/01\/\d{2}\/2024/);
        expect(dates[0]).toHaveTextContent('01/15/2024');
        expect(dates[1]).toHaveTextContent('01/10/2024');
      });
    });

    it('shows Date, Price, Change %, User columns', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue(createMockResponse(mockHistory));

      // Act
      render(<IndexPriceHistory indexCode="S&P500" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('01/15/2024')).toBeInTheDocument();
      });

      expect(screen.getByText('4,780.24')).toBeInTheDocument();
      expect(screen.getByText('+0.85%')).toBeInTheDocument();
      expect(screen.getByText('john.doe')).toBeInTheDocument();
    });

    it('filters by date range when applied', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(createMockResponse(mockHistory));

      render(<IndexPriceHistory indexCode="S&P500" />);

      await waitFor(() => {
        expect(screen.getByText('01/15/2024')).toBeInTheDocument();
      });

      // Act
      const startDate = screen.getByLabelText(/start date/i);
      await user.type(startDate, '2024-01-01');

      const endDate = screen.getByLabelText(/end date/i);
      await user.type(endDate, '2024-01-15');

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('startDate=2024-01-01'),
          expect.anything(),
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('endDate=2024-01-15'),
          expect.anything(),
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty message when index has no history', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue(createMockResponse([]));

      // Act
      render(<IndexPriceHistory indexCode="NEWINDEX" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no historical data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      // Act
      render(<IndexPriceHistory indexCode="S&P500" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to load history/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// INDEX PRICES - Story 5.6: View Price Popup
// ============================================================================

describe.skip('Market Data - Story 5.6: View Price Popup', () => {
  const mockPriceDetail = {
    id: 'price-001',
    indexCode: 'S&P500',
    indexName: 'S&P 500 Index',
    currentPrice: 4780.24,
    previousPrice: 4740.1,
    changePercent: 0.85,
    date: '2024-01-15',
    currency: 'USD',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays Index Code, Name, Current Price, Previous Price, Change %', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockPriceDetail),
      );

      render(<IndexPricePopup priceId="price-001" />);

      // Act
      const infoButton = screen.getByRole('button', { name: /info/i });
      await user.click(infoButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('S&P500')).toBeInTheDocument();
        expect(screen.getByText('S&P 500 Index')).toBeInTheDocument();
        expect(screen.getByText('4,780.24')).toBeInTheDocument();
        expect(screen.getByText('4,740.10')).toBeInTheDocument();
        expect(screen.getByText('+0.85%')).toBeInTheDocument();
      });
    });

    it('navigates to history page when View History is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockPriceDetail),
      );

      render(<IndexPricePopup priceId="price-001" />);

      const infoButton = screen.getByRole('button', { name: /info/i });
      await user.click(infoButton);

      await waitFor(() => {
        expect(screen.getByText('S&P500')).toBeInTheDocument();
      });

      // Act
      const viewHistoryButton = screen.getByRole('button', {
        name: /view history/i,
      });
      await user.click(viewHistoryButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /price history/i }),
        ).toBeInTheDocument();
      });
    });

    it('closes popup when clicking outside', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockPriceDetail),
      );

      render(<IndexPricePopup priceId="price-001" />);

      const infoButton = screen.getByRole('button', { name: /info/i });
      await user.click(infoButton);

      await waitFor(() => {
        expect(screen.getByText('S&P500')).toBeInTheDocument();
      });

      // Act
      const backdrop = screen.getByTestId('popup-backdrop');
      await user.click(backdrop);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('S&P500')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      render(<IndexPricePopup priceId="price-001" />);

      // Act
      const infoButton = screen.getByRole('button', { name: /info/i });
      await user.click(infoButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to load details/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// DURATIONS - Story 5.7: View Instrument Durations Grid
// ============================================================================

describe.skip('Market Data - Story 5.7: View Instrument Durations Grid', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays grid with ISIN, Name, Duration, YTM, Effective Date columns', async () => {
      // Arrange
      const mockDurations = createMockDurationsList(5);
      setupFetchMock(mockDurations, 5);

      // Act
      render(<DurationsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      expect(screen.getByText('ISIN')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('YTM')).toBeInTheDocument();
      expect(screen.getByText('Effective Date')).toBeInTheDocument();
    });

    it('filters by ISIN when typing in search box', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockDurations = createMockDurationsList(10);
      setupFetchMock(mockDurations, 10);

      render(<DurationsPage />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const searchInput = screen.getByRole('searchbox', {
        name: /search by isin/i,
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

    it('shows duration details when row is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockDurations = createMockDurationsList(3);
      setupFetchMock(mockDurations, 3);

      render(<DurationsPage />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const firstRow = screen.getByText('US0378331005').closest('tr');
      await user.click(firstRow!);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /duration details/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty message when no durations exist', async () => {
      // Arrange
      setupFetchMock([], 0);

      // Act
      render(<DurationsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no duration data found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValue(
        new TypeError('Failed to fetch'),
      );

      // Act
      render(<DurationsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load durations/i),
        ).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// DURATIONS - Story 5.8: Add Instrument Duration
// ============================================================================

describe.skip('Market Data - Story 5.8: Add Instrument Duration', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays form with ISIN, Effective Date, Duration, YTM fields', async () => {
      // Act
      render(<DurationForm mode="add" onSuccess={vi.fn()} />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /add duration/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/effective date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ytm/i)).toBeInTheDocument();
    });

    it('shows success message when duration is added', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(
          {
            id: 'duration-001',
            isin: 'US0378331005',
            effectiveDate: '2024-01-15',
            duration: 5.25,
            ytm: 3.45,
          },
          201,
        ),
      );

      render(<DurationForm mode="add" onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');
      await user.type(screen.getByLabelText(/duration/i), '5.25');
      await user.type(screen.getByLabelText(/ytm/i), '3.45');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(
        screen.getByText(/duration added successfully/i),
      ).toBeInTheDocument();
    });

    it('records change in audit trail', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({ id: 'duration-001' }, 201),
      );

      render(<DurationForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');
      await user.type(screen.getByLabelText(/duration/i), '5.25');
      await user.type(screen.getByLabelText(/ytm/i), '3.45');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[0];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows error when duplicate ISIN + Date exists', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          Messages: ['Duration already exists'],
        }),
      });

      render(<DurationForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');
      await user.type(screen.getByLabelText(/duration/i), '5.25');
      await user.type(screen.getByLabelText(/ytm/i), '3.45');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/duration already exists/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows validation errors when required fields are empty', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<DurationForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/isin is required/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// DURATIONS - Story 5.9: Update Instrument Duration
// ============================================================================

describe.skip('Market Data - Story 5.9: Update Instrument Duration', () => {
  const mockDuration = {
    id: 'duration-001',
    isin: 'US0378331005',
    instrumentName: 'Apple Inc. Common Stock',
    duration: 5.25,
    ytm: 3.45,
    effectiveDate: '2024-01-15',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays form pre-filled with current values', async () => {
      // Act
      render(
        <DurationForm
          mode="edit"
          durationId="duration-001"
          initialData={mockDuration}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /edit duration/i }),
        ).toBeInTheDocument();
      });

      const isinInput = screen.getByLabelText(/isin/i) as HTMLInputElement;
      expect(isinInput.value).toBe('US0378331005');
      expect(isinInput).toBeDisabled();

      const dateInput = screen.getByLabelText(
        /effective date/i,
      ) as HTMLInputElement;
      expect(dateInput.value).toBe('2024-01-15');
      expect(dateInput).toBeDisabled();

      const durationInput = screen.getByLabelText(
        /duration/i,
      ) as HTMLInputElement;
      expect(durationInput.value).toBe('5.25');
    });

    it('shows success message when duration is updated', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({
          ...mockDuration,
          duration: 5.75,
        }),
      );

      render(
        <DurationForm
          mode="edit"
          durationId="duration-001"
          initialData={mockDuration}
          onSuccess={mockOnSuccess}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
      });

      // Act
      const durationInput = screen.getByLabelText(/duration/i);
      await user.clear(durationInput);
      await user.type(durationInput, '5.75');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(
        screen.getByText(/duration updated successfully/i),
      ).toBeInTheDocument();
    });

    it('records change in audit trail', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockDuration),
      );

      render(
        <DurationForm
          mode="edit"
          durationId="duration-001"
          initialData={mockDuration}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
      });

      // Act
      const durationInput = screen.getByLabelText(/duration/i);
      await user.clear(durationInput);
      await user.type(durationInput, '5.75');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[0];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      render(
        <DurationForm
          mode="edit"
          durationId="duration-001"
          initialData={mockDuration}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
      });

      // Act
      const durationInput = screen.getByLabelText(/duration/i);
      await user.clear(durationInput);
      await user.type(durationInput, '5.75');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to update/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// BETAS - Story 5.10: View Instrument Betas Grid
// ============================================================================

describe.skip('Market Data - Story 5.10: View Instrument Betas Grid', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays grid with ISIN, Name, Beta, Benchmark, Effective Date columns', async () => {
      // Arrange
      const mockBetas = createMockBetasList(5);
      setupFetchMock(mockBetas, 5);

      // Act
      render(<BetasPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      expect(screen.getByText('ISIN')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.getByText('Benchmark')).toBeInTheDocument();
      expect(screen.getByText('Effective Date')).toBeInTheDocument();
    });

    it('filters by ISIN when typing in search box', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBetas = createMockBetasList(10);
      setupFetchMock(mockBetas, 10);

      render(<BetasPage />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const searchInput = screen.getByRole('searchbox', {
        name: /search by isin/i,
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

    it('shows beta details when row is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBetas = createMockBetasList(3);
      setupFetchMock(mockBetas, 3);

      render(<BetasPage />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const firstRow = screen.getByText('US0378331005').closest('tr');
      await user.click(firstRow!);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /beta details/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty message when no betas exist', async () => {
      // Arrange
      setupFetchMock([], 0);

      // Act
      render(<BetasPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no beta data found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValue(
        new TypeError('Failed to fetch'),
      );

      // Act
      render(<BetasPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to load betas/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// BETAS - Story 5.11: Add Instrument Beta
// ============================================================================

describe.skip('Market Data - Story 5.11: Add Instrument Beta', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays form with ISIN, Benchmark, Beta, Effective Date fields', async () => {
      // Act
      render(<BetaForm mode="add" onSuccess={vi.fn()} />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /add beta/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/benchmark/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/beta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/effective date/i)).toBeInTheDocument();
    });

    it('shows success message when beta is added', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(
          {
            id: 'beta-001',
            isin: 'US0378331005',
            benchmark: 'S&P500',
            beta: 1.25,
            effectiveDate: '2024-01-15',
          },
          201,
        ),
      );

      render(<BetaForm mode="add" onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.selectOptions(screen.getByLabelText(/benchmark/i), 'S&P500');
      await user.type(screen.getByLabelText(/beta/i), '1.25');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(screen.getByText(/beta added successfully/i)).toBeInTheDocument();
    });

    it('records change in audit trail', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({ id: 'beta-001' }, 201),
      );

      render(<BetaForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.selectOptions(screen.getByLabelText(/benchmark/i), 'S&P500');
      await user.type(screen.getByLabelText(/beta/i), '1.25');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[0];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows error when duplicate ISIN + Benchmark + Date exists', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          Messages: ['Beta already exists'],
        }),
      });

      render(<BetaForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.selectOptions(screen.getByLabelText(/benchmark/i), 'S&P500');
      await user.type(screen.getByLabelText(/beta/i), '1.25');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/beta already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows validation errors when required fields are empty', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<BetaForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/isin is required/i)).toBeInTheDocument();
      });
    });
  });
});

// ============================================================================
// BETAS - Story 5.12: Update Instrument Beta
// ============================================================================

describe.skip('Market Data - Story 5.12: Update Instrument Beta', () => {
  const mockBeta = {
    id: 'beta-001',
    isin: 'US0378331005',
    instrumentName: 'Apple Inc. Common Stock',
    beta: 1.25,
    benchmark: 'S&P500',
    effectiveDate: '2024-01-15',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays form pre-filled with current values', async () => {
      // Act
      render(
        <BetaForm
          mode="edit"
          betaId="beta-001"
          initialData={mockBeta}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /edit beta/i }),
        ).toBeInTheDocument();
      });

      const isinInput = screen.getByLabelText(/isin/i) as HTMLInputElement;
      expect(isinInput.value).toBe('US0378331005');
      expect(isinInput).toBeDisabled();

      const benchmarkInput = screen.getByLabelText(
        /benchmark/i,
      ) as HTMLSelectElement;
      expect(benchmarkInput.value).toBe('S&P500');
      expect(benchmarkInput).toBeDisabled();

      const dateInput = screen.getByLabelText(
        /effective date/i,
      ) as HTMLInputElement;
      expect(dateInput.value).toBe('2024-01-15');
      expect(dateInput).toBeDisabled();

      const betaInput = screen.getByLabelText(/beta/i) as HTMLInputElement;
      expect(betaInput.value).toBe('1.25');
    });

    it('shows success message when beta is updated', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({
          ...mockBeta,
          beta: 1.35,
        }),
      );

      render(
        <BetaForm
          mode="edit"
          betaId="beta-001"
          initialData={mockBeta}
          onSuccess={mockOnSuccess}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/beta/i)).toBeInTheDocument();
      });

      // Act
      const betaInput = screen.getByLabelText(/beta/i);
      await user.clear(betaInput);
      await user.type(betaInput, '1.35');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(
        screen.getByText(/beta updated successfully/i),
      ).toBeInTheDocument();
    });

    it('records change in audit trail', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(createMockResponse(mockBeta));

      render(
        <BetaForm
          mode="edit"
          betaId="beta-001"
          initialData={mockBeta}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/beta/i)).toBeInTheDocument();
      });

      // Act
      const betaInput = screen.getByLabelText(/beta/i);
      await user.clear(betaInput);
      await user.type(betaInput, '1.35');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[0];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      render(
        <BetaForm
          mode="edit"
          betaId="beta-001"
          initialData={mockBeta}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/beta/i)).toBeInTheDocument();
      });

      // Act
      const betaInput = screen.getByLabelText(/beta/i);
      await user.clear(betaInput);
      await user.type(betaInput, '1.35');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to update/i)).toBeInTheDocument();
      });
    });
  });
});
