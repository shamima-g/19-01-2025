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

// Helper to create a paginated response for full audit trail
const createPaginatedResponse = (
  data: unknown[],
  total?: number,
  status = 200,
) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => ({ data, total: total ?? data.length }),
});

// Mock audit record factory - aligned with AuditRecord type
const createMockAuditRecord = (overrides: Record<string, unknown> = {}) => ({
  id: 'audit-001',
  holdingId: 'holding-001',
  timestamp: '2024-01-15T10:30:00Z',
  user: 'admin@example.com',
  action: 'Add',
  changes: [
    { field: 'amount', oldValue: null, newValue: '1000' },
    { field: 'currency', oldValue: null, newValue: 'USD' },
  ],
  ...overrides,
});

const createMockAuditList = (count: number) => {
  const actions = ['Add', 'Update', 'Delete'] as const;
  const users = [
    'admin@example.com',
    'user@example.com',
    'manager@example.com',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `audit-${String(i + 1).padStart(3, '0')}`,
    holdingId: `holding-${String(i + 1).padStart(3, '0')}`,
    timestamp: `2024-01-${String((i % 28) + 1).padStart(2, '0')}T10:${String(i % 60).padStart(2, '0')}:00Z`,
    user: users[i % 3],
    action: actions[i % 3],
    changes:
      actions[i % 3] === 'Update'
        ? [{ field: 'amount', oldValue: '1000', newValue: '1500' }]
        : [],
    portfolioCode: ['PORT-A', 'PORT-B', 'PORT-C'][i % 3],
    portfolioName: ['Portfolio A', 'Portfolio B', 'Portfolio C'][i % 3],
    instrumentDescription: ['Apple Inc', 'Microsoft Corp', 'Amazon.com'][i % 3],
  }));
};

describe('Custom Holding Audit - Story 6.5: View Holding Audit Trail', () => {
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

      // Assert - DialogTitle renders as h2
      await waitFor(() => {
        expect(screen.getByText('Audit Trail')).toBeInTheDocument();
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
        timestamp: '2024-01-15T10:30:00Z',
        user: 'admin@example.com',
        action: 'Update',
        changes: [
          { field: 'amount', oldValue: '1000', newValue: '1500' },
          { field: 'currency', oldValue: 'USD', newValue: 'EUR' },
        ],
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

      // Assert - date format varies by timezone, check for date pattern
      await waitFor(() => {
        expect(screen.getByText(/01\/15\/2024/)).toBeInTheDocument();
      });

      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
      // Changes are formatted as "field: oldValue → newValue"
      expect(screen.getByText(/amount: 1000 → 1500/)).toBeInTheDocument();
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
      const originalCreateObjectURL = global.URL.createObjectURL;
      const originalCreateElement = document.createElement.bind(document);

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
      global.URL.revokeObjectURL = vi.fn();
      const mockClick = vi.fn();
      const createElementSpy = vi.spyOn(document, 'createElement');
      createElementSpy.mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: mockClick,
          } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

      render(
        <CustomHoldingAuditDialog
          isOpen={true}
          holdingId="holding-001"
          holding={mockHolding}
          onClose={vi.fn()}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export to excel/i }),
        ).toBeInTheDocument();
      });

      // Act
      await user.click(
        screen.getByRole('button', { name: /export to excel/i }),
      );

      // Assert
      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });

      // Cleanup
      createElementSpy.mockRestore();
      global.URL.createObjectURL = originalCreateObjectURL;
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
        expect(screen.getByText(/no changes recorded/i)).toBeInTheDocument();
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
      // Arrange - mock server error with Database connection failed message
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

      // Assert - component shows "Database connection failed" for this specific error
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
      expect(
        screen.getByText(/loading audit trail\.\.\./i),
      ).toBeInTheDocument();
    });
  });
});

