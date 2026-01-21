/**
 * Integration Test: Delete Custom Holding (Story 6.4)
 *
 * Tests the Delete Custom Holding functionality including:
 * - Confirmation dialog display
 * - Delete operation with confirmation
 * - Cancel operation
 * - Success/error states
 * - Audit trail recording
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
import { CustomHoldingDeleteDialog } from '@/components/CustomHoldingDeleteDialog';

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

describe('Delete Custom Holding - Story 6.4: Delete Custom Holding', () => {
  const mockHolding = {
    id: 'holding-001',
    portfolioCode: 'PORT-A',
    portfolioName: 'Portfolio A',
    isin: 'US0378331005',
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

  describe('Confirmation Dialog', () => {
    it('displays confirmation dialog when delete is triggered', () => {
      // Act
      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      expect(
        screen.getByRole('heading', { name: /delete custom holding/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/are you sure you want to delete this holding/i),
      ).toBeInTheDocument();
    });

    it('shows holding details in confirmation dialog', () => {
      // Act
      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      expect(screen.getByText('PORT-A')).toBeInTheDocument();
      expect(screen.getByText('US0378331005')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc. Common Stock')).toBeInTheDocument();
    });

    it('displays Yes, Delete and Cancel buttons', () => {
      // Act
      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      expect(
        screen.getByRole('button', { name: /yes, delete/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Happy Path - Delete Operation', () => {
    it('deletes holding when user confirms', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse({ success: true }, 200),
      );

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={mockOnSuccess}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /yes, delete/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/custom-holdings/holding-001'),
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });

    it('shows success message after deletion', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse({ success: true }, 200),
      );

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /yes, delete/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/holding deleted successfully/i),
        ).toBeInTheDocument();
      });
    });

    it('records username in audit trail when deleting', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse({ success: true }, 200),
      );

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /yes, delete/i }));

      // Assert
      await waitFor(() => {
        const lastCall = (global.fetch as Mock).mock.calls[0];
        expect(lastCall[1].headers.LastChangedUser).toBeDefined();
      });
    });

    it('closes dialog after successful deletion', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse({ success: true }, 200),
      );

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={mockOnClose}
          onSuccess={vi.fn()}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /yes, delete/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Cancel Operation', () => {
    it('closes dialog when Cancel is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={mockOnClose}
          onSuccess={vi.fn()}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Assert
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not delete holding when Cancel is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Assert
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when deletion fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch'),
      );

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /yes, delete/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to delete\. please try again\./i),
        ).toBeInTheDocument();
      });
    });

    it('shows API error message when server returns error', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          Messages: ['Database connection failed'],
        }),
      });

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /yes, delete/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/database connection failed/i),
        ).toBeInTheDocument();
      });
    });

    it('keeps dialog open when deletion fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      (global.fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={mockOnClose}
          onSuccess={vi.fn()}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /yes, delete/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to delete\. please try again\./i),
        ).toBeInTheDocument();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows Deleting... text and disables buttons during deletion', async () => {
      // Arrange
      const user = userEvent.setup();

      // Create a deferred promise
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as Mock).mockReturnValueOnce(fetchPromise);

      render(
        <CustomHoldingDeleteDialog
          isOpen={true}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Act
      await user.click(screen.getByRole('button', { name: /yes, delete/i }));

      // Assert - should show loading state
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /deleting\.\.\./i }),
        ).toBeDisabled();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();

      // Resolve to clean up
      resolveFetch!(createMockResponse({ success: true }, 200));
    });
  });

  describe('Dialog Not Open', () => {
    it('does not render dialog when isOpen is false', () => {
      // Act
      render(
        <CustomHoldingDeleteDialog
          isOpen={false}
          holding={mockHolding}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />,
      );

      // Assert
      expect(
        screen.queryByRole('heading', { name: /delete custom holding/i }),
      ).not.toBeInTheDocument();
    });
  });
});
