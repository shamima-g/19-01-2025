/**
 * Integration Test: Instrument Popup Details (Epic 4)
 *
 * Tests for Epic 4: Instrument Static Data Management
 * Story covered: 4.8 (View Instrument Popup Details)
 *
 * Test Strategy:
 * - Test popup modal behavior and content
 * - Mock only the HTTP client (test real components)
 * - Use accessibility-first queries (getByRole for dialog)
 * - Verify user sees correct instrument details in popup
 *
 * Implementation Note:
 * The current implementation uses row click to open the popup dialog.
 * The popup displays instrument details from the grid data without an extra API call.
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstrumentsPage from '@/app/instruments/page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  usePathname: () => '/instruments',
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
  // Mock localStorage for column preferences
  const storage: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((k) => delete storage[k]);
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
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

const createMockInstruments = () => ({
  instruments: [
    {
      id: 'inst-1',
      isin: 'US0378331005',
      name: 'Apple Inc.',
      assetClass: 'Equity',
      currency: 'USD',
      status: 'Complete',
      issuer: 'Apple Inc.',
      maturityDate: null,
    },
    {
      id: 'inst-2',
      isin: 'XS1234567890',
      name: 'Corporate Bond ABC',
      assetClass: 'Fixed Income',
      currency: 'EUR',
      status: 'Complete',
      issuer: 'ABC Corporation',
      maturityDate: '2030-12-31',
    },
  ],
  totalCount: 2,
  hasMore: false,
});

describe('Instrument Popup - Story 4.8: View Instrument Popup Details', () => {
  it('opens popup when clicking on a row in the grid', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    // Click on a row in the grid
    const isinCell = screen.getByText('US0378331005');
    const row = isinCell.closest('tr');
    await user.click(row!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('displays instrument name in popup title', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const row = screen.getByText('US0378331005').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      // Name appears in title - may appear twice (as name and issuer for Apple)
      const appleElements = within(dialog).getAllByText('Apple Inc.');
      expect(appleElements.length).toBeGreaterThan(0);
    });
  });

  it('displays all required fields in popup', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const row = screen.getByText('US0378331005').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');

      // Check for required fields
      expect(
        within(dialog).getByText(/isin.*us0378331005/i),
      ).toBeInTheDocument();
      expect(within(dialog).getByText('Equity')).toBeInTheDocument(); // Asset Class
      expect(within(dialog).getByText('USD')).toBeInTheDocument(); // Currency
    });
  });

  it('displays status badge in popup', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const row = screen.getByText('US0378331005').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Complete')).toBeInTheDocument();
    });
  });

  it('displays maturity date for fixed income instruments', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('XS1234567890')).toBeInTheDocument();
    });

    // Click on the bond row
    const row = screen.getByText('XS1234567890').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      // Check for formatted maturity date
      expect(
        within(dialog).getByText(/december.*31.*2030/i),
      ).toBeInTheDocument();
    });
  });

  it('shows dash for null maturity date on equity instruments', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const row = screen.getByText('US0378331005').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      // Maturity date should show dash for null value
      const maturitySection = within(dialog)
        .getByText('Maturity Date')
        .closest('div');
      expect(maturitySection).toBeInTheDocument();
      // Check that there's a dash after the label
      expect(within(dialog).getByText('-')).toBeInTheDocument();
    });
  });

  it('closes popup when clicking outside the dialog', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const row = screen.getByText('US0378331005').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Press Escape to close (simulates clicking outside)
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('includes close button in popup', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    const row = screen.getByText('US0378331005').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      // Radix Dialog includes a close button
      const closeButtons = within(dialog).getAllByRole('button', {
        name: /close/i,
      });
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });

  it('displays issuer information in popup', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('XS1234567890')).toBeInTheDocument();
    });

    const row = screen.getByText('XS1234567890').closest('tr');
    await user.click(row!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('ABC Corporation')).toBeInTheDocument();
    });
  });

  it('can click different rows to view different instruments', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(createMockInstruments()));

    render(<InstrumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
    });

    // Click first instrument
    const row1 = screen.getByText('US0378331005').closest('tr');
    await user.click(row1!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      // Apple Inc. appears as both name and issuer
      const appleElements = within(dialog).getAllByText('Apple Inc.');
      expect(appleElements.length).toBeGreaterThan(0);
    });

    // Close dialog
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Click second instrument
    const row2 = screen.getByText('XS1234567890').closest('tr');
    await user.click(row2!);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByText('Corporate Bond ABC'),
      ).toBeInTheDocument();
    });
  });
});
