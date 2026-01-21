/**
 * Integration Test: Instrument Duration Form (Epic 5)
 *
 * Tests for Epic 5: Market Data Maintenance
 * Stories covered: 5.8 (Add Duration), 5.9 (Update Duration)
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
import AddDurationPage from '@/app/durations/add/page';
import EditDurationPage from '@/app/durations/[id]/edit/page';

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useParams: () => ({ id: 'dur-123' }),
  usePathname: () => '/durations/add',
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

describe.skip('Duration Form - Story 5.8: Add Instrument Duration', () => {
  it('displays form with all required fields when Add Duration is opened', async () => {
    render(<AddDurationPage />);

    expect(screen.getByLabelText(/isin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/effective date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ytm/i)).toBeInTheDocument();
  });

  it('marks required fields appropriately', () => {
    render(<AddDurationPage />);

    expect(screen.getByLabelText(/isin/i)).toBeRequired();
    expect(screen.getByLabelText(/effective date/i)).toBeRequired();
    expect(screen.getByLabelText(/duration/i)).toBeRequired();
    expect(screen.getByLabelText(/ytm/i)).toBeRequired();
  });

  it('shows success message when duration is added successfully', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        id: 'dur-new',
        isin: 'US0378331005',
        duration: 5.43,
        ytm: 3.25,
      }),
    );

    render(<AddDurationPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');
    await user.type(screen.getByLabelText(/duration/i), '5.43');
    await user.type(screen.getByLabelText(/ytm/i), '3.25');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/duration added successfully/i),
          variant: 'success',
        }),
      );
    });
  });

  it('records username in audit trail when duration is saved', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        id: 'dur-new',
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

    render(<AddDurationPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');
    await user.type(screen.getByLabelText(/duration/i), '5.43');
    await user.type(screen.getByLabelText(/ytm/i), '3.25');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/instrument-durations'),
        expect.objectContaining({
          headers: expect.objectContaining({
            LastChangedUser: expect.any(String),
          }),
        }),
      );
    });
  });

  it('shows error when duplicate (ISIN + Date) is entered', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({ error: 'Duration already exists' }, false, 409),
    );

    render(<AddDurationPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');
    await user.type(screen.getByLabelText(/duration/i), '5.43');
    await user.type(screen.getByLabelText(/ytm/i), '3.25');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/duration already exists/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for missing required fields', async () => {
    const user = userEvent.setup();
    render(<AddDurationPage />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/isin is required/i)).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('validates duration must be positive number', async () => {
    const user = userEvent.setup();
    render(<AddDurationPage />);

    await user.type(screen.getByLabelText(/duration/i), '-5.43');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/duration must be a positive number/i),
      ).toBeInTheDocument();
    });
  });

  it('allows negative YTM values (percentage can be negative)', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        id: 'dur-new',
        isin: 'US0378331005',
        ytm: -1.5,
      }),
    );

    render(<AddDurationPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');
    await user.type(screen.getByLabelText(/duration/i), '5.43');
    await user.type(screen.getByLabelText(/ytm/i), '-1.5');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should not show validation error for negative YTM
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
          { isin: 'XS1234567890', name: 'Corporate Bond ABC' },
        ],
      }),
    );

    render(<AddDurationPage />);

    await waitFor(() => {
      const isinSelect = screen.getByLabelText(/isin/i);
      expect(isinSelect).toBeInTheDocument();
    });
  });

  it('shows error message when API fails during save', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<AddDurationPage />);

    await user.type(screen.getByLabelText(/isin/i), 'US0378331005');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-20');
    await user.type(screen.getByLabelText(/duration/i), '5.43');
    await user.type(screen.getByLabelText(/ytm/i), '3.25');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/failed to add duration.*please try again/i),
      ).toBeInTheDocument();
    });
  });

  it('closes form without saving when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<AddDurationPage />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/durations'),
      );
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe.skip('Duration Form - Story 5.9: Update Instrument Duration', () => {
  const mockDuration = {
    id: 'dur-123',
    isin: 'US0378331005',
    instrumentName: 'Apple Inc.',
    duration: 5.43,
    ytm: 3.25,
    effectiveDate: '2024-01-20',
  };

  it('pre-fills form with current duration values when Edit is opened', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockDuration));

    render(<EditDurationPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('US0378331005')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5.43')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3.25')).toBeInTheDocument();
    });
  });

  it('disables ISIN field in edit mode (read-only)', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockDuration));

    render(<EditDurationPage />);

    await waitFor(() => {
      const isinInput = screen.getByLabelText(/isin/i);
      expect(isinInput).toBeDisabled();
    });
  });

  it('disables Effective Date field in edit mode (read-only)', async () => {
    mockFetch.mockResolvedValue(createMockResponse(mockDuration));

    render(<EditDurationPage />);

    await waitFor(() => {
      const dateInput = screen.getByLabelText(/effective date/i);
      expect(dateInput).toBeDisabled();
    });
  });

  it('shows success message when duration is updated', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockDuration))
      .mockResolvedValueOnce(
        createMockResponse({ ...mockDuration, duration: 5.5 }),
      );

    render(<EditDurationPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('5.43')).toBeInTheDocument();
    });

    const durationInput = screen.getByLabelText(/duration/i);
    await user.clear(durationInput);
    await user.type(durationInput, '5.5');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/duration updated successfully/i),
          variant: 'success',
        }),
      );
    });
  });

  it('records change in audit trail when duration is updated', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockDuration))
      .mockResolvedValueOnce(createMockResponse({ ...mockDuration }));

    render(<EditDurationPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('5.43')).toBeInTheDocument();
    });

    const durationInput = screen.getByLabelText(/duration/i);
    await user.clear(durationInput);
    await user.type(durationInput, '5.5');

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
      .mockResolvedValueOnce(createMockResponse(mockDuration))
      .mockRejectedValueOnce(new Error('Network error'));

    render(<EditDurationPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('5.43')).toBeInTheDocument();
    });

    const durationInput = screen.getByLabelText(/duration/i);
    await user.clear(durationInput);
    await user.type(durationInput, '5.5');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update/i)).toBeInTheDocument();
    });
  });

  it('includes optimistic concurrency check', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockDuration))
      .mockResolvedValueOnce(
        createMockResponse({ error: 'Concurrency conflict' }, false, 409),
      );

    render(<EditDurationPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('5.43')).toBeInTheDocument();
    });

    const durationInput = screen.getByLabelText(/duration/i);
    await user.clear(durationInput);
    await user.type(durationInput, '5.5');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/another user.*updated.*duration/i),
      ).toBeInTheDocument();
    });
  });

  it('allows updating duration and YTM fields', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce(createMockResponse(mockDuration))
      .mockResolvedValueOnce(createMockResponse({ ...mockDuration }));

    render(<EditDurationPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('5.43')).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/duration/i));
    await user.type(screen.getByLabelText(/duration/i), '5.5');

    await user.clear(screen.getByLabelText(/ytm/i));
    await user.type(screen.getByLabelText(/ytm/i), '3.5');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      const putCall = mockFetch.mock.calls.find(
        (call) => call[1]?.method === 'PUT',
      );
      const body = JSON.parse(putCall![1].body);
      expect(body.duration).toBe(5.5);
      expect(body.ytm).toBe(3.5);
    });
  });
});
