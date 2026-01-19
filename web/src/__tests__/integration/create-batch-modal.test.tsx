/**
 * Integration Test: Create New Report Batch (Story 1.2)
 *
 * Tests the Create Batch modal functionality including:
 * - Form rendering and validation
 * - Batch creation with month/year selection
 * - Auto-import SFTP checkbox
 * - Modal interaction (open/close/cancel)
 * - Loading and error states
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
import { CreateBatchModal } from '@/components/CreateBatchModal';

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

describe('Create Batch Modal - Story 1.2', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Happy Path', () => {
    it('opens modal when isOpen is true', async () => {
      // Arrange & Act
      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Assert
      expect(
        screen.getByRole('heading', { name: /create new report batch/i }),
      ).toBeInTheDocument();
    });

    it('displays all form fields in the modal', async () => {
      // Arrange & Act
      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Assert
      expect(screen.getByLabelText(/month/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/year/i)).toBeInTheDocument();
      expect(screen.getByText(/auto-import from sftp/i)).toBeInTheDocument();
    });

    it('creates batch successfully with valid data', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(
          {
            id: 'batch-001',
            month: 'January',
            year: 2024,
            status: 'Pending',
          },
          201,
        ),
      );

      render(
        <CreateBatchModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      // Act - select month and year using native selects
      const monthSelect = screen.getByLabelText(/month/i);
      const yearSelect = screen.getByLabelText(/year/i);

      await user.selectOptions(monthSelect, 'January');
      await user.selectOptions(yearSelect, '2024');

      await user.click(screen.getByRole('button', { name: /create batch/i }));

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/report-batches'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            month: 'January',
            year: 2024,
            autoImport: false,
          }),
        }),
      );
    });

    it('creates batch with Pending status when auto-import is disabled', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(
          {
            id: 'batch-001',
            month: 'February',
            year: 2024,
            status: 'Pending',
          },
          201,
        ),
      );

      render(
        <CreateBatchModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      // Act
      const monthSelect = screen.getByLabelText(/month/i);
      const yearSelect = screen.getByLabelText(/year/i);

      await user.selectOptions(monthSelect, 'February');
      await user.selectOptions(yearSelect, '2024');

      await user.click(screen.getByRole('button', { name: /create batch/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            body: expect.stringContaining('"autoImport":false'),
          }),
        );
      });
    });

    it('creates batch with auto-import enabled when checkbox is checked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockResolvedValueOnce(
        createMockResponse(
          {
            id: 'batch-001',
            month: 'January',
            year: 2024,
            status: 'In Progress',
          },
          201,
        ),
      );

      render(
        <CreateBatchModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />,
      );

      // Act
      const monthSelect = screen.getByLabelText(/month/i);
      const yearSelect = screen.getByLabelText(/year/i);

      await user.selectOptions(monthSelect, 'January');
      await user.selectOptions(yearSelect, '2024');

      // Check the auto-import checkbox
      await user.click(screen.getByRole('checkbox'));

      await user.click(screen.getByRole('button', { name: /create batch/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            body: expect.stringContaining('"autoImport":true'),
          }),
        );
      });
    });
  });

  describe('Form Validation', () => {
    it('shows error when batch for selected month/year already exists', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          Messages: ['A batch for January 2024 already exists'],
        }),
      });

      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Act
      const monthSelect = screen.getByLabelText(/month/i);
      const yearSelect = screen.getByLabelText(/year/i);

      await user.selectOptions(monthSelect, 'January');
      await user.selectOptions(yearSelect, '2024');

      await user.click(screen.getByRole('button', { name: /create batch/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/a batch for january 2024 already exists/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Modal Interaction', () => {
    it('closes modal when Cancel button is clicked with no changes', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Act - click cancel without making changes
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Assert
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('shows confirmation dialog when closing with unsaved changes', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Act - make changes by checking auto-import
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/are you sure\? unsaved changes will be lost\./i),
        ).toBeInTheDocument();
      });
    });

    it('closes modal after confirming discard changes', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Make changes by checking auto-import
      await user.click(screen.getByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/are you sure\? unsaved changes will be lost\./i),
        ).toBeInTheDocument();
      });

      // Act
      await user.click(
        screen.getByRole('button', { name: /yes, discard changes/i }),
      );

      // Assert
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Dropdown Options', () => {
    it('displays all 12 months in the dropdown', async () => {
      // Arrange & Act
      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      const monthSelect = screen.getByLabelText(/month/i);
      const options = monthSelect.querySelectorAll('option');

      // Assert - all 12 months
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      expect(options.length).toBe(12);
      months.forEach((month) => {
        expect(screen.getByRole('option', { name: month })).toBeInTheDocument();
      });
    });

    it('displays a range of years in the dropdown', async () => {
      // Arrange & Act
      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      const yearSelect = screen.getByLabelText(/year/i);
      const options = yearSelect.querySelectorAll('option');

      // Assert - has multiple year options
      expect(options.length).toBe(7);
    });

    it('defaults to current month and year', async () => {
      // Arrange & Act
      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      const monthSelect = screen.getByLabelText(/month/i) as HTMLSelectElement;
      const yearSelect = screen.getByLabelText(/year/i) as HTMLSelectElement;

      // Assert - has a value selected (current month/year)
      expect(monthSelect.value).toBeTruthy();
      expect(yearSelect.value).toBeTruthy();
    });
  });

  describe('Auto-Import Checkbox', () => {
    it('shows helper text when auto-import is checked', async () => {
      // Arrange
      const user = userEvent.setup();

      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Act
      await user.click(screen.getByRole('checkbox'));

      // Assert
      expect(
        screen.getByText(
          /files will be imported automatically from configured sftp server/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when API is unavailable', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch'),
      );

      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Act
      await user.click(screen.getByRole('button', { name: /create batch/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /unable to create batch\. please try again later\./i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows API error message when server returns 500', async () => {
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

      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Act
      await user.click(screen.getByRole('button', { name: /create batch/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/database connection failed/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows Creating... text and disables button during creation', async () => {
      // Arrange
      const user = userEvent.setup();

      // Create a deferred promise
      let resolveFetch: (value: unknown) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      (global.fetch as Mock).mockReturnValueOnce(fetchPromise);

      render(<CreateBatchModal isOpen={true} onClose={mockOnClose} />);

      // Act
      await user.click(screen.getByRole('button', { name: /create batch/i }));

      // Assert - should show loading state
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /creating\.\.\./i }),
        ).toBeDisabled();
      });

      // Resolve to clean up
      resolveFetch!(
        createMockResponse(
          { id: 'batch-001', month: 'January', year: 2024 },
          201,
        ),
      );
    });
  });
});
