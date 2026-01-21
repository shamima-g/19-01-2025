/**
 * Integration Test: Custom Holding Form (Stories 6.2, 6.3)
 *
 * Tests the Add/Update Custom Holding form functionality including:
 * - Form rendering with all fields
 * - Add new holding workflow
 * - Update existing holding workflow
 * - Form validation
 * - Success/error states
 * - Audit trail recording
 * - Duplicate detection
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
import { CustomHoldingForm } from '@/components/CustomHoldingForm';

// Store original fetch
const originalFetch = global.fetch;

// Mock the toast context
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Helper to create a mock response
const createMockResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => data,
});

// Mock portfolios for dropdown
const createMockPortfolios = () => [
  { code: 'PORT-A', name: 'Portfolio A' },
  { code: 'PORT-B', name: 'Portfolio B' },
  { code: 'PORT-C', name: 'Portfolio C' },
];

// Mock instruments for dropdown
const createMockInstruments = () => [
  { code: 'US0378331005', description: 'Apple Inc. Common Stock' },
  { code: 'US5949181045', description: 'Microsoft Corp. Common Stock' },
  { code: 'US02079K1079', description: 'Alphabet Inc. Class A' },
];

describe('Custom Holding Form - Story 6.2: Add Custom Holding', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Form Rendering', () => {
    it('displays all form fields for adding new holding', async () => {
      // Arrange
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        });

      // Act
      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /add custom holding/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/portfolio code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/instrument code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/effective date/i)).toBeInTheDocument();
    });

    it('displays portfolio dropdown with all portfolios', async () => {
      // Arrange
      const mockPortfolios = createMockPortfolios();
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockPortfolios,
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        });

      // Act
      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /portfolio code/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('Portfolio A')).toBeInTheDocument();
      expect(screen.getByText('Portfolio B')).toBeInTheDocument();
      expect(screen.getByText('Portfolio C')).toBeInTheDocument();
    });

    it('displays instrument dropdown with all instruments', async () => {
      // Arrange
      const mockInstruments = createMockInstruments();
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => mockInstruments,
        });

      // Act
      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /instrument code/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('Apple Inc. Common Stock')).toBeInTheDocument();
      expect(
        screen.getByText('Microsoft Corp. Common Stock'),
      ).toBeInTheDocument();
    });
  });

  describe('Happy Path - Add Holding', () => {
    it('adds custom holding successfully with valid data', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        })
        .mockResolvedValueOnce(
          createMockResponse(
            {
              id: 'holding-001',
              portfolioCode: 'PORT-A',
              isin: 'US0378331005',
              amount: 1000,
              currency: 'USD',
              effectiveDate: '2024-01-15',
            },
            201,
          ),
        );

      render(<CustomHoldingForm mode="add" onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/portfolio code/i)).toBeInTheDocument();
      });

      // Act - fill out form
      await user.selectOptions(
        screen.getByLabelText(/portfolio code/i),
        'PORT-A',
      );
      await user.selectOptions(
        screen.getByLabelText(/instrument code/i),
        'US0378331005',
      );
      await user.type(screen.getByLabelText(/amount/i), '1000');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/custom-holdings'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            portfolioCode: 'PORT-A',
            instrumentCode: 'US0378331005',
            amount: 1000,
            currency: 'USD',
            effectiveDate: '2024-01-15',
          }),
        }),
      );
    });

    it('shows success message after adding holding', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        })
        .mockResolvedValueOnce(createMockResponse({ id: 'holding-001' }, 201));

      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/portfolio code/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(
        screen.getByLabelText(/portfolio code/i),
        'PORT-A',
      );
      await user.selectOptions(
        screen.getByLabelText(/instrument code/i),
        'US0378331005',
      );
      await user.type(screen.getByLabelText(/amount/i), '1000');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/custom holding added successfully/i),
        ).toBeInTheDocument();
      });
    });

    it('records username in audit trail when adding holding', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        })
        .mockResolvedValueOnce(createMockResponse({ id: 'holding-001' }, 201));

      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/portfolio code/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(
        screen.getByLabelText(/portfolio code/i),
        'PORT-A',
      );
      await user.selectOptions(
        screen.getByLabelText(/instrument code/i),
        'US0378331005',
      );
      await user.type(screen.getByLabelText(/amount/i), '1000');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[2];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows error when portfolio code is empty', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        });

      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/portfolio code/i)).toBeInTheDocument();
      });

      // Act - submit without selecting portfolio
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/portfolio code is required/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error when instrument code is empty', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        });

      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/instrument code/i)).toBeInTheDocument();
      });

      // Act - submit without selecting instrument
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/instrument code is required/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error when amount is empty', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        });

      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });

      // Act - submit without entering amount
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when amount is not a valid number', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        });

      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });

      // Act
      await user.type(screen.getByLabelText(/amount/i), 'abc');
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/amount must be a valid number/i),
        ).toBeInTheDocument();
      });
    });

    it('shows duplicate error when holding already exists', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          statusText: 'Conflict',
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            Messages: ['Holding already exists'],
          }),
        });

      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/portfolio code/i)).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(
        screen.getByLabelText(/portfolio code/i),
        'PORT-A',
      );
      await user.selectOptions(
        screen.getByLabelText(/instrument code/i),
        'US0378331005',
      );
      await user.type(screen.getByLabelText(/amount/i), '1000');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/holding already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API is unavailable', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        })
        .mockRejectedValueOnce(new TypeError('Failed to fetch'));

      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/portfolio code/i)).toBeInTheDocument();
      });

      // Act - fill all required fields
      await user.selectOptions(
        screen.getByLabelText(/portfolio code/i),
        'PORT-A',
      );
      await user.selectOptions(
        screen.getByLabelText(/instrument code/i),
        'US0378331005',
      );
      await user.type(screen.getByLabelText(/amount/i), '1000');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/unable to add holding\. please try again later\./i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows Saving... text and disables button during save', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        });

      // Create a deferred promise
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as Mock).mockReturnValueOnce(fetchPromise);

      render(<CustomHoldingForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/portfolio code/i)).toBeInTheDocument();
      });

      // Fill all required form fields
      await user.selectOptions(
        screen.getByLabelText(/portfolio code/i),
        'PORT-A',
      );
      await user.selectOptions(
        screen.getByLabelText(/instrument code/i),
        'US0378331005',
      );
      await user.type(screen.getByLabelText(/amount/i), '1000');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');
      await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');

      // Act
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert - should show loading state
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /saving\.\.\./i }),
        ).toBeDisabled();
      });

      // Resolve to clean up
      resolveFetch!(createMockResponse({ id: 'holding-001' }, 201));
    });
  });
});

describe('Custom Holding Form - Story 6.3: Update Custom Holding', () => {
  const mockHolding = {
    id: 'holding-001',
    portfolioCode: 'PORT-A',
    portfolioName: 'Portfolio A',
    instrumentCode: 'US0378331005',
    instrumentDescription: 'Apple Inc. Common Stock',
    amount: 1000,
    currency: 'USD',
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

  describe('Form Rendering - Edit Mode', () => {
    it('displays form with pre-filled data', async () => {
      // Arrange
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        });

      // Act
      render(
        <CustomHoldingForm
          mode="edit"
          holdingId="holding-001"
          initialData={mockHolding}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /edit custom holding/i }),
        ).toBeInTheDocument();
      });

      const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
      expect(amountInput.value).toBe('1000');

      const currencySelect = screen.getByLabelText(
        /currency/i,
      ) as HTMLSelectElement;
      expect(currencySelect.value).toBe('USD');
    });

    it('makes Portfolio and Instrument fields read-only in edit mode', async () => {
      // Arrange
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        });

      // Act
      render(
        <CustomHoldingForm
          mode="edit"
          holdingId="holding-001"
          initialData={mockHolding}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        const portfolioInput = screen.getByLabelText(/portfolio code/i);
        const instrumentInput = screen.getByLabelText(/instrument code/i);

        expect(portfolioInput).toHaveAttribute('disabled');
        expect(instrumentInput).toHaveAttribute('disabled');
      });
    });
  });

  describe('Happy Path - Update Holding', () => {
    it('updates holding successfully with modified data', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        })
        .mockResolvedValueOnce(
          createMockResponse({
            ...mockHolding,
            amount: 1500,
            currency: 'EUR',
          }),
        );

      render(
        <CustomHoldingForm
          mode="edit"
          holdingId="holding-001"
          initialData={mockHolding}
          onSuccess={mockOnSuccess}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });

      // Act - modify amount and currency
      const amountInput = screen.getByLabelText(/amount/i);
      await user.clear(amountInput);
      await user.type(amountInput, '1500');

      await user.selectOptions(screen.getByLabelText(/currency/i), 'EUR');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/custom-holdings/holding-001'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            amount: 1500,
            currency: 'EUR',
            effectiveDate: '2024-01-15',
          }),
        }),
      );
    });

    it('shows success message after updating holding', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        })
        .mockResolvedValueOnce(createMockResponse(mockHolding));

      render(
        <CustomHoldingForm
          mode="edit"
          holdingId="holding-001"
          initialData={mockHolding}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });

      // Act
      const amountInput = screen.getByLabelText(/amount/i);
      await user.clear(amountInput);
      await user.type(amountInput, '2000');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/holding updated successfully/i),
        ).toBeInTheDocument();
      });
    });

    it('records username in audit trail when updating holding', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        })
        .mockResolvedValueOnce(createMockResponse(mockHolding));

      render(
        <CustomHoldingForm
          mode="edit"
          holdingId="holding-001"
          initialData={mockHolding}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });

      // Act
      const amountInput = screen.getByLabelText(/amount/i);
      await user.clear(amountInput);
      await user.type(amountInput, '2000');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[2];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when update fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockPortfolios(),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => createMockInstruments(),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      render(
        <CustomHoldingForm
          mode="edit"
          holdingId="holding-001"
          initialData={mockHolding}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      });

      // Act
      const amountInput = screen.getByLabelText(/amount/i);
      await user.clear(amountInput);
      await user.type(amountInput, '2000');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to update/i)).toBeInTheDocument();
      });
    });
  });
});
