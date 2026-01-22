/**
 * Integration Test: Multi-Level Approval Workflow (Epic 8)
 *
 * Tests the complete multi-level approval workflow including:
 * - Story 8.1: View Level 1 Approval Page
 * - Story 8.2: Approve at Level 1
 * - Story 8.3: Reject at Level 1
 * - Story 8.4: View Level 2 Approval Page
 * - Story 8.5: Approve at Level 2
 * - Story 8.6: Reject at Level 2
 * - Story 8.7: View Level 3 Approval Page
 * - Story 8.8: Approve at Level 3
 * - Story 8.9: Reject at Level 3
 * - Story 8.10: View Approval History
 * - Story 8.11: View Comments
 * - Story 8.12: Add Approval Comment
 * - Story 8.13: View Batch Approval Logs
 * - Story 8.14: Export Approval Logs
 * - Story 8.15: Reject After Final Approval
 * - Story 8.16: Notification on Approval Action
 *
 * NOTE: Tests import components that don't exist yet (TDD red phase)
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
import { Level1ApprovalPage } from '@/app/approvals/level-1/page';
import { Level2ApprovalPage } from '@/app/approvals/level-2/page';
import { Level3ApprovalPage } from '@/app/approvals/level-3/page';
import { ApprovalHistoryModal } from '@/components/approvals/ApprovalHistoryModal';
import { CommentsSection } from '@/components/approvals/CommentsSection';
import { AddCommentModal } from '@/components/approvals/AddCommentModal';
import { ApprovalLogsPage } from '@/app/logs/approval-logs/page';
import { RejectFinalReportPage } from '@/app/approvals/reject-final/page';

// Store original fetch
const originalFetch = global.fetch;

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/approvals/level-1',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the toast context
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Helper to create a mock response
const createMockResponse = (data: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({ 'content-type': 'application/json' }),
  json: async () => data,
});

// Mock data factories
const createMockApprovalData = (level: 1 | 2 | 3, overrides = {}) => ({
  batchId: 'batch-2024-01-001',
  batchDate: '2024-01-31',
  status:
    level === 1 ? 'READY_FOR_L1' : level === 2 ? 'L1_APPROVED' : 'L2_APPROVED',
  overallStatus: 'Ready for Approval',
  dataSummary: {
    fileCount: 15,
    recordCount: 1250,
    portfolioCount: 8,
  },
  level1Approval:
    level >= 2
      ? {
          approver: 'john.smith@example.com',
          timestamp: '2024-01-31T09:00:00Z',
          status: 'APPROVED',
        }
      : null,
  level2Approval:
    level >= 3
      ? {
          approver: 'jane.doe@example.com',
          timestamp: '2024-01-31T14:30:00Z',
          status: 'APPROVED',
        }
      : null,
  ...overrides,
});

const createMockApprovalHistory = (overrides = {}) => ({
  history: [
    {
      level: 1,
      action: 'APPROVED',
      user: 'john.smith@example.com',
      timestamp: '2024-01-31T09:00:00Z',
      reason: null,
    },
    {
      level: 2,
      action: 'REJECTED',
      user: 'jane.doe@example.com',
      timestamp: '2024-01-31T14:00:00Z',
      reason: 'Holdings data discrepancy found in Portfolio X',
    },
    {
      level: 2,
      action: 'APPROVED',
      user: 'jane.doe@example.com',
      timestamp: '2024-01-31T16:30:00Z',
      reason: null,
    },
  ],
  ...overrides,
});

const createMockComments = (overrides = {}) => ({
  comments: [
    {
      id: 'comment-1',
      author: 'john.smith@example.com',
      timestamp: '2024-01-31T08:45:00Z',
      text: 'Verified all Bloomberg data files loaded correctly',
    },
    {
      id: 'comment-2',
      author: 'jane.doe@example.com',
      timestamp: '2024-01-31T14:15:00Z',
      text: 'Question: Why is Portfolio Y missing transaction data?',
    },
  ],
  ...overrides,
});

const createMockApprovalLogs = (overrides = {}) => ({
  logs: [
    {
      batchDate: '2024-01-31',
      level: 1,
      approver: 'john.smith@example.com',
      action: 'APPROVED',
      timestamp: '2024-01-31T09:00:00Z',
      reason: null,
    },
    {
      batchDate: '2024-01-31',
      level: 2,
      approver: 'jane.doe@example.com',
      action: 'APPROVED',
      timestamp: '2024-01-31T14:30:00Z',
      reason: null,
    },
    {
      batchDate: '2024-01-31',
      level: 3,
      approver: 'admin@example.com',
      action: 'APPROVED',
      timestamp: '2024-01-31T16:00:00Z',
      reason: null,
    },
  ],
  ...overrides,
});

describe('Story 8.1: View Level 1 Approval Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Level 1 Approval Page Display', () => {
    it('displays approval summary with batch date, status, and data summary', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/batch date.*2024-01-31/i)).toBeInTheDocument();
        expect(screen.getByText(/ready for approval/i)).toBeInTheDocument();
        expect(screen.getByText(/15.*files/i)).toBeInTheDocument();
        expect(screen.getByText(/1250.*records/i)).toBeInTheDocument();
      });
    });

    it('shows Approve and Reject buttons for Level 1 approver', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });
    });

    it('shows Access Denied message for non-Level 1 approvers', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1')) {
          return Promise.resolve(
            createMockResponse({ error: 'Access Denied' }, 403),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      });
    });

    it('shows error message when API fails to load approval data', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load approval data/i),
        ).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for Level 1 approval data', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/level1/'),
          expect.any(Object),
        );
      });
    });
  });
});

describe('Story 8.2: Approve at Level 1', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Level 1 Approval Action', () => {
    it('shows confirmation dialog when Approve button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/confirm approval for this batch/i),
        ).toBeInTheDocument();
      });
    });

    it('shows success message after confirming approval', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        if (url.includes('/approve')) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval successful/i),
        ).toBeInTheDocument();
      });
    });

    it('disables Approve button with tooltip when already approved', async () => {
      // Arrange
      const approvedData = createMockApprovalData(1, {
        status: 'L1_APPROVED',
        level1Approval: {
          approver: 'john.smith@example.com',
          timestamp: '2024-01-31T09:00:00Z',
          status: 'APPROVED',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1')) {
          return Promise.resolve(createMockResponse(approvedData));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      // Assert
      await waitFor(() => {
        const approveButton = screen.getByRole('button', { name: /approve/i });
        expect(approveButton).toBeDisabled();
      });

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent(/already approved/i);
    });

    it('shows error message when approval API fails', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        if (url.includes('/approve')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/approval failed.*try again/i),
        ).toBeInTheDocument();
      });
    });

    it('records username and timestamp in audit log after approval', async () => {
      // Arrange
      const user = userEvent.setup();
      let approvalCalled = false;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        if (url.includes('/approve')) {
          approvalCalled = true;
          return Promise.resolve(
            createMockResponse({
              success: true,
              auditLog: {
                user: 'john.smith@example.com',
                timestamp: '2024-01-31T09:00:00Z',
              },
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(approvalCalled).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/level1/'),
          expect.objectContaining({
            method: 'POST',
          }),
        );
      });
    });
  });
});

describe('Story 8.3: Reject at Level 1', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Level 1 Rejection Action', () => {
    it('shows rejection dialog with reason field when Reject button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });
    });

    it('shows success message after submitting rejection with reason', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/reject')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        if (url.includes('/reject')) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(reasonField, 'Holdings data discrepancy found');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/level 1 rejection recorded/i),
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when reason field is empty', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/rejection reason is required/i),
        ).toBeInTheDocument();
      });
    });

    it('updates batch status to L1_REJECTED after successful rejection', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/reject')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        if (url.includes('/reject')) {
          return Promise.resolve(
            createMockResponse({
              success: true,
              newStatus: 'L1_REJECTED',
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(reasonField, 'Data validation failed');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/level1/'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Data validation failed'),
          }),
        );
      });
    });

    it('shows error message when rejection API fails', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/reject')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        if (url.includes('/reject')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(reasonField, 'Test rejection reason');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/rejection failed.*try again/i),
        ).toBeInTheDocument();
      });
    });
  });
});

describe('Story 8.4: View Level 2 Approval Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Level 2 Approval Page Display', () => {
    it('displays report summary, Level 1 approval details, and portfolio checks', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/batch date.*2024-01-31/i)).toBeInTheDocument();
        expect(screen.getByText(/level 1 approval/i)).toBeInTheDocument();
        expect(
          screen.getByText(/john\.smith@example\.com/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/portfolio.*check/i)).toBeInTheDocument();
      });
    });

    it('shows Approve and Reject buttons when Level 1 is approved', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });
    });

    it('shows prerequisite message when Level 1 is not approved', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2')) {
          return Promise.resolve(
            createMockResponse(
              {
                error: 'Prerequisite not met',
                message: 'Level 1 approval required first',
              },
              400,
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval required first/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error message when API fails to load approval data', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load approval data/i),
        ).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for Level 2 approval data', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/level2/'),
          expect.any(Object),
        );
      });
    });
  });
});

describe('Story 8.5: Approve at Level 2', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Level 2 Approval Action', () => {
    it('shows confirmation dialog when Approve button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/confirm/i)).toBeInTheDocument();
      });
    });

    it('shows success message after confirming approval', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        if (url.includes('/approve')) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/level 2 approval successful/i),
        ).toBeInTheDocument();
      });
    });

    it('updates batch status to L2_APPROVED after approval', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        if (url.includes('/approve')) {
          return Promise.resolve(
            createMockResponse({
              success: true,
              newStatus: 'L2_APPROVED',
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/level2/'),
          expect.objectContaining({
            method: 'POST',
          }),
        );
      });
    });

    it('shows error message when approval fails', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        if (url.includes('/approve')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/approval failed/i)).toBeInTheDocument();
      });
    });
  });
});

describe('Story 8.6: Reject at Level 2', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Level 2 Rejection Action', () => {
    it('shows rejection dialog with reason field when Reject button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });
    });

    it('shows success message after submitting rejection with reason', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2') && !url.includes('/reject')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        if (url.includes('/reject')) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(reasonField, 'Portfolio data incomplete');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/level 2 rejection recorded/i),
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when reason is empty', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/rejection reason required/i),
        ).toBeInTheDocument();
      });
    });

    it('updates batch status to L2_REJECTED after successful rejection', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level2') && !url.includes('/reject')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(2)));
        }
        if (url.includes('/reject')) {
          return Promise.resolve(
            createMockResponse({
              success: true,
              newStatus: 'L2_REJECTED',
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level2ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(reasonField, 'Data verification failed');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/level2/'),
          expect.objectContaining({
            method: 'POST',
          }),
        );
      });
    });
  });
});

describe('Story 8.7: View Level 3 Approval Page', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Level 3 Approval Page Display', () => {
    it('displays full report summary, L1 and L2 approval details, and final checks', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/batch date.*2024-01-31/i)).toBeInTheDocument();
        expect(screen.getByText(/level 1 approval/i)).toBeInTheDocument();
        expect(screen.getByText(/level 2 approval/i)).toBeInTheDocument();
        expect(
          screen.getByText(/john\.smith@example\.com/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/jane\.doe@example\.com/i)).toBeInTheDocument();
      });
    });

    it('shows Approve and Reject buttons when Level 2 is approved', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });
    });

    it('shows prerequisite message when Level 2 is not approved', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3')) {
          return Promise.resolve(
            createMockResponse(
              {
                error: 'Prerequisite not met',
                message: 'Level 2 approval required first',
              },
              400,
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/level 2 approval required first/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error message when API fails to load', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for Level 3 approval data', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/level3/'),
          expect.any(Object),
        );
      });
    });
  });
});

describe('Story 8.8: Approve at Level 3 (Final)', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Level 3 Final Approval Action', () => {
    it('shows final approval confirmation dialog with warning text', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/this is final approval.*confirm/i),
        ).toBeInTheDocument();
      });
    });

    it('shows success message with batch complete indicator after confirmation', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        if (url.includes('/approve')) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/level 3 approval successful.*batch complete/i),
        ).toBeInTheDocument();
      });
    });

    it('updates batch status to APPROVED_FINAL after approval', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        if (url.includes('/approve')) {
          return Promise.resolve(
            createMockResponse({
              success: true,
              newStatus: 'APPROVED_FINAL',
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/level3/'),
          expect.objectContaining({
            method: 'POST',
          }),
        );
      });
    });

    it('shows error message when approval fails', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        if (url.includes('/approve')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/approval failed/i)).toBeInTheDocument();
      });
    });
  });
});

describe('Story 8.9: Reject at Level 3 (Final)', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Level 3 Rejection Action', () => {
    it('shows rejection dialog with reason field requiring minimum 20 characters', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
        expect(screen.getByText(/minimum 20 characters/i)).toBeInTheDocument();
      });
    });

    it('shows success message after submitting rejection with valid reason', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3') && !url.includes('/reject')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        if (url.includes('/reject')) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      // Use shorter reason (min 20 chars) to avoid timeout
      await user.type(reasonField, 'Data issues in reports');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/level 3 rejection recorded/i),
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when reason is too short', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(reasonField, 'Too short');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/minimum 20 characters required/i),
        ).toBeInTheDocument();
      });
    });

    it('updates batch status to L3_REJECTED after successful rejection', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3') && !url.includes('/reject')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        if (url.includes('/reject')) {
          return Promise.resolve(
            createMockResponse({
              success: true,
              newStatus: 'L3_REJECTED',
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      // Use shorter reason (min 20 chars) to avoid timeout
      await user.type(reasonField, 'Full review required now');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/level3/'),
          expect.objectContaining({
            method: 'POST',
          }),
        );
      });
    });
  });
});

describe('Story 8.10: View Approval History', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Approval History Display', () => {
    it('displays chronological list of approval actions when View History is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/history')) {
          return Promise.resolve(
            createMockResponse(createMockApprovalHistory()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /view history/i }),
        ).toBeInTheDocument();
      });

      const historyButton = screen.getByRole('button', {
        name: /view history/i,
      });
      await user.click(historyButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/level 1.*approved.*john\.smith/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/level 2.*rejected.*jane\.doe/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/level 2.*approved.*jane\.doe/i),
        ).toBeInTheDocument();
      });
    });

    it('displays level, action, user, timestamp, and reason for each history record', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/history')) {
          return Promise.resolve(
            createMockResponse(createMockApprovalHistory()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <ApprovalHistoryModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      // Assert - check for combined text patterns as rendered by the component
      await waitFor(() => {
        // The component renders "Level 1 approved by john.smith@example.com"
        expect(
          screen.getByText(/level 1 approved by john\.smith/i),
        ).toBeInTheDocument();
        // Check timestamp is present (may appear in multiple records)
        expect(screen.getAllByText(/2024-01-31/i).length).toBeGreaterThan(0);
        // Check for rejection reason from level 2 rejection
        expect(
          screen.getByText(/holdings data discrepancy/i),
        ).toBeInTheDocument();
      });
    });

    it('shows all rejection attempts when multiple rejections occurred', async () => {
      // Arrange
      const historyData = createMockApprovalHistory({
        history: [
          {
            level: 2,
            action: 'REJECTED',
            user: 'jane.doe@example.com',
            timestamp: '2024-01-31T14:00:00Z',
            reason: 'First rejection reason',
          },
          {
            level: 2,
            action: 'REJECTED',
            user: 'jane.doe@example.com',
            timestamp: '2024-01-31T15:00:00Z',
            reason: 'Second rejection reason',
          },
        ],
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/history')) {
          return Promise.resolve(createMockResponse(historyData));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <ApprovalHistoryModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/first rejection reason/i)).toBeInTheDocument();
        expect(
          screen.getByText(/second rejection reason/i),
        ).toBeInTheDocument();
      });
    });

    it('shows No approval actions recorded message when no history exists', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/history')) {
          return Promise.resolve(createMockResponse({ history: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <ApprovalHistoryModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no approval actions recorded/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error message when API fails to load history', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/history')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <ApprovalHistoryModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to load history/i)).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for approval history', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/history')) {
          return Promise.resolve(
            createMockResponse(createMockApprovalHistory()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <ApprovalHistoryModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approvals/batch-2024-01-001/history'),
          expect.any(Object),
        );
      });
    });
  });
});

describe('Story 8.11: View Report Comments', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Comments Display', () => {
    it('displays comments section with author, timestamp, and comment text', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/report-comments')) {
          return Promise.resolve(createMockResponse(createMockComments()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CommentsSection batchId="batch-2024-01-001" />);

      // Assert
      await waitFor(() => {
        // Check for author (may appear multiple times if multiple comments exist)
        expect(
          screen.getByText(/john\.smith@example\.com/i),
        ).toBeInTheDocument();
        // Multiple comments may have dates from the same day
        expect(screen.getAllByText(/2024-01-31/i).length).toBeGreaterThan(0);
        // Check for specific comment text
        expect(
          screen.getByText(/verified all bloomberg data/i),
        ).toBeInTheDocument();
      });
    });

    it('shows No comments added message when no comments exist', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/report-comments')) {
          return Promise.resolve(createMockResponse({ comments: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CommentsSection batchId="batch-2024-01-001" />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no comments added/i)).toBeInTheDocument();
      });
    });

    it('shows error message when API fails to load comments', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/report-comments')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CommentsSection batchId="batch-2024-01-001" />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load comments/i),
        ).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for comments', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/report-comments')) {
          return Promise.resolve(createMockResponse(createMockComments()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CommentsSection batchId="batch-2024-01-001" />);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(
            '/v1/report-comments?batchId=batch-2024-01-001',
          ),
          expect.any(Object),
        );
      });
    });
  });
});

describe('Story 8.12: Add Approval Comment', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Add Comment Functionality', () => {
    it('shows text field when Add Comment button is clicked', async () => {
      // Arrange & Act
      render(
        <AddCommentModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
      });
    });

    it('shows success message after saving comment', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/report-comments')) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <AddCommentModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
      });

      const commentField = screen.getByLabelText(/comment/i);
      await user.type(commentField, 'This is a test comment');

      const saveButton = screen.getByRole('button', { name: /save|submit/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/comment added successfully/i),
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when comment is empty', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(
        <AddCommentModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save|submit/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/comment cannot be empty/i),
        ).toBeInTheDocument();
      });
    });

    it('shows error message when API fails to save comment', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/report-comments')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <AddCommentModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
      });

      const commentField = screen.getByLabelText(/comment/i);
      await user.type(commentField, 'Test comment');

      const saveButton = screen.getByRole('button', { name: /save|submit/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to add comment/i)).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint to add comment', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/report-comments')) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <AddCommentModal
          batchId="batch-2024-01-001"
          isOpen={true}
          onClose={() => {}}
        />,
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
      });

      const commentField = screen.getByLabelText(/comment/i);
      await user.type(commentField, 'Test comment');

      const saveButton = screen.getByRole('button', { name: /save|submit/i });
      await user.click(saveButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/report-comments'),
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('Test comment'),
          }),
        );
      });
    });
  });
});

describe('Story 8.13: View Report Batch Approval Logs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Approval Logs Display', () => {
    it('displays approval logs with batch date, level, approver, action, timestamp, and reason', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse(createMockApprovalLogs()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalLogsPage />);

      // Assert - use getAllByText for elements that may appear multiple times
      await waitFor(() => {
        // Multiple logs may have the same date
        expect(screen.getAllByText(/2024-01-31/i).length).toBeGreaterThan(0);
        // Check for Level 1 entry
        expect(screen.getByText(/level 1/i)).toBeInTheDocument();
        // Check for approver email
        expect(
          screen.getByText(/john\.smith@example\.com/i),
        ).toBeInTheDocument();
        // Multiple logs may have APPROVED status
        expect(screen.getAllByText(/approved/i).length).toBeGreaterThan(0);
      });
    });

    it('filters logs by date range when filter is applied', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse(createMockApprovalLogs()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      });

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      await user.type(startDateInput, '2024-01-01');
      await user.type(endDateInput, '2024-01-31');

      const filterButton = screen.getByRole('button', {
        name: /filter|apply/i,
      });
      await user.click(filterButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('startDate=2024-01-01'),
          expect.any(Object),
        );
      });
    });

    it('shows No approval logs found message when no logs exist', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse({ logs: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalLogsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no approval logs found/i)).toBeInTheDocument();
      });
    });

    it('shows error message when API fails to load logs', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approval-logs')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalLogsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to load logs/i)).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for approval logs', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse(createMockApprovalLogs()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalLogsPage />);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approval-logs'),
          expect.any(Object),
        );
      });
    });
  });
});

describe('Story 8.14: Export Approval Logs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Export Functionality', () => {
    it('downloads Excel file when Export to Excel is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBlob = new Blob(['mock excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approval-logs') && !url.includes('/export')) {
          return Promise.resolve(createMockResponse(createMockApprovalLogs()));
        }
        if (url.includes('/export')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            blob: async () => mockBlob,
            headers: new Headers({
              'content-type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalLogsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export to excel/i }),
        ).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export to excel/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/approval-logs/export'),
          expect.any(Object),
        );
      });
    });

    it('exports only filtered records when filters are applied', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBlob = new Blob(['mock excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approval-logs') && !url.includes('/export')) {
          return Promise.resolve(createMockResponse(createMockApprovalLogs()));
        }
        if (url.includes('/export')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            blob: async () => mockBlob,
            headers: new Headers({
              'content-type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      });

      const startDateInput = screen.getByLabelText(/start date/i);
      await user.type(startDateInput, '2024-01-01');

      const exportButton = screen.getByRole('button', {
        name: /export to excel/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('startDate=2024-01-01'),
          expect.any(Object),
        );
      });
    });

    it('shows error message when export fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approval-logs') && !url.includes('/export')) {
          return Promise.resolve(createMockResponse(createMockApprovalLogs()));
        }
        if (url.includes('/export')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalLogsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export to excel/i }),
        ).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export to excel/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/export failed/i)).toBeInTheDocument();
      });
    });
  });
});

describe('Story 8.15: Reject After Final Approval', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Post-Approval Rejection', () => {
    it('displays fully approved batches in reject final reports list', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/reject-final')) {
          return Promise.resolve(
            createMockResponse({
              batches: [
                {
                  batchId: 'batch-2024-01-001',
                  batchDate: '2024-01-31',
                  status: 'APPROVED_FINAL',
                },
              ],
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<RejectFinalReportPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/2024-01-31/i)).toBeInTheDocument();
        expect(screen.getByText(/approved_final/i)).toBeInTheDocument();
      });
    });

    it('shows rejection dialog with required reason field when Reject is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/reject-final')) {
          return Promise.resolve(
            createMockResponse({
              batches: [
                {
                  batchId: 'batch-2024-01-001',
                  batchDate: '2024-01-31',
                  status: 'APPROVED_FINAL',
                },
              ],
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<RejectFinalReportPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
        expect(screen.getByText(/minimum 30 characters/i)).toBeInTheDocument();
      });
    });

    it('shows success message after submitting rejection with valid reason', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/reject-final') && url.includes('POST')) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        if (url.includes('/reject-final')) {
          return Promise.resolve(
            createMockResponse({
              batches: [
                {
                  batchId: 'batch-2024-01-001',
                  batchDate: '2024-01-31',
                  status: 'APPROVED_FINAL',
                },
              ],
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<RejectFinalReportPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(
        reasonField,
        'Critical post-approval issue discovered requiring full review and reprocessing',
      );

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/batch rejected.*returned to preparation/i),
        ).toBeInTheDocument();
      });
    });

    it('shows validation error when reason is too short', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/reject-final')) {
          return Promise.resolve(
            createMockResponse({
              batches: [
                {
                  batchId: 'batch-2024-01-001',
                  batchDate: '2024-01-31',
                  status: 'APPROVED_FINAL',
                },
              ],
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<RejectFinalReportPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(reasonField, 'Too short');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /minimum 30 characters required for post-approval rejection/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows error message when rejection fails', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation(
        (url: string, options?: RequestInit) => {
          // POST request to reject a specific batch should fail
          if (url.includes('/reject-final/') && options?.method === 'POST') {
            return Promise.reject(new TypeError('Failed to fetch'));
          }
          // GET request to list batches should succeed
          if (url.includes('/reject-final')) {
            return Promise.resolve(
              createMockResponse({
                batches: [
                  {
                    batchId: 'batch-2024-01-001',
                    batchDate: '2024-01-31',
                    status: 'APPROVED_FINAL',
                  },
                ],
              }),
            );
          }
          return Promise.reject(new Error('Unknown endpoint'));
        },
      );

      // Act
      render(<RejectFinalReportPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(
        reasonField,
        'Critical post-approval issue discovered requiring full review',
      );

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/rejection failed/i)).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for post-approval rejection', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (
          url.includes('/reject-final') &&
          url.includes('batch-2024-01-001')
        ) {
          return Promise.resolve(createMockResponse({ success: true }));
        }
        if (url.includes('/reject-final')) {
          return Promise.resolve(
            createMockResponse({
              batches: [
                {
                  batchId: 'batch-2024-01-001',
                  batchDate: '2024-01-31',
                  status: 'APPROVED_FINAL',
                },
              ],
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<RejectFinalReportPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(
        reasonField,
        'Critical post-approval issue discovered requiring full review',
      );

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(
            '/v1/approvals/reject-final/batch-2024-01-001',
          ),
          expect.objectContaining({
            method: 'POST',
          }),
        );
      });
    });
  });
});

describe('Story 8.16: Notifications on Approval Actions', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Notification System', () => {
    it('verifies notification is triggered after Level 1 approval', async () => {
      // Arrange
      const user = userEvent.setup();
      let notificationCalled = false;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        if (url.includes('/approve')) {
          notificationCalled = true;
          return Promise.resolve(
            createMockResponse({
              success: true,
              notificationSent: true,
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(notificationCalled).toBe(true);
      });
    });

    it('verifies notification is triggered after rejection', async () => {
      // Arrange
      const user = userEvent.setup();
      let notificationCalled = false;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/reject')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        if (url.includes('/reject')) {
          notificationCalled = true;
          return Promise.resolve(
            createMockResponse({
              success: true,
              notificationSent: true,
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /reject/i }),
        ).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /reject/i });
      await user.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      });

      const reasonField = screen.getByLabelText(/reason/i);
      await user.type(reasonField, 'Test rejection reason');

      const submitButton = screen.getByRole('button', {
        name: /submit|confirm/i,
      });
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(notificationCalled).toBe(true);
      });
    });

    it('verifies notification is triggered after final approval', async () => {
      // Arrange
      const user = userEvent.setup();
      let notificationCalled = false;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level3') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(3)));
        }
        if (url.includes('/approve')) {
          notificationCalled = true;
          return Promise.resolve(
            createMockResponse({
              success: true,
              notificationSent: true,
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level3ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(notificationCalled).toBe(true);
      });
    });

    it('ensures approval succeeds even when notification service fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/approvals/level1') && !url.includes('/approve')) {
          return Promise.resolve(createMockResponse(createMockApprovalData(1)));
        }
        if (url.includes('/approve')) {
          return Promise.resolve(
            createMockResponse({
              success: true,
              notificationFailed: true,
              message: 'Approval successful but notification failed',
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<Level1ApprovalPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /approve/i }),
        ).toBeInTheDocument();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      await user.click(approveButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /yes|confirm/i }),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', {
        name: /yes|confirm/i,
      });
      await user.click(confirmButton);

      // Assert - Approval should succeed even if notification fails
      await waitFor(() => {
        expect(
          screen.getByText(/level 1 approval successful/i),
        ).toBeInTheDocument();
      });
    });
  });
});
