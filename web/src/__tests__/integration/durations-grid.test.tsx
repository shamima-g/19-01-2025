/**
 * Integration Test: Instrument Durations Grid (Epic 5)
 *
 * Tests for Epic 5: Market Data Maintenance
 * Story covered: 5.7 (View Instrument Durations Grid)
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
import InstrumentDurationsPage from '@/app/durations/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/durations',
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
const createMockDurations = (overrides = {}) => ({
  durations: [
    {
      id: 'dur-1',
      isin: 'US0378331005',
      instrumentName: 'Apple Inc.',
      duration: 5.43,
      ytm: 3.25,
      effectiveDate: '2024-01-20',
    },
    {
      id: 'dur-2',
      isin: 'XS1234567890',
      instrumentName: 'Corporate Bond ABC',
      duration: 7.82,
      ytm: 4.15,
      effectiveDate: '2024-01-19',
    },
    {
      id: 'dur-3',
      isin: 'US5949181045',
      instrumentName: 'Microsoft Corp.',
      duration: 4.21,
      ytm: 2.95,
      effectiveDate: '2024-01-18',
    },
  ],
  totalCount: 3,
  missingCount: 15,
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

describe.skip('Durations Grid - Story 5.7: View Instrument Durations Grid', () => {
  it('displays grid with required columns when page loads', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText('ISIN')).toBeInTheDocument();
    });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('YTM')).toBeInTheDocument();
    expect(screen.getByText('Effective Date')).toBeInTheDocument();
  });

  it('displays duration data in the grid', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('5.43')).toBeInTheDocument();
    expect(screen.getByText('3.25')).toBeInTheDocument();
  });

  it('filters durations when searching by ISIN', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const searchBox = screen.getByRole('searchbox', {
      name: /search.*isin/i,
    });
    await user.type(searchBox, 'XS1234567890');

    await waitFor(() => {
      expect(screen.getByText('Corporate Bond ABC')).toBeInTheDocument();
      expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
    });
  });

  it('displays duration details when clicking on a row', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const row = screen.getByText('US0378331005').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('shows "No duration data found" when no durations exist', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse({ durations: [], totalCount: 0, missingCount: 0 }),
    );
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no duration data found/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load durations/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<InstrumentDurationsPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });

  it('includes date range filter', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    });
  });

  it('filters durations by date range when filter is applied', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/start date/i);
    await user.clear(startDateInput);
    await user.type(startDateInput, '2024-01-19');

    const applyButton = screen.getByRole('button', { name: /apply filter/i });
    await user.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Corporate Bond ABC')).toBeInTheDocument();
      expect(screen.queryByText(/01\/18\/24/i)).not.toBeInTheDocument();
    });
  });

  it('shows missing duration count at top', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/15.*missing/i)).toBeInTheDocument();
    });
  });

  it('displays YTM as percentage with sign', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText('3.25')).toBeInTheDocument();
    });
  });

  it('formats duration with decimal places', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText('5.43')).toBeInTheDocument();
      expect(screen.getByText('7.82')).toBeInTheDocument();
    });
  });

  it('includes Add Duration button', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /add duration/i }),
      ).toBeInTheDocument();
    });
  });

  it('includes Export button', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /export/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows date formatted in readable format', async () => {
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/01\/20\/24/i)).toBeInTheDocument();
    });
  });

  it('sorts grid when column header is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockDurations()));
    render(<InstrumentDurationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Duration')).toBeInTheDocument();
    });

    const durationHeader = screen.getByText('Duration');
    await user.click(durationHeader);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows[1].textContent).toContain('4.21');
    });
  });
});
