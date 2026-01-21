/**
 * Integration Test: Index Price Form (Epic 5)
 *
 * Tests for Epic 5: Market Data Maintenance
 * Stories covered: 5.2 (Add Index Price), 5.3 (Update Index Price)
 *
 * Test Strategy:
 * - Test user-observable form behavior and validation
 * - Mock only the HTTP client (test real components)
 * - Use accessibility-first queries (getByLabelText, getByRole)
 * - Verify user sees correct messages and form states
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AddIndexPricePage from '@/app/index-prices/add/page';
import EditIndexPricePage from '@/app/index-prices/[id]/edit/page';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useParams: () => ({ id: 'price-123' }),
  usePathname: () => '/index-prices/add',
}));

// Mock ToastContext
const mockShowToast = vi.fn();
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch globally
const mockFetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = mockFetch;
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

describe.skip('Index Price Form - Story 5.2: Add Index Price', () => {
  it('displays form with all required fields when Add Price is opened', async () => {
    render(<AddIndexPricePage />);

    expect(screen.getByLabelText(/index code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
  });

  it('marks required fields appropriately', () => {
    render(<AddIndexPricePage />);

    expect(screen.getByLabelText(/index code/i)).toBeRequired();
    expect(screen.getByLabelText(/date/i)).toBeRequired();
    expect(screen.getByLabelText(/price/i)).toBeRequired();
    expect(screen.getByLabelText(/currency/i)).toBeRequired();
  });

  it('shows success message when price is added successfully', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        id: 'price-new',
        indexCode: 'SPX',
        date: '2024-01-20',
        price: 4783.45,
      }),
    );

    render(<AddIndexPricePage />);

    await user.type(screen.getByLabelText(/index code/i), 'SPX');
    await user.type(screen.getByLabelText(/date/i), '2024-01-20');
    await user.type(screen.getByLabelText(/price/i), '4783.45');
    await user.type(screen.getByLabelText(/currency/i), 'USD');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/price added successfully/i),
          variant: 'success',
        }),
      );
    });
  });

  it('records username in audit trail when price is saved', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        id: 'price-new',
        indexCode: 'SPX',
        auditTrail: [
          {
            date: '2024-01-20T10:30:00Z',
            user: 'john.smith',
            action: 'Created',
          },
        ],
      }),
    );

    render(<AddIndexPricePage />);

    await user.type(screen.getByLabelText(/index code/i), 'SPX');
    await user.type(screen.getByLabelText(/date/i), '2024-01-20');
    await user.type(screen.getByLabelText(/price/i), '4783.45');
    await user.type(screen.getByLabelText(/currency/i), 'USD');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/index-prices'),
        expect.objectContaining({
          headers: expect.objectContaining({
            LastChangedUser: expect.any(String),
          }),
        }),
      );
    });
  });

  it('shows error when duplicate (Index + Date) is entered', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse(
        { error: 'Price already exists for this date' },
        false,
        409,
      ),
    );

    render(<AddIndexPricePage />);

    await user.type(screen.getByLabelText(/index code/i), 'SPX');
    await user.type(screen.getByLabelText(/date/i), '2024-01-20');
    await user.type(screen.getByLabelText(/price/i), '4783.45');
    await user.type(screen.getByLabelText(/currency/i), 'USD');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/price already exists for this date/i),
      ).toBeInTheDocument();
    });
  });

  it('shows validation errors for missing required fields', async () => {
    const user = userEvent.setup();
    render(<AddIndexPricePage />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/index code is required/i)).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('validates price must be positive number', async () => {
    const user = userEvent.setup();
    render(<AddIndexPricePage />);

    await user.type(screen.getByLabelText(/price/i), '-100');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/price must be a positive number/i),
      ).toBeInTheDocument();
    });
  });

  it('prevents selecting future dates', async () => {
    const user = userEvent.setup();
    render(<AddIndexPricePage />);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().split('T')[0];

    await user.type(screen.getByLabelText(/date/i), futureDate);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/date cannot be in the future/i),
      ).toBeInTheDocument();
    });
  });

  it('populates Index Code dropdown from Indexes table', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse({
        indexes: ['SPX', 'INDU', 'UKX', 'NDX'],
      }),
    );

    render(<AddIndexPricePage />);

    await waitFor(() => {
      const indexCodeSelect = screen.getByLabelText(/index code/i);
      expect(indexCodeSelect).toBeInTheDocument();
    });
  });

  it('shows error message when API fails during save', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<AddIndexPricePage />);

    await user.type(screen.getByLabelText(/index code/i), 'SPX');
    await user.type(screen.getByLabelText(/date/i), '2024-01-20');
    await user.type(screen.getByLabelText(/price/i), '4783.45');
    await user.type(screen.getByLabelText(/currency/i), 'USD');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/failed to add price.*please try again/i),
      ).toBeInTheDocument();
    });
  });

  it('closes form without saving when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AddIndexPricePage />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/index-prices'),
      );
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('shows confirmation dialog when canceling with unsaved changes', async () => {
    const user = userEvent.setup();
    render(<AddIndexPricePage />);

    await user.type(screen.getByLabelText(/price/i), '4783.45');

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByText(/unsaved changes will be lost/i),
      ).toBeInTheDocument();
    });
  });
});

describe.skip('Index Price Form - Story 5.3: Update Index Price', () => {
  const mockPrice = {
    id: 'price-123',
    indexCode: 'SPX',
    indexName: 'S&P 500',
    date: '2024-01-20',
    price: 4783.45,
    currency: 'USD',
  };

  it('pre-fills form with current price values when Edit is opened', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockPrice));

    render(<EditIndexPricePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('SPX')).toBeInTheDocument();
      expect(screen.getByDisplayValue('4783.45')).toBeInTheDocument();
    });
  });

  it('disables Index Code field in edit mode (read-only)', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockPrice));

    render(<EditIndexPricePage />);

    await waitFor(() => {
      const indexCodeInput = screen.getByLabelText(/index code/i);
      expect(indexCodeInput).toBeDisabled();
    });
  });

  it('disables Date field in edit mode (read-only)', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockPrice));

    render(<EditIndexPricePage />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/date/i);
      expect(dateInput).toBeDisabled();
    });
  });

  it('shows success message when price is updated', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockPrice))
      .mockResolvedValueOnce(
        createMockResponse({ ...mockPrice, price: 4790.0 }),
      );

    render(<EditIndexPricePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('4783.45')).toBeInTheDocument();
    });

    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '4790.00');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/price updated successfully/i),
          variant: 'success',
        }),
      );
    });
  });

  it('records change in audit trail when price is updated', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockPrice))
      .mockResolvedValueOnce(createMockResponse({ ...mockPrice }));

    render(<EditIndexPricePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('4783.45')).toBeInTheDocument();
    });

    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '4790.00');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      const putCall = mockFetch.mock.calls.find(
        (call) => call[1]?.method === 'PUT',
      );
      expect(putCall).toBeDefined();
      expect(putCall![1].headers.LastChangedUser).toBeDefined();
    });
  });

  it('shows error message when update API fails', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockPrice))
      .mockRejectedValueOnce(new Error('Network error'));

    render(<EditIndexPricePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('4783.45')).toBeInTheDocument();
    });

    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '4790.00');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/failed to update.*please try again/i),
      ).toBeInTheDocument();
    });
  });

  it('includes optimistic concurrency check', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockPrice))
      .mockResolvedValueOnce(
        createMockResponse({ error: 'Concurrency conflict' }, false, 409),
      );

    render(<EditIndexPricePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('4783.45')).toBeInTheDocument();
    });

    const priceInput = screen.getByLabelText(/price/i);
    await user.clear(priceInput);
    await user.type(priceInput, '4790.00');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/another user.*updated.*price/i),
      ).toBeInTheDocument();
    });
  });

  it('allows updating price and currency fields', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockPrice))
      .mockResolvedValueOnce(createMockResponse({ ...mockPrice }));

    render(<EditIndexPricePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('4783.45')).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/price/i));
    await user.type(screen.getByLabelText(/price/i), '4790.00');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      const putCall = mockFetch.mock.calls.find(
        (call) => call[1]?.method === 'PUT',
      );
      const body = JSON.parse(putCall![1].body);
      expect(body.price).toBe(4790.0);
    });
  });
});