describe('Custom Holding Audit - Story 6.6: View Full Audit Trail', () => {
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
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
      ];

      // Mock fetch to handle different endpoints (order may vary)
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('audit-trail/full')) {
          return Promise.resolve(createPaginatedResponse(mockAuditRecords));
        }
        if (url.includes('portfolios')) {
          return Promise.resolve(createMockResponse(mockPortfolios));
        }
        // Log unexpected URL for debugging
        console.log('Unexpected fetch URL:', url);
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      // Act
      render(<CustomHoldingsFullAuditPage />);

      // Assert - Wait for table to load with column headers
      await waitFor(() => {
        expect(screen.getByText('Date')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Custom Holdings Audit Trail'),
      ).toBeInTheDocument();
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
        .mockResolvedValueOnce(createPaginatedResponse(mockAuditRecords))
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
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
      ];

      (global.fetch as Mock)
        .mockResolvedValueOnce(createPaginatedResponse(mockAuditRecords))
        .mockResolvedValueOnce(createMockResponse(mockPortfolios));

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
      const filteredRecords = mockAuditRecords.filter(
        (r) => r.portfolioCode === 'PORT-A',
      );

      // Track all fetch calls
      const fetchCalls: string[] = [];
      (global.fetch as Mock).mockImplementation((url: string) => {
        fetchCalls.push(url);
        if (
          url.includes('audit-trail/full') &&
          url.includes('portfolio=PORT-A')
        ) {
          return Promise.resolve(createPaginatedResponse(filteredRecords));
        }
        if (url.includes('audit-trail/full')) {
          return Promise.resolve(createPaginatedResponse(mockAuditRecords));
        }
        if (url.includes('portfolios')) {
          return Promise.resolve(createMockResponse(mockPortfolios));
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      render(<CustomHoldingsFullAuditPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /filter by portfolio/i }),
        ).toBeInTheDocument();
      });

      // Act
      const portfolioFilter = screen.getByRole('combobox', {
        name: /filter by portfolio/i,
      });
      await user.selectOptions(portfolioFilter, 'PORT-A');

      // Assert
      await waitFor(() => {
        expect(fetchCalls.some((url) => url.includes('portfolio=PORT-A'))).toBe(
          true,
        );
      });
    });

    it('filters audit records by date range', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockAuditRecords = createMockAuditList(10);
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
      ];

      (global.fetch as Mock)
        .mockResolvedValueOnce(createPaginatedResponse(mockAuditRecords))
        .mockResolvedValueOnce(createMockResponse(mockPortfolios))
        .mockResolvedValueOnce(
          createPaginatedResponse(mockAuditRecords.slice(0, 5)),
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
          expect.stringContaining('startDate=2024-01-01'),
          expect.anything(),
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('endDate=2024-01-15'),
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

      // Track all fetch calls
      const fetchCalls: string[] = [];
      (global.fetch as Mock).mockImplementation((url: string) => {
        fetchCalls.push(url);
        if (url.includes('audit-trail/full')) {
          return Promise.resolve(
            createPaginatedResponse(mockAuditRecords.slice(0, 3)),
          );
        }
        if (url.includes('portfolios')) {
          return Promise.resolve(createMockResponse(mockPortfolios));
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      render(<CustomHoldingsFullAuditPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /filter by portfolio/i }),
        ).toBeInTheDocument();
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
        expect(fetchCalls.some((url) => url.includes('portfolio=PORT-A'))).toBe(
          true,
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('shows empty state when no audit records are found', async () => {
      // Arrange
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
      ];

      (global.fetch as Mock)
        .mockResolvedValueOnce(createPaginatedResponse([]))
        .mockResolvedValueOnce(createMockResponse(mockPortfolios));

      // Act
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no audit records found/i)).toBeInTheDocument();
      });
    });

    it('shows empty state when filtered results return nothing', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockAuditRecords = createMockAuditList(5);
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
        { code: 'PORT-C', name: 'Portfolio C' },
      ];

      let filterApplied = false;
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('audit-trail/full')) {
          // Return empty results when PORT-C filter is applied
          if (url.includes('portfolio=PORT-C')) {
            filterApplied = true;
            return Promise.resolve(createPaginatedResponse([]));
          }
          return Promise.resolve(createPaginatedResponse(mockAuditRecords));
        }
        if (url.includes('portfolios')) {
          return Promise.resolve(createMockResponse(mockPortfolios));
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      render(<CustomHoldingsFullAuditPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /filter by portfolio/i }),
        ).toBeInTheDocument();
      });

      // Act
      await user.selectOptions(
        screen.getByRole('combobox', { name: /filter by portfolio/i }),
        'PORT-C',
      );

      // Assert
      await waitFor(() => {
        expect(filterApplied).toBe(true);
      });
      await waitFor(() => {
        expect(screen.getByText(/no audit records found/i)).toBeInTheDocument();
      });
    });

    it('displays pagination for large audit datasets', async () => {
      // Arrange
      const mockAuditRecords = createMockAuditList(10);
      const mockPortfolios = [
        { code: 'PORT-A', name: 'Portfolio A' },
        { code: 'PORT-B', name: 'Portfolio B' },
      ];

      // Mock fetch to handle different endpoints
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('audit-trail/full')) {
          // Return 10 records but indicate total of 50 for pagination
          return Promise.resolve(createPaginatedResponse(mockAuditRecords, 50));
        }
        if (url.includes('portfolios')) {
          return Promise.resolve(createMockResponse(mockPortfolios));
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      // Act
      render(<CustomHoldingsFullAuditPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /next/i }),
        ).toBeInTheDocument();
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
      // Arrange - all API calls return error
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('audit-trail/full')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              Messages: ['Database connection failed'],
            }),
          });
        }
        if (url.includes('portfolios')) {
          return Promise.resolve(createMockResponse([]));
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
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
      // Arrange - mock that never resolves for audit trail, but returns for portfolios
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('audit-trail/full')) {
          return new Promise(() => {}); // Never resolves
        }
        if (url.includes('portfolios')) {
          return Promise.resolve(createMockResponse([]));
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

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
