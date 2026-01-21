/**
 * Integration Test: Instrument Betas Grid (Epic 5)
 *
 * Tests for Epic 5: Market Data Maintenance
 * Story covered: 5.10 (View Instrument Betas Grid)
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
import InstrumentBetasPage from '@/app/betas/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/betas',
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
const createMockBetas = (overrides = {}) => ({
  betas: [
    {
      id: 'beta-1',
      isin: 'US0378331005',
      instrumentName: 'Apple Inc.',
      beta: 1.24,
      benchmark: 'S&P 500',
      effectiveDate: '2024-01-20',
    },
    {
      id: 'beta-2',
      isin: 'US5949181045',
      instrumentName: 'Microsoft Corp.',
      beta: 1.15,
      benchmark: 'S&P 500',
      effectiveDate: '2024-01-19',
    },
    {
      id: 'beta-3',
      isin: 'US02079K1079',
      instrumentName: 'Alphabet Inc.',
      beta: 1.08,
      benchmark: 'NASDAQ 100',
      effectiveDate: '2024-01-18',
    },
  ],
  totalCount: 3,
  missingCount: 22,
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

describe.skip('Betas Grid - Story 5.10: View Instrument Betas Grid', () => {
  it('displays grid with required columns when page loads', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText('ISIN')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Benchmark')).toBeInTheDocument();
    expect(screen.getByText('Effective Date')).toBeInTheDocument();
  });

  it('displays beta data in the grid', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('1.24')).toBeInTheDocument();
    expect(screen.getByText('S&P 500')).toBeInTheDocument();
  });

  it('filters betas when searching by ISIN', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const searchBox = screen.getByRole('searchbox', {
      name: /search.*isin/i,
    });
    await user.type(searchBox, 'US5949181045');

    await waitFor(() => {
      expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument();
      expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
    });
  });

  it('displays beta details when clicking on a row', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const row = screen.getByText('US0378331005').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows "No beta data found" when no betas exist', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse({ betas: [], totalCount: 0, missingCount: 0 }),
    );
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText(/no beta data found/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load betas/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<InstrumentBetasPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });

  it('includes benchmark filter', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/benchmark/i)).toBeInTheDocument();
    });
  });

  it('filters betas by benchmark when filter is applied', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/benchmark/i)).toBeInTheDocument();
    });

    const benchmarkFilter = screen.getByLabelText(/benchmark/i);
    await user.click(benchmarkFilter);
    await user.type(benchmarkFilter, 'NASDAQ 100');

    const applyButton = screen.getByRole('button', { name: /apply filter/i });
    await user.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument();
      expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
    });
  });

  it('shows missing beta count at top', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText(/22.*missing/i)).toBeInTheDocument();
    });
  });

  it('displays beta values with decimal precision', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText('1.24')).toBeInTheDocument();
      expect(screen.getByText('1.15')).toBeInTheDocument();
      expect(screen.getByText('1.08')).toBeInTheDocument();
    });
  });

  it('formats effective date in readable format', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText(/01\/20\/24/i)).toBeInTheDocument();
    });
  });

  it('includes Add Beta button', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /add beta/i }),
      ).toBeInTheDocument();
    });
  });

  it('includes Export button', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /export/i }),
      ).toBeInTheDocument();
    });
  });

  it('sorts grid when column header is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    const betaHeader = screen.getByText('Beta');
    await user.click(betaHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('1.08');
    });
  });

  it('displays benchmark names correctly', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockBetas()));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeInTheDocument();
      expect(screen.getByText('NASDAQ 100')).toBeInTheDocument();
    });
  });

  it('shows multiple betas for same instrument with different benchmarks', async () => {
    const multipleBetas = {
      betas: [
        {
          id: 'beta-1',
          isin: 'US0378331005',
          instrumentName: 'Apple Inc.',
          beta: 1.24,
          benchmark: 'S&P 500',
          effectiveDate: '2024-01-20',
        },
        {
          id: 'beta-2',
          isin: 'US0378331005',
          instrumentName: 'Apple Inc.',
          beta: 1.18,
          benchmark: 'NASDAQ 100',
          effectiveDate: '2024-01-20',
        },
      ],
      totalCount: 2,
      missingCount: 0,
    };

    mockFetch.mockResolvedValue(createMockResponse(multipleBetas));
    render(<InstrumentBetasPage />);

    await waitFor(() => {
      const appleRows = screen.getAllByText('Apple Inc.');
      expect(appleRows.length).toBe(2);
    });
  });
});
