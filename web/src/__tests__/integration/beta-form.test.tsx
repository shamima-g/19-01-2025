/**
 * Integration Test: Instrument Beta Form (Epic 5)
 *
 * Tests for Epic 5: Market Data Maintenance
 * Stories covered: 5.11 (Add Beta), 5.12 (Update Beta)
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
import AddBetaPage from '@/app/betas/add/page';
import EditBetaPage from '@/app/betas/[id]/edit/page';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useParams: () => ({ id: 'beta-123' }),
  usePathname: () => '/betas/add',
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

describe.skip('Beta Form - Story 5.11: Add Instrument Beta', () => {
  it('displays form with all required fields when Add Beta is opened', async () => {
    render(<AddBetaPage />);

    expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/benchmark/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/beta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/effective date/i)).toBeInTheDocument();
  });

  it('marks required fields appropriately', () => {
    render(<AddBetaPage />);

    expect(screen.getByLabelText(/isin/i)).toBeRequired();
    expect(screen.getByLabelText(/benchmark/i)).toBeRequired();
    expect(screen.getByLabelText(/beta/i)).toBeRequired();
    expect(screen.getByLabelText(/effective date/i)).toBeRequired();
  });

  it('shows success message when beta is added successfully', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        id: 'beta-new',
        isin: 'US0378331005',
        beta: 1.24,
        benchmark: 'S&P 500',
      }),
    );

    render(<AddBetaPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/benchmark/i), 'S&P 500');
    await user.type(screen.getByLabelText(/beta/i), '1.24');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/beta added successfully/i),
          variant: 'success',
        }),
      );
    });
  });

  it('records username in audit trail when beta is saved', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        id: 'beta-new',
        isin: 'US0378331005',
        auditTrail: [
          {
            date: '2024-01-20T10:30:00Z',
            user: 'john.smith',
            action: 'Created',
          },
        ],
      }),
    );

    render(<AddBetaPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/benchmark/i), 'S&P 500');
    await user.type(screen.getByLabelText(/beta/i), '1.24');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/instrument-betas'),
        expect.objectContaining({
          headers: expect.objectContaining({
            LastChangedUser: expect.any(String),
          }),
        }),
      );
    });
  });

  it('shows error when duplicate (ISIN + Benchmark + Date) is entered', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({ error: 'Beta already exists' }, false, 409),
    );

    render(<AddBetaPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/benchmark/i), 'S&P 500');
    await user.type(screen.getByLabelText(/beta/i), '1.24');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/beta already exists/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for missing required fields', async () => {
    const user = userEvent.setup();
    render(<AddBetaPage />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/isin is required/i)).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('validates beta value is within typical range (-3 to +3)', async () => {
    const user = userEvent.setup();
    render(<AddBetaPage />);

    await user.type(screen.getByLabelText(/beta/i), '5.0');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/beta must be between -3 and 3/i),
      ).toBeInTheDocument();
    });
  });

  it('allows negative beta values', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        id: 'beta-new',
        isin: 'US0378331005',
        beta: -0.5,
      }),
    );

    render(<AddBetaPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/benchmark/i), 'S&P 500');
    await user.type(screen.getByLabelText(/beta/i), '-0.5');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should not show validation error for negative beta
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  it('populates ISIN dropdown from Instruments table', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse({
        instruments: [
          { isin: 'US0378331005', name: 'Apple Inc.' },
          { isin: 'US5949181045', name: 'Microsoft Corp.' },
        ],
      }),
    );

    render(<AddBetaPage />);

    await waitFor(() => {
      const isinSelect = screen.getByLabelText(/isin/i);
      expect(isinSelect).toBeInTheDocument();
    });
  });

  it('populates Benchmark dropdown from Benchmarks table', async () => {
    mockFetch.mockResolvedValue(
      createMockResponse({
        benchmarks: ['S&P 500', 'NASDAQ 100', 'FTSE 100', 'DAX'],
      }),
    );

    render(<AddBetaPage />);

    await waitFor(() => {
      const benchmarkSelect = screen.getByLabelText(/benchmark/i);
      expect(benchmarkSelect).toBeInTheDocument();
    });
  });

  it('shows error message when API fails during save', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<AddBetaPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/benchmark/i), 'S&P 500');
    await user.type(screen.getByLabelText(/beta/i), '1.24');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/failed to add beta.*please try again/i),
      ).toBeInTheDocument();
    });
  });

  it('closes form without saving when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AddBetaPage />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/betas'));
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe.skip('Beta Form - Story 5.12: Update Instrument Beta', () => {
  const mockBeta = {
    id: 'beta-123',
    isin: 'US0378331005',
    instrumentName: 'Apple Inc.',
    beta: 1.24,
    benchmark: 'S&P 500',
    effectiveDate: '2024-01-20',
  };

  it('pre-fills form with current beta values when Edit is opened', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockBeta));

    render(<EditBetaPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('US0378331005')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1.24')).toBeInTheDocument();
      expect(screen.getByDisplayValue('S&P 500')).toBeInTheDocument();
    });
  });

  it('disables ISIN field in edit mode (read-only)', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockBeta));

    render(<EditBetaPage />);

    await waitFor(() => {
      const isinInput = screen.getByLabelText(/isin/i);
      expect(isinInput).toBeDisabled();
    });
  });

  it('disables Benchmark field in edit mode (read-only)', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockBeta));

    render(<EditBetaPage />);

    await waitFor(() => {
      const benchmarkInput = screen.getByLabelText(/benchmark/i);
      expect(benchmarkInput).toBeDisabled();
    });
  });

  it('disables Effective Date field in edit mode (read-only)', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockBeta));

    render(<EditBetaPage />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/effective date/i);
      expect(dateInput).toBeDisabled();
    });
  });

  it('shows success message when beta is updated', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockBeta))
      .mockResolvedValueOnce(createMockResponse({ ...mockBeta, beta: 1.3 }));

    render(<EditBetaPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('1.24')).toBeInTheDocument();
    });

    const betaInput = screen.getByLabelText(/beta/i);
    await user.clear(betaInput);
    await user.type(betaInput, '1.3');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/beta updated successfully/i),
          variant: 'success',
        }),
      );
    });
  });

  it('records change in audit trail when beta is updated', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockBeta))
      .mockResolvedValueOnce(createMockResponse({ ...mockBeta }));

    render(<EditBetaPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('1.24')).toBeInTheDocument();
    });

    const betaInput = screen.getByLabelText(/beta/i);
    await user.clear(betaInput);
    await user.type(betaInput, '1.3');

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
      .mockResolvedValueOnce(createMockResponse(mockBeta))
      .mockRejectedValueOnce(new Error('Network error'));

    render(<EditBetaPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('1.24')).toBeInTheDocument();
    });

    const betaInput = screen.getByLabelText(/beta/i);
    await user.clear(betaInput);
    await user.type(betaInput, '1.3');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update/i)).toBeInTheDocument();
    });
  });

  it('includes optimistic concurrency check', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockBeta))
      .mockResolvedValueOnce(
        createMockResponse({ error: 'Concurrency conflict' }, false, 409),
      );

    render(<EditBetaPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('1.24')).toBeInTheDocument();
    });

    const betaInput = screen.getByLabelText(/beta/i);
    await user.clear(betaInput);
    await user.type(betaInput, '1.3');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/another user.*updated.*beta/i),
      ).toBeInTheDocument();
    });
  });

  it('allows updating only beta value field', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockBeta))
      .mockResolvedValueOnce(createMockResponse({ ...mockBeta }));

    render(<EditBetaPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('1.24')).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/beta/i));
    await user.type(screen.getByLabelText(/beta/i), '1.3');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      const putCall = mockFetch.mock.calls.find(
        (call) => call[1]?.method === 'PUT',
      );
      const body = JSON.parse(putCall![1].body);
      expect(body.beta).toBe(1.3);
    });
  });

  it('validates updated beta value is within range', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(createMockResponse(mockBeta));

    render(<EditBetaPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('1.24')).toBeInTheDocument();
    });

    const betaInput = screen.getByLabelText(/beta/i);
    await user.clear(betaInput);
    await user.type(betaInput, '5.0');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/beta must be between -3 and 3/i),
      ).toBeInTheDocument();
    });
  });
});
