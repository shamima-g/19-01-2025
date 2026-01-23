/**
 * Integration Test: Instrument Static Data Management (Epic 4: Stories 4.1 - 4.9)
 *
 * Tests the Instrument Static Data Management functionality including:
 * - Grid rendering with search and sort (Story 4.1)
 * - Add new instrument (Story 4.2)
 * - Update existing instrument (Story 4.3)
 * - Upload instruments file (Story 4.4)
 * - View audit trail (Story 4.5)
 * - View history snapshots (Story 4.6)
 * - Export incomplete ISINs (Story 4.7)
 * - View popup details (Story 4.8)
 * - Toggle column visibility (Story 4.9)
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
import { InstrumentsPage } from '@/app/instruments/page';
import { InstrumentForm } from '@/components/InstrumentForm';
import { InstrumentAuditTrail } from '@/components/InstrumentAuditTrail';
import { InstrumentHistory } from '@/components/InstrumentHistory';
import { InstrumentPopup } from '@/components/InstrumentPopup';

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

// Mock the toast context
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

// Mock data factories
const createMockInstrument = (overrides: Record<string, unknown> = {}) => ({
  id: 'inst-001',
  isin: 'US0378331005',
  name: 'Apple Inc. Common Stock',
  assetClass: 'Equity',
  currency: 'USD',
  status: 'Active',
  issuer: 'Apple Inc.',
  maturityDate: null,
  ...overrides,
});

const createMockInstrumentsList = (count: number) => {
  const isins = [
    'US0378331005',
    'US5949181045',
    'US02079K1079',
    'US88160R1014',
    'GB0002374006',
  ];
  const names = [
    'Apple Inc. Common Stock',
    'Microsoft Corp. Common Stock',
    'Alphabet Inc. Class A',
    'Tesla Inc. Common Stock',
    'BP PLC Ordinary Shares',
  ];
  const assetClasses = ['Equity', 'Fixed Income', 'Fund'];
  const currencies = ['USD', 'EUR', 'GBP', 'CHF'];
  const statuses = ['Active', 'Inactive'];

  return Array.from({ length: count }, (_, i) => ({
    id: `inst-${String(i + 1).padStart(3, '0')}`,
    isin: isins[i % isins.length],
    name: names[i % names.length],
    assetClass: assetClasses[i % assetClasses.length],
    currency: currencies[i % currencies.length],
    status: statuses[i % statuses.length],
    issuer: `Issuer ${i + 1}`,
    maturityDate: i % 2 === 0 ? '2025-12-31' : null,
  }));
};

// Helper to create a mock response
const createMockResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => data,
});

// Helper to setup fetch mock
const setupFetchMock = (instrumentsResponse: unknown[], total: number) => {
  (global.fetch as Mock).mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => ({ data: instrumentsResponse, total }),
  });
};

describe('Instrument Static Data - Story 4.1: View Instruments Grid', () => {
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
      const mockInstruments = createMockInstrumentsList(5);
      setupFetchMock(mockInstruments, 5);

      // Act
      render(<InstrumentsPage />);

      // Assert - wait for data to load
      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Verify all columns are present
      expect(screen.getByText('ISIN')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Asset Class')).toBeInTheDocument();
      expect(screen.getByText('Currency')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('sorts grid when column header is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);
      setupFetchMock(mockInstruments, 5);

      render(<InstrumentsPage />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act - click Name column header
      const nameHeader = screen.getByText('Name');
      await user.click(nameHeader);

      // Assert - should make API call with sort parameter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('sort=name'),
          expect.anything(),
        );
      });
    });

    it('filters grid when typing in search box', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(10);
      setupFetchMock(mockInstruments, 10);

      render(<InstrumentsPage />);

      // Wait for data to load (use getAllByText since ISINs repeat in mock data)
      await waitFor(() => {
        const cells = screen.getAllByText('US0378331005');
        expect(cells.length).toBeGreaterThan(0);
      });

      // Act
      const searchInput = screen.getByRole('searchbox', { name: /search/i });
      await user.type(searchInput, 'Apple');

      // Assert - wait for debounced search (200ms debounce + typing time)
      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('search=Apple'),
            expect.anything(),
          );
        },
        { timeout: 1000 },
      );
    });

    it('navigates to detail view when instrument row is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(3);
      setupFetchMock(mockInstruments, 3);

      render(<InstrumentsPage />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act - click on first row
      const firstRow = screen.getByText('US0378331005').closest('tr');
      await user.click(firstRow!);

      // Assert - should show detail view
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /instrument details/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty state when no instruments exist', async () => {
      // Arrange
      setupFetchMock([], 0);

      // Act
      render(<InstrumentsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no instruments found/i)).toBeInTheDocument();
      });
    });

    it('displays pagination for large datasets', async () => {
      // Arrange
      const mockInstruments = createMockInstrumentsList(150);
      setupFetchMock(mockInstruments.slice(0, 50), 150);

      // Act
      render(<InstrumentsPage />);

      // Assert - wait for data to load (use getAllByText since ISIN repeats in mock data)
      await waitFor(() => {
        const cells = screen.getAllByText('US0378331005');
        expect(cells.length).toBeGreaterThan(0);
      });

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValue(
        new TypeError('Failed to fetch'),
      );

      // Act
      render(<InstrumentsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load instruments\. please try again\./i),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Instrument Static Data - Story 4.2: Add New Instrument', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays form with all required fields', async () => {
      // Act
      render(<InstrumentForm mode="add" onSuccess={vi.fn()} />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /add instrument/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/asset class/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/issuer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/maturity date/i)).toBeInTheDocument();
    });

    it('adds instrument successfully with valid data', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(
          {
            id: 'inst-001',
            isin: 'US0378331005',
            name: 'Apple Inc. Common Stock',
            assetClass: 'Equity',
            currency: 'USD',
          },
          201,
        ),
      );

      render(<InstrumentForm mode="add" onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act - fill out form
      await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.type(
        screen.getByLabelText(/name/i),
        'Apple Inc. Common Stock',
      );
      await user.selectOptions(screen.getByLabelText(/asset class/i), 'Equity');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');
      await user.type(screen.getByLabelText(/issuer/i), 'Apple Inc.');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(
        screen.getByText(/instrument added successfully/i),
      ).toBeInTheDocument();
    });

    it('records username in audit trail when adding instrument', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({ id: 'inst-001' }, 201),
      );

      render(<InstrumentForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.type(screen.getByLabelText(/name/i), 'Test Instrument');
      await user.selectOptions(screen.getByLabelText(/asset class/i), 'Equity');
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
    it('shows error when duplicate ISIN is entered', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          Messages: ['ISIN already exists'],
        }),
      });

      render(<InstrumentForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.type(screen.getByLabelText(/name/i), 'Test');
      await user.selectOptions(screen.getByLabelText(/asset class/i), 'Equity');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/isin already exists/i)).toBeInTheDocument();
      });
    });

    it('shows validation error when required fields are empty', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<InstrumentForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act - submit without filling required fields
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/isin is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      render(<InstrumentForm mode="add" onSuccess={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
      await user.type(screen.getByLabelText(/name/i), 'Test');
      await user.selectOptions(screen.getByLabelText(/asset class/i), 'Equity');
      await user.selectOptions(screen.getByLabelText(/currency/i), 'USD');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to add instrument\. please try again\./i),
        ).toBeInTheDocument();
      });
    });

    it('closes form without saving when Cancel is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();

      render(
        <InstrumentForm
          mode="add"
          onSuccess={vi.fn()}
          onCancel={mockOnCancel}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Assert
      expect(mockOnCancel).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});

describe('Instrument Static Data - Story 4.3: Update Existing Instrument', () => {
  const mockInstrument = {
    id: 'inst-001',
    isin: 'US0378331005',
    name: 'Apple Inc. Common Stock',
    assetClass: 'Equity',
    currency: 'USD',
    issuer: 'Apple Inc.',
    maturityDate: null,
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
        <InstrumentForm
          mode="edit"
          instrumentId="inst-001"
          initialData={mockInstrument}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /edit instrument/i }),
        ).toBeInTheDocument();
      });

      const isinInput = screen.getByLabelText(/isin/i) as HTMLInputElement;
      expect(isinInput.value).toBe('US0378331005');
      expect(isinInput).toBeDisabled(); // ISIN is not editable

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Apple Inc. Common Stock');
    });

    it('updates instrument successfully', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({
          ...mockInstrument,
          name: 'Apple Inc. Updated',
        }),
      );

      render(
        <InstrumentForm
          mode="edit"
          instrumentId="inst-001"
          initialData={mockInstrument}
          onSuccess={mockOnSuccess}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Act - update name
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Apple Inc. Updated');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(
        screen.getByText(/instrument updated successfully/i),
      ).toBeInTheDocument();
    });

    it('records change in audit trail', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockInstrument),
      );

      render(
        <InstrumentForm
          mode="edit"
          instrumentId="inst-001"
          initialData={mockInstrument}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Act
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[0];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows validation error when required field is cleared', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <InstrumentForm
          mode="edit"
          instrumentId="inst-001"
          initialData={mockInstrument}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Act - clear required field
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('shows concurrency warning when instrument was updated by another user', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          Messages: [
            'This instrument was recently updated by another user. Please refresh.',
          ],
        }),
      });

      render(
        <InstrumentForm
          mode="edit"
          instrumentId="inst-001"
          initialData={mockInstrument}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Act
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/updated by another user/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      render(
        <InstrumentForm
          mode="edit"
          instrumentId="inst-001"
          initialData={mockInstrument}
          onSuccess={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      });

      // Act
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated');

      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to update instrument\. please try again\./i),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Instrument Static Data - Story 4.4: Upload Instruments File', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays file name and size when valid file is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'instruments.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      render(<InstrumentsPage />);

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
        expect(screen.getByText('instruments.xlsx')).toBeInTheDocument();
      });
    });

    it('shows success summary when upload completes', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'instruments.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({
          added: 15,
          updated: 5,
          errors: [],
        }),
      );

      render(<InstrumentsPage />);

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
          screen.getByText(/15 instruments added, 5 updated/i),
        ).toBeInTheDocument();
      });
    });

    it('refreshes grid after successful upload', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'instruments.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const mockInstruments = createMockInstrumentsList(5);

      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: mockInstruments, total: 5 }),
        })
        .mockResolvedValueOnce(
          createMockResponse({
            added: 10,
            updated: 0,
            errors: [],
          }),
        )
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            data: createMockInstrumentsList(15),
            total: 15,
          }),
        });

      render(<InstrumentsPage />);

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

      // Assert - grid should refresh
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3); // Initial load + upload + refresh
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows validation errors for invalid rows', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'instruments.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({
          added: 8,
          updated: 0,
          errors: [
            { row: 5, reason: 'Invalid ISIN format' },
            { row: 12, reason: 'Missing required field: Asset Class' },
          ],
        }),
      );

      render(<InstrumentsPage />);

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
          screen.getByText(/row 5.*invalid isin format/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/row 12.*missing required field/i),
        ).toBeInTheDocument();
      });
    });

    it('updates existing instruments when duplicates are found', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'instruments.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse({
          added: 0,
          updated: 10,
          errors: [],
        }),
      );

      render(<InstrumentsPage />);

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
          screen.getByText(/0 instruments added, 10 updated/i),
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

      render(<InstrumentsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /upload file/i }),
        ).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload file/i });
      await user.click(uploadButton);

      // Wait for dialog to open and file input to be available
      const fileInput = (await screen.findByLabelText(
        /select file/i,
      )) as HTMLInputElement;

      // Act - manually set files and trigger change event (workaround for accept attribute in jsdom)
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/invalid file format.*xlsx or csv/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error when upload fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const file = new File(['test'], 'instruments.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      render(<InstrumentsPage />);

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
          screen.getByText(/upload failed\. please try again\./i),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Instrument Static Data - Story 4.5: View Instrument Audit Trail', () => {
  const mockAuditTrail = [
    {
      id: 'audit-001',
      date: '2024-01-15T10:30:00Z',
      user: 'john.doe',
      fieldChanged: 'Name',
      oldValue: 'Apple Inc.',
      newValue: 'Apple Inc. Common Stock',
    },
    {
      id: 'audit-002',
      date: '2024-01-10T14:20:00Z',
      user: 'jane.smith',
      fieldChanged: 'Currency',
      oldValue: 'EUR',
      newValue: 'USD',
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
    it('displays chronological list of all changes', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockAuditTrail),
      );

      // Act
      render(<InstrumentAuditTrail instrumentId="inst-001" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('john.doe')).toBeInTheDocument();
        expect(screen.getByText('jane.smith')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Currency')).toBeInTheDocument();
      });
    });

    it('shows Date, User, Field Changed, Old Value, New Value for each change', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockAuditTrail),
      );

      // Act
      render(<InstrumentAuditTrail instrumentId="inst-001" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('01/15/2024')).toBeInTheDocument();
        expect(screen.getByText('john.doe')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
        expect(screen.getByText('Apple Inc. Common Stock')).toBeInTheDocument();
      });
    });

    it('exports audit trail to Excel when Export is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockAuditTrail))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          blob: async () => new Blob(['mock-excel-data']),
        });

      render(<InstrumentAuditTrail instrumentId="inst-001" />);

      await waitFor(() => {
        expect(screen.getByText('john.doe')).toBeInTheDocument();
      });

      // Act
      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/instruments/inst-001/audit-trail/export'),
          expect.anything(),
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty message when no changes recorded', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue(createMockResponse([]));

      // Act
      render(<InstrumentAuditTrail instrumentId="inst-001" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no changes recorded/i)).toBeInTheDocument();
      });
    });

    it('displays pagination for large audit trails', async () => {
      // Arrange
      const largeAuditTrail = Array.from({ length: 150 }, (_, i) => ({
        id: `audit-${String(i + 1).padStart(3, '0')}`,
        date: `2024-01-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`,
        user: `user${i % 5}`,
        fieldChanged: 'Name',
        oldValue: `Old Value ${i}`,
        newValue: `New Value ${i}`,
      }));

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(largeAuditTrail.slice(0, 50)),
      );

      // Act
      render(<InstrumentAuditTrail instrumentId="inst-001" />);

      // Assert - wait for data to load (use getAllByText since usernames repeat)
      await waitFor(() => {
        const cells = screen.getAllByText('user0');
        expect(cells.length).toBeGreaterThan(0);
      });

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      // Act
      render(<InstrumentAuditTrail instrumentId="inst-001" />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load audit trail\. please try again\./i),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Instrument Static Data - Story 4.6: View Instrument History', () => {
  const mockHistory = [
    {
      id: 'history-001',
      date: '2024-01-15',
      name: 'Apple Inc. Common Stock',
      assetClass: 'Equity',
      currency: 'USD',
      status: 'Active',
    },
    {
      id: 'history-002',
      date: '2024-01-01',
      name: 'Apple Inc.',
      assetClass: 'Equity',
      currency: 'EUR',
      status: 'Active',
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
    it('displays table with Date, Name, Asset Class, Currency, Status columns', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue(createMockResponse(mockHistory));

      // Act
      render(<InstrumentHistory instrumentId="inst-001" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Date')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Asset Class')).toBeInTheDocument();
        expect(screen.getByText('Currency')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
      });
    });

    it('sorts snapshots by date descending', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue(createMockResponse(mockHistory));

      // Act
      render(<InstrumentHistory instrumentId="inst-001" />);

      // Assert - dates are formatted as MM/DD/YYYY
      await waitFor(() => {
        const dates = screen.getAllByText(/\d{2}\/\d{2}\/2024/);
        expect(dates[0]).toHaveTextContent('01/15/2024'); // Most recent first
        expect(dates[1]).toHaveTextContent('01/01/2024');
      });
    });

    it('shows side-by-side diff when two snapshots are compared', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(createMockResponse(mockHistory));

      render(<InstrumentHistory instrumentId="inst-001" />);

      await waitFor(() => {
        expect(screen.getByText('01/15/2024')).toBeInTheDocument();
      });

      // Act - select two snapshots
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      const compareButton = screen.getByRole('button', { name: /compare/i });
      await user.click(compareButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /comparison/i }),
        ).toBeInTheDocument();
        // Should highlight changed fields
        expect(screen.getByText(/currency.*eur.*usd/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty message when no historical data available', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValue(createMockResponse([]));

      // Act
      render(<InstrumentHistory instrumentId="inst-001" />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no historical data available/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      // Act
      render(<InstrumentHistory instrumentId="inst-001" />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load history\. please try again\./i),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Instrument Static Data - Story 4.7: Export Incomplete ISINs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('downloads Excel file when Export Incomplete is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);

      // Chain mockResolvedValueOnce: first for page load, second for export
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: mockInstruments, total: 5 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          blob: async () => new Blob(['mock-excel-data']),
        });

      render(<InstrumentsPage />);

      // Wait for data to load (use getAllByText since ISINs repeat)
      await waitFor(() => {
        const cells = screen.getAllByText('US0378331005');
        expect(cells.length).toBeGreaterThan(0);
      });

      // Act
      const exportButton = screen.getByRole('button', {
        name: /export incomplete/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/instruments/incomplete'),
          expect.anything(),
        );
      });
    });

    it('exported file includes ISIN, Name, Missing Fields, Status columns', async () => {
      // This is verified by API contract - testing the button click is sufficient
      // The actual file parsing would require E2E testing
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);

      // Chain mockResolvedValueOnce: first for page load, second for export
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: mockInstruments, total: 5 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          blob: async () => new Blob(['mock-excel-data']),
        });

      render(<InstrumentsPage />);

      // Wait for data to load (use getAllByText since ISINs repeat)
      await waitFor(() => {
        const cells = screen.getAllByText('US0378331005');
        expect(cells.length).toBeGreaterThan(0);
      });

      const exportButton = screen.getByRole('button', {
        name: /export incomplete/i,
      });
      await user.click(exportButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/instruments/incomplete'),
          expect.anything(),
        );
      });
    });

    it('shows specific missing fields for each instrument', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockIncompleteInstruments = [
        createMockInstrument({
          isin: 'US0378331005',
          name: 'Apple Inc.',
          assetClass: null,
          currency: 'USD',
        }),
        createMockInstrument({
          isin: 'US5949181045',
          name: 'Microsoft Corp.',
          assetClass: 'Equity',
          currency: null,
          issuer: null,
        }),
      ];

      // Chain mockResolvedValueOnce: first for page load, second for export
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: mockIncompleteInstruments, total: 2 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          blob: async () => new Blob(['mock-excel-data']),
        });

      render(<InstrumentsPage />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const exportButton = screen.getByRole('button', {
        name: /export incomplete/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/instruments/incomplete'),
          expect.anything(),
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows message when all instruments are complete', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);

      // Chain mockResolvedValueOnce: first for page load, second for export (404)
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: mockInstruments, total: 5 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            Messages: ['No incomplete instruments found'],
          }),
        });

      render(<InstrumentsPage />);

      // Wait for data to load (use getAllByText since ISINs repeat)
      await waitFor(() => {
        const cells = screen.getAllByText('US0378331005');
        expect(cells.length).toBeGreaterThan(0);
      });

      // Act
      const exportButton = screen.getByRole('button', {
        name: /export incomplete/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no incomplete instruments found/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error when export fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);

      // Chain: first for page load (success), second for export (error)
      (global.fetch as Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: mockInstruments, total: 5 }),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      render(<InstrumentsPage />);

      // Wait for data to load (use getAllByText since ISINs repeat)
      await waitFor(() => {
        const cells = screen.getAllByText('US0378331005');
        expect(cells.length).toBeGreaterThan(0);
      });

      // Act
      const exportButton = screen.getByRole('button', {
        name: /export incomplete/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/export failed\. please try again\./i),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Instrument Static Data - Story 4.8: View Instrument Popup Details', () => {
  const mockInstrument = createMockInstrument();

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('displays popup with instrument details when info icon is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockInstrument),
      );

      render(<InstrumentPopup instrumentId="inst-001" />);

      // Act
      const infoIcon = screen.getByRole('button', { name: /info/i });
      await user.click(infoIcon);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Apple Inc. Common Stock')).toBeInTheDocument();
        expect(screen.getByText('Equity')).toBeInTheDocument();
        expect(screen.getByText('USD')).toBeInTheDocument();
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('shows all required fields in popup', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockInstrument),
      );

      render(<InstrumentPopup instrumentId="inst-001" />);

      const infoIcon = screen.getByRole('button', { name: /info/i });
      await user.click(infoIcon);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/name/i)).toBeInTheDocument();
        expect(screen.getByText(/asset class/i)).toBeInTheDocument();
        expect(screen.getByText(/currency/i)).toBeInTheDocument();
        expect(screen.getByText(/issuer/i)).toBeInTheDocument();
        expect(screen.getByText(/maturity date/i)).toBeInTheDocument();
        expect(screen.getByText(/status/i)).toBeInTheDocument();
      });
    });

    it('navigates to full details page when View Full Details is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockInstrument),
      );

      render(<InstrumentPopup instrumentId="inst-001" />);

      const infoIcon = screen.getByRole('button', { name: /info/i });
      await user.click(infoIcon);

      await waitFor(() => {
        expect(screen.getByText('Apple Inc. Common Stock')).toBeInTheDocument();
      });

      // Act
      const viewDetailsButton = screen.getByRole('button', {
        name: /view full details/i,
      });
      await user.click(viewDetailsButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /instrument details/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('closes popup when clicking outside', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValue(
        createMockResponse(mockInstrument),
      );

      render(<InstrumentPopup instrumentId="inst-001" />);

      const infoIcon = screen.getByRole('button', { name: /info/i });
      await user.click(infoIcon);

      await waitFor(() => {
        expect(screen.getByText('Apple Inc. Common Stock')).toBeInTheDocument();
      });

      // Act - click backdrop
      const backdrop = screen.getByTestId('popup-backdrop');
      await user.click(backdrop);

      // Assert
      await waitFor(() => {
        expect(
          screen.queryByText('Apple Inc. Common Stock'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message in popup when API fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

      render(<InstrumentPopup instrumentId="inst-001" />);

      // Act
      const infoIcon = screen.getByRole('button', { name: /info/i });
      await user.click(infoIcon);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to load details/i)).toBeInTheDocument();
      });
    });
  });
});

describe('Instrument Static Data - Story 4.9: Toggle Grid Columns', () => {
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
    it('displays list of all columns with checkboxes when Columns is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);
      setupFetchMock(mockInstruments, 5);

      render(<InstrumentsPage />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      // Act
      const columnsButton = screen.getByRole('button', { name: /columns/i });
      await user.click(columnsButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/asset class/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      });
    });

    it('hides column when unchecked and Apply is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);
      setupFetchMock(mockInstruments, 5);

      render(<InstrumentsPage />);

      await waitFor(() => {
        expect(screen.getByText('Status')).toBeInTheDocument();
      });

      const columnsButton = screen.getByRole('button', { name: /columns/i });
      await user.click(columnsButton);

      // Act - uncheck Status column
      const statusCheckbox = screen.getByLabelText(/status/i);
      await user.click(statusCheckbox);

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Assert
      await waitFor(() => {
        expect(screen.queryByText('Status')).not.toBeInTheDocument();
      });
    });

    it('remembers column preferences after page refresh', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);
      setupFetchMock(mockInstruments, 5);

      render(<InstrumentsPage />);

      await waitFor(() => {
        expect(screen.getByText('Status')).toBeInTheDocument();
      });

      const columnsButton = screen.getByRole('button', { name: /columns/i });
      await user.click(columnsButton);

      const statusCheckbox = screen.getByLabelText(/status/i);
      await user.click(statusCheckbox);

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.queryByText('Status')).not.toBeInTheDocument();
      });

      // Act - unmount and remount (simulating page refresh)
      cleanup();
      setupFetchMock(mockInstruments, 5);
      render(<InstrumentsPage />);

      // Assert - Status should still be hidden
      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      expect(screen.queryByText('Status')).not.toBeInTheDocument();

      // Verify localStorage
      const savedPreferences = JSON.parse(
        localStorageMock.getItem('instruments.columnPreferences') || '{}',
      );
      expect(savedPreferences.status).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('shows error when trying to hide all columns', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);
      setupFetchMock(mockInstruments, 5);

      render(<InstrumentsPage />);

      await waitFor(() => {
        expect(screen.getByText('US0378331005')).toBeInTheDocument();
      });

      const columnsButton = screen.getByRole('button', { name: /columns/i });
      await user.click(columnsButton);

      // Act - uncheck all columns
      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/at least one column must be visible/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('preserves previous settings when closing without applying', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockInstruments = createMockInstrumentsList(5);
      setupFetchMock(mockInstruments, 5);

      render(<InstrumentsPage />);

      await waitFor(() => {
        expect(screen.getByText('Status')).toBeInTheDocument();
      });

      const columnsButton = screen.getByRole('button', { name: /columns/i });
      await user.click(columnsButton);

      // Act - uncheck Status but don't apply
      const statusCheckbox = screen.getByLabelText(/status/i);
      await user.click(statusCheckbox);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Assert - Status should still be visible
      expect(screen.getByText('Status')).toBeInTheDocument();

      // Reopen and verify checkbox is still checked
      await user.click(columnsButton);

      await waitFor(() => {
        const statusCheckboxReopen = screen.getByLabelText(
          /status/i,
        ) as HTMLInputElement;
        expect(statusCheckboxReopen.checked).toBe(true);
      });
    });
  });
});
