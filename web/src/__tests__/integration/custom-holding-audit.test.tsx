/**
 * Integration Test: Custom Holding Audit Trail (Stories 6.5, 6.6)
 *
 * Tests the Custom Holding Audit Trail functionality including:
 * - View audit trail for single holding
 * - View full audit trail for all holdings
 * - Filter by portfolio and date range
 * - Export to Excel
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
import { CustomHoldingAuditDialog } from '@/components/CustomHoldingAuditDialog';
import { CustomHoldingsFullAuditPage } from '@/components/CustomHoldingsFullAuditPage';

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

// Mock audit record factory
const createMockAuditRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 'audit-001',
  date: '2024-01-15T10:30:00Z',
  user: 'admin@example.com',
  action: 'Created',
  changes: {
    amount: { from: null, to: 1000 },
    currency: { from: null, to: 'USD' },
  },
  ...overrides,
});

const createMockAuditList = (count: number) => {
  const actions = ['Created', 'Updated', 'Deleted'];
  const users = ['admin@example.com', 'user@example.com', 'manager@example.com'];

  return Array.from({ length: count }, (_, i) => ({
    id: `audit-${String(i + 1).padStart(3, '0')}`,
    date: `2024-01-${String((i % 28) + 1).padStart(2, '0')}T10:${String(i % 60).padStart(2, '0')}:00Z`,
    user: users[i % 3],
    action: actions[i % 3],
    changes:
      actions[i % 3] === 'Updated'
        ? { amount: { from: 1000, to: 1500 } }
        : {},
    portfolioCode: ['PORT-A', 'PORT-B', 'PORT-C'][i % 3],
    isin: ['US0378331005', 'US5949181045', 'US02079K1079'][i % 3],
  }));
};

describe.skip('Custom Holding Audit - Story 6.5: View Holding Audit Trail', () => {
  const mockHolding = {
    id: 'holding-001',
    portfolioCode: 'PORT-A',
    isin: 'US0378331005',
  };

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Audit Trail Dialog', () => {
    it('opens audit trail dialog when Audit Trail is clicked', async () => {
      // Arrange
      const mockAuditRecords = createMockAuditList(3);

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockAuditRecords),
      );

      // Act
      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /audit trail/i }),
        ).toBeInTheDocument();
      });
    });

    it('displays all audit trail columns', async () => {
      // Arrange
      const mockAuditRecords = createMockAuditList(3);

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockAuditRecords),
      );

      // Act
      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Date')).toBeInTheDocument();
      });

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Changes')).toBeInTheDocument();
    });

    it('displays audit records with correct data', async () => {
      // Arrange
      const mockAuditRecord = createMockAuditRecord({
        date: '2024-01-15T10:30:00Z',
        user: 'admin@example.com',
        action: 'Updated',
        changes: {
          amount: { from: 1000, to: 1500 },
          currency: { from: 'USD', to: 'EUR' },
        },
      });

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse([mockAuditRecord]),
      );

      // Act
      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('01/15/2024 10:30')).toBeInTheDocument();
      });

      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.getByText(/amount.*1000.*1500/i)).toBeInTheDocument();
      expect(screen.getByText(/currency.*USD.*EUR/i)).toBeInTheDocument();
    });

    it('displays Export to Excel button', async () => {
      // Arrange
      const mockAuditRecords = createMockAuditList(3);

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockAuditRecords),
      );

      // Act
      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export to excel/i }),
        ).toBeInTheDocument();
      });
    });

    it('exports audit trail to Excel when button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockAuditRecords = createMockAuditList(3);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockAuditRecords))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          blob: async () => new Blob(['mock excel data']),
        });

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      const mockClick = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };
      vi.spyOn(document, 'createElement').mockReturnValue(
        mockLink as unknown as HTMLElement,
      );

      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export to excel/i }))
          .toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /export to excel/i }));

      // Assert
      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty state when no changes are recorded', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValueOnce(createMockResponse([]));

      // Act
      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no changes recorded/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error state when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch'),
      );

      // Act
      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load audit trail/i),
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
      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          /database connection failed/i,
        );
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner while fetching audit trail', async () => {
      // Arrange - mock that never resolves
      (global.fetch as Mock).mockImplementationOnce(
        () => new Promise(() => {}),
      );

      // Act
      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/loading audit trail\.\.\./i)).toBeInTheDocument();
    });
  });
});

describe.skip('Custom Holding Audit - Story 6.6: View Full Audit Trail', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Full Audit Page', () => {
    it('displays full audit page with all changes', async () => {
      // Arrange
      const mockAuditRecords = createMockAuditList(10);

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockAuditRecords),
      );

      // Act
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /custom holdings audit trail/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('ISIN')).toBeInTheDocument();
      expect(screen.getByText('Changes')).toBeInTheDocument();
    });

    it('displays portfolio filter dropdown', async () => {
      // Arrange
      const mockAuditRecords = createMockAuditList(5);
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
      ];

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockAuditRecords))
        .mockResolvedValueOnce(createMockResponse(mockPortfolios));

      // Act
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /filter by portfolio/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('All Portfolios')).toBeInTheDocument();
    });

    it('displays date range filter inputs', async () => {
      // Arrange
      const mockAuditRecords = createMockAuditList(5);

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockAuditRecords),
      );

      // Act
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters audit records by portfolio', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockAuditRecords = createMockAuditList(10);
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
      ];

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockAuditRecords))
        .mockResolvedValueOnce(createMockResponse(mockPortfolios))
        .mockResolvedValueOnce(
          createMockResponse(
            mockAuditRecords.filter((r) => r.portfolioCode === 'PORT-A'),
          ),
        );

      render(<CustomHoldingsFullAuditPage />);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /filter by portfolio/i }))
          .toBeInTheDocument();
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

    it('filters audit records by date range', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockAuditRecords = createMockAuditList(10);

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockAuditRecords))
        .mockResolvedValueOnce(
          createMockResponse(mockAuditRecords.slice(0, 5)),
        );

      render(<CustomHoldingsFullAuditPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
      });

      // Act
      await user.type(screen.getByLabelText(/from date/i), '2024-01-01');
      await user.type(screen.getByLabelText(/to date/i), '2024-01-15');

      // Apply filter button
      await user.click(screen.getByRole('button', { name: /apply filter/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('fromDate=2024-01-01'),
          expect.anything(),
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('toDate=2024-01-15'),
          expect.anything(),
        );
      });
    });

    it('combines portfolio and date range filters', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockAuditRecords = createMockAuditList(10);
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
      ];

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockAuditRecords))
        .mockResolvedValueOnce(createMockResponse(mockPortfolios))
        .mockResolvedValueOnce(createMockResponse(mockAuditRecords.slice(0, 3)));

      render(<CustomHoldingsFullAuditPage />);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /filter by portfolio/i }))
          .toBeInTheDocument();
      });

      // Act
      await user.selectOptions(
        screen.getByRole('combobox', { name: /filter by portfolio/i }),
        'PORT-A',
      );
      await user.type(screen.getByLabelText(/from date/i), '2024-01-01');
      await user.type(screen.getByLabelText(/to date/i), '2024-01-15');

      await user.click(screen.getByRole('button', { name: /apply filter/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/portfolio=PORT-A.*fromDate=2024-01-01/),
          expect.anything(),
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty state when no audit records are found', async () => {
      // Arrange
      (global.fetch as Mock).mockResolvedValueOnce(createMockResponse([]));

      // Act
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no audit records found/i),
        ).toBeInTheDocument();
      });
    });

    it('shows empty state when filtered results return nothing', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockAuditRecords = createMockAuditList(5);
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
      ];

      (global.fetch as Mock)
        .mockResolvedValueOnce(createMockResponse(mockAuditRecords))
        .mockResolvedValueOnce(createMockResponse(mockPortfolios))
        .mockResolvedValueOnce(createMockResponse([]));

      render(<CustomHoldingsFullAuditPage />);

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /filter by portfolio/i }))
          .toBeInTheDocument();
      });

      // Act
      await user.selectOptions(
        screen.getByRole('combobox', { name: /filter by portfolio/i }),
        'PORT-C',
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no audit records found/i),
        ).toBeInTheDocument();
      });
    });

    it('displays pagination for large audit datasets', async () => {
      // Arrange
      const mockAuditRecords = createMockAuditList(50);

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(mockAuditRecords.slice(0, 10)),
      );

      // Act
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      });

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
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load audit records/i),
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
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          /database connection failed/i,
        );
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner while fetching audit records', async () => {
      // Arrange - mock that never resolves
      (global.fetch as Mock).mockImplementationOnce(
        () => new Promise(() => {}),
      );

      // Act
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(
        screen.getByText(/loading audit records\.\.\./i),
      ).toBeInTheDocument();
    });
  });
});
