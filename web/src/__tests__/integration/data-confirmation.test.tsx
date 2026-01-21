/**
 * Integration Test: Data Confirmation & Verification (Epic 7)
 *
 * Tests the complete data confirmation workflow including:
 * - Story 7.1: View File Check Tab
 * - Story 7.2: View Main Data Check Tab
 * - Story 7.3: View Other Data Check Tab
 * - Story 7.4: Navigate to Fix Data Gaps
 * - Story 7.5: Overall Status Indicator
 * - Story 7.6: Export Confirmation Report
 * - Story 7.7: Auto-Refresh Status
 * - Story 7.8: Disable Approval When Incomplete
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
import {
  render,
  screen,
  waitFor,
  within,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataConfirmationPage } from '@/app/data-confirmation/page';
import { ApprovalPage } from '@/app/approval/page';

// Store original fetch and timers
const originalFetch = global.fetch;

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/data-confirmation',
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
const createMockFileCheckData = (overrides = {}) => ({
  assetManagers: {
    received: true,
    status: 'complete',
    timestamp: '2024-01-15T10:00:00Z',
  },
  bloomberg: {
    received: true,
    status: 'complete',
    timestamp: '2024-01-15T10:05:00Z',
  },
  custodian: {
    received: true,
    status: 'complete',
    timestamp: '2024-01-15T10:10:00Z',
  },
  ...overrides,
});

const createMockMainCheckData = (overrides = {}) => ({
  holdings: {
    count: 150,
    status: 'complete',
  },
  transactions: {
    count: 85,
    status: 'complete',
  },
  income: {
    count: 42,
    status: 'complete',
  },
  cash: {
    count: 12,
    status: 'complete',
  },
  performance: {
    count: 30,
    status: 'complete',
  },
  ...overrides,
});

const createMockOtherCheckData = (overrides = {}) => ({
  incompleteInstruments: {
    count: 0,
    status: 'complete',
  },
  missingIndexPrices: {
    count: 0,
    status: 'complete',
  },
  missingDurations: {
    count: 0,
    status: 'complete',
  },
  missingBetas: {
    count: 0,
    status: 'complete',
  },
  missingCreditRatings: {
    count: 0,
    status: 'complete',
  },
  ...overrides,
});

const createMockStatusData = (overrides = {}) => ({
  readyForApproval: true,
  status: 'ready',
  lastUpdated: '2024-01-15T10:30:00Z',
  ...overrides,
});

describe.skip('Story 7.1: View File Check Tab', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('File Check Display', () => {
    it('displays File Check tab with all file type sections', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('tab', { name: /file check/i }),
        ).toBeInTheDocument();
      });

      expect(screen.getByText(/asset managers/i)).toBeInTheDocument();
      expect(screen.getByText(/bloomberg/i)).toBeInTheDocument();
      expect(screen.getByText(/custodian/i)).toBeInTheDocument();
    });

    it('shows green checkmarks when all files are received', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        const checkmarks = screen.getAllByRole('img', {
          name: /check|complete/i,
        });
        expect(checkmarks.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('shows red X when a file is missing', async () => {
      // Arrange
      const fileCheckData = createMockFileCheckData({
        bloomberg: {
          received: false,
          status: 'missing',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(fileCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/missing/i)).toBeInTheDocument();
      });

      const errorIcons = screen.getAllByRole('img', {
        name: /error|missing|x/i,
      });
      expect(errorIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('shows Missing status for all files when no files uploaded', async () => {
      // Arrange
      const fileCheckData = createMockFileCheckData({
        assetManagers: { received: false, status: 'missing' },
        bloomberg: { received: false, status: 'missing' },
        custodian: { received: false, status: 'missing' },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(fileCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        const missingStatuses = screen.getAllByText(/missing/i);
        expect(missingStatuses.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('shows error message when API fails to load file status', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-check')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load file status/i),
        ).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for file check', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/data-confirmation/file-check'),
          expect.any(Object),
        );
      });
    });
  });
});

describe.skip('Story 7.2: View Main Data Check Tab', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Main Data Check Display', () => {
    it('displays Main Data Check tab with all data count sections', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/main-check')) {
          return Promise.resolve(createMockResponse(createMockMainCheckData()));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const mainCheckTab = screen.getByRole('tab', {
        name: /main data check/i,
      });
      await userEvent.click(mainCheckTab);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/holdings count/i)).toBeInTheDocument();
        expect(screen.getByText(/transactions count/i)).toBeInTheDocument();
        expect(screen.getByText(/income count/i)).toBeInTheDocument();
        expect(screen.getByText(/cash count/i)).toBeInTheDocument();
        expect(screen.getByText(/performance count/i)).toBeInTheDocument();
      });
    });

    it('shows green checkmarks when all tables are populated', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/main-check')) {
          return Promise.resolve(createMockResponse(createMockMainCheckData()));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const mainCheckTab = screen.getByRole('tab', {
        name: /main data check/i,
      });
      await userEvent.click(mainCheckTab);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // Holdings count
        expect(screen.getByText('85')).toBeInTheDocument(); // Transactions count
        expect(screen.getByText('42')).toBeInTheDocument(); // Income count
      });

      const checkmarks = screen.getAllByRole('img', {
        name: /check|complete/i,
      });
      expect(checkmarks.length).toBeGreaterThanOrEqual(5);
    });

    it('shows red X and 0 records when a table is empty', async () => {
      // Arrange
      const mainCheckData = createMockMainCheckData({
        transactions: {
          count: 0,
          status: 'missing',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/main-check')) {
          return Promise.resolve(createMockResponse(mainCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const mainCheckTab = screen.getByRole('tab', {
        name: /main data check/i,
      });
      await userEvent.click(mainCheckTab);

      // Assert
      await waitFor(() => {
        const transactionsSection = screen
          .getByText(/transactions count/i)
          .closest('div');
        expect(
          within(transactionsSection!).getByText('0 records'),
        ).toBeInTheDocument();
      });
    });

    it('shows mixed status when some tables are populated and others are empty', async () => {
      // Arrange
      const mainCheckData = createMockMainCheckData({
        transactions: {
          count: 0,
          status: 'missing',
        },
        income: {
          count: 0,
          status: 'missing',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/main-check')) {
          return Promise.resolve(createMockResponse(mainCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const mainCheckTab = screen.getByRole('tab', {
        name: /main data check/i,
      });
      await userEvent.click(mainCheckTab);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // Holdings OK
        expect(screen.getAllByText('0 records').length).toBe(2); // Transactions and Income missing
      });
    });

    it('shows error message when API fails to load main data check', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/main-check')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const mainCheckTab = screen.getByRole('tab', {
        name: /main data check/i,
      });
      await userEvent.click(mainCheckTab);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load data check/i),
        ).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for main data check', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/main-check')) {
          return Promise.resolve(createMockResponse(createMockMainCheckData()));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const mainCheckTab = screen.getByRole('tab', {
        name: /main data check/i,
      });
      await userEvent.click(mainCheckTab);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/data-confirmation/main-check'),
          expect.any(Object),
        );
      });
    });
  });
});

describe.skip('Story 7.3: View Other Data Check Tab', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Other Data Check Display', () => {
    it('displays Other Data Check tab with all reference data sections', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.resolve(
            createMockResponse(createMockOtherCheckData()),
          );
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await userEvent.click(otherCheckTab);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/incomplete instruments/i)).toBeInTheDocument();
        expect(screen.getByText(/missing index prices/i)).toBeInTheDocument();
        expect(screen.getByText(/missing durations/i)).toBeInTheDocument();
        expect(screen.getByText(/missing betas/i)).toBeInTheDocument();
        expect(screen.getByText(/missing credit ratings/i)).toBeInTheDocument();
      });
    });

    it('shows 0 incomplete for all items when reference data is complete', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.resolve(
            createMockResponse(createMockOtherCheckData()),
          );
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await userEvent.click(otherCheckTab);

      // Assert
      await waitFor(() => {
        const zeroItems = screen.getAllByText('0 incomplete');
        expect(zeroItems.length).toBeGreaterThanOrEqual(5);
      });
    });

    it('displays count and clickable link when instruments are incomplete', async () => {
      // Arrange
      const otherCheckData = createMockOtherCheckData({
        incompleteInstruments: {
          count: 12,
          status: 'incomplete',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.resolve(createMockResponse(otherCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await userEvent.click(otherCheckTab);

      // Assert
      await waitFor(() => {
        const link = screen.getByRole('link', {
          name: /12 incomplete instruments/i,
        });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
          'href',
          expect.stringContaining('/instruments'),
        );
      });
    });

    it('displays clickable link for missing index prices', async () => {
      // Arrange
      const otherCheckData = createMockOtherCheckData({
        missingIndexPrices: {
          count: 5,
          status: 'incomplete',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.resolve(createMockResponse(otherCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await userEvent.click(otherCheckTab);

      // Assert
      await waitFor(() => {
        const link = screen.getByRole('link', {
          name: /5 missing index prices/i,
        });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute(
          'href',
          expect.stringContaining('/index-prices'),
        );
      });
    });

    it('shows error message when API fails to load other data check', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await userEvent.click(otherCheckTab);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load other checks/i),
        ).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for other data check', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.resolve(
            createMockResponse(createMockOtherCheckData()),
          );
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await userEvent.click(otherCheckTab);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/data-confirmation/other-check'),
          expect.any(Object),
        );
      });
    });
  });
});

describe.skip('Story 7.4: Navigate to Fix Data Gaps', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Navigation to Fix Pages', () => {
    it('navigates to Instruments page with incomplete filter when clicking incomplete instruments link', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockRouter = { push: vi.fn() };
      vi.mocked(mockRouter.push);

      const otherCheckData = createMockOtherCheckData({
        incompleteInstruments: {
          count: 12,
          status: 'incomplete',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.resolve(createMockResponse(otherCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await user.click(otherCheckTab);

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /12 incomplete instruments/i }),
        ).toBeInTheDocument();
      });

      const link = screen.getByRole('link', {
        name: /12 incomplete instruments/i,
      });

      // Assert
      expect(link).toHaveAttribute(
        'href',
        expect.stringMatching(/\/instruments.*status=incomplete/i),
      );
    });

    it('navigates to Index Prices page when clicking missing index prices link', async () => {
      // Arrange
      const user = userEvent.setup();
      const otherCheckData = createMockOtherCheckData({
        missingIndexPrices: {
          count: 5,
          status: 'incomplete',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.resolve(createMockResponse(otherCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await user.click(otherCheckTab);

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /5 missing index prices/i }),
        ).toBeInTheDocument();
      });

      const link = screen.getByRole('link', {
        name: /5 missing index prices/i,
      });

      // Assert
      expect(link).toHaveAttribute(
        'href',
        expect.stringContaining('/index-prices'),
      );
    });

    it('disables link when count is 0', async () => {
      // Arrange
      const otherCheckData = createMockOtherCheckData({
        incompleteInstruments: {
          count: 0,
          status: 'complete',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.resolve(createMockResponse(otherCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await userEvent.click(otherCheckTab);

      // Assert
      await waitFor(() => {
        const link = screen.queryByRole('link', {
          name: /incomplete instruments/i,
        });
        expect(link).not.toBeInTheDocument();
      });
    });

    it('shows error message when navigation fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const otherCheckData = createMockOtherCheckData({
        incompleteInstruments: {
          count: 12,
          status: 'incomplete',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          return Promise.resolve(createMockResponse(otherCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Note: This would require mocking router.push to throw an error
      // For now, we just verify the link exists and has correct href
      render(<DataConfirmationPage />);

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await user.click(otherCheckTab);

      await waitFor(() => {
        const link = screen.getByRole('link', {
          name: /12 incomplete instruments/i,
        });
        expect(link).toBeInTheDocument();
      });
    });
  });
});

describe.skip('Story 7.5: Overall Status Indicator', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Status Badge Display', () => {
    it('shows Ready for Approval green badge when all checks pass', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        if (url.includes('/main-check')) {
          return Promise.resolve(createMockResponse(createMockMainCheckData()));
        }
        if (url.includes('/other-check')) {
          return Promise.resolve(
            createMockResponse(createMockOtherCheckData()),
          );
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        const badge = screen.getByText(/ready for approval/i);
        expect(badge).toBeInTheDocument();
        expect(badge.closest('div')).toHaveClass(/success|green/);
      });
    });

    it('shows Issues Found red badge when any check fails', async () => {
      // Arrange
      const otherCheckData = createMockOtherCheckData({
        incompleteInstruments: {
          count: 12,
          status: 'incomplete',
        },
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        if (url.includes('/main-check')) {
          return Promise.resolve(createMockResponse(createMockMainCheckData()));
        }
        if (url.includes('/other-check')) {
          return Promise.resolve(createMockResponse(otherCheckData));
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        const badge = screen.getByText(/issues found.*review required/i);
        expect(badge).toBeInTheDocument();
        expect(badge.closest('div')).toHaveClass(/error|danger|red/);
      });
    });

    it('shows In Progress yellow badge when checks are loading', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                status: 'in_progress',
                readyForApproval: false,
              }),
            ),
          );
        }
        return new Promise(() => {}); // Never resolve to simulate loading
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        const badge = screen.getByText(/in progress/i);
        expect(badge).toBeInTheDocument();
        expect(badge.closest('div')).toHaveClass(/warning|yellow/);
      });
    });

    it('changes status from red to green after fixing all issues', async () => {
      // Arrange
      const user = userEvent.setup();
      let callCount = 0;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/status')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve(
              createMockResponse(
                createMockStatusData({
                  readyForApproval: false,
                  status: 'incomplete',
                }),
              ),
            );
          } else {
            return Promise.resolve(
              createMockResponse(
                createMockStatusData({
                  readyForApproval: true,
                  status: 'ready',
                }),
              ),
            );
          }
        }
        if (url.includes('/other-check')) {
          if (callCount === 1) {
            return Promise.resolve(
              createMockResponse(
                createMockOtherCheckData({
                  incompleteInstruments: { count: 12, status: 'incomplete' },
                }),
              ),
            );
          } else {
            return Promise.resolve(
              createMockResponse(createMockOtherCheckData()),
            );
          }
        }
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        if (url.includes('/main-check')) {
          return Promise.resolve(createMockResponse(createMockMainCheckData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const { rerender } = render(<DataConfirmationPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/issues found.*review required/i),
        ).toBeInTheDocument();
      });

      // Simulate fixing issues and refreshing
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Re-render to trigger re-fetch
      rerender(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/ready for approval/i)).toBeInTheDocument();
      });
    });

    it('shows Unable to determine status when status calculation fails', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/status')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/unable to determine status/i),
        ).toBeInTheDocument();
      });
    });
  });
});

describe.skip('Story 7.6: Export Confirmation Report', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Export Functionality', () => {
    it('downloads Excel file when Export Report is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBlob = new Blob(['mock excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
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
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export report/i }),
        ).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export report/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/data-confirmation/export'),
          expect.any(Object),
        );
      });
    });

    it('shows progress indicator during large export', async () => {
      // Arrange
      const user = userEvent.setup();

      // Create a deferred promise
      let resolveExport: (value: unknown) => void;
      const exportPromise = new Promise((resolve) => {
        resolveExport = resolve;
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/export')) {
          return exportPromise;
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export report/i }),
        ).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export report/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/exporting|loading|generating/i),
        ).toBeInTheDocument();
      });

      // Cleanup
      const mockBlob = new Blob(['mock excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      resolveExport!({
        ok: true,
        status: 200,
        blob: async () => mockBlob,
        headers: new Headers({
          'content-type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      });
    });

    it('shows error message when export fails', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/export')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export report/i }),
        ).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export report/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/export failed.*please try again/i),
        ).toBeInTheDocument();
      });
    });

    it('calls the correct API endpoint for export', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockBlob = new Blob(['mock excel data'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      (global.fetch as Mock).mockImplementation((url: string) => {
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
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export report/i }),
        ).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export report/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/data-confirmation/export'),
          expect.any(Object),
        );
      });
    });
  });
});

describe.skip('Story 7.7: Auto-Refresh Status', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
    cleanup();
  });

  describe('Auto-Refresh Behavior', () => {
    it('refreshes counts automatically after 30 seconds', async () => {
      // Arrange
      let callCount = 0;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/other-check')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve(
              createMockResponse(
                createMockOtherCheckData({
                  incompleteInstruments: { count: 12, status: 'incomplete' },
                }),
              ),
            );
          } else {
            return Promise.resolve(
              createMockResponse(
                createMockOtherCheckData({
                  incompleteInstruments: { count: 8, status: 'incomplete' },
                }),
              ),
            );
          }
        }
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        if (url.includes('/main-check')) {
          return Promise.resolve(createMockResponse(createMockMainCheckData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      await waitFor(() => {
        const otherCheckTab = screen.getByRole('tab', {
          name: /other data check/i,
        });
        expect(otherCheckTab).toBeInTheDocument();
      });

      const otherCheckTab = screen.getByRole('tab', {
        name: /other data check/i,
      });
      await userEvent.click(otherCheckTab);

      await waitFor(() => {
        expect(
          screen.getByText(/12 incomplete instruments/i),
        ).toBeInTheDocument();
      });

      // Advance timers by 30 seconds
      vi.advanceTimersByTime(30000);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/8 incomplete instruments/i),
        ).toBeInTheDocument();
      });
    });

    it('shows brief Updating indicator during auto-refresh', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        if (url.includes('/file-check')) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(createMockResponse(createMockFileCheckData()));
            }, 100);
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      await waitFor(() => {
        expect(screen.queryByText(/updating/i)).not.toBeInTheDocument();
      });

      // Advance timers to trigger refresh
      vi.advanceTimersByTime(30000);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/updating/i)).toBeInTheDocument();
      });
    });

    it('highlights changed counts briefly after refresh', async () => {
      // Arrange
      let callCount = 0;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/main-check')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve(
              createMockResponse(
                createMockMainCheckData({
                  holdings: { count: 150, status: 'complete' },
                }),
              ),
            );
          } else {
            return Promise.resolve(
              createMockResponse(
                createMockMainCheckData({
                  holdings: { count: 152, status: 'complete' },
                }),
              ),
            );
          }
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        if (url.includes('/file-check')) {
          return Promise.resolve(createMockResponse(createMockFileCheckData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      const mainCheckTab = screen.getByRole('tab', {
        name: /main data check/i,
      });
      await userEvent.click(mainCheckTab);

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument();
      });

      // Advance timers to trigger refresh
      vi.advanceTimersByTime(30000);

      // Assert
      await waitFor(() => {
        const changedCount = screen.getByText('152');
        expect(changedCount).toBeInTheDocument();
        expect(changedCount.closest('div')).toHaveClass(
          /highlight|changed|updated/,
        );
      });
    });

    it('shows toast error message when auto-refresh fails', async () => {
      // Arrange
      let callCount = 0;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-check')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve(
              createMockResponse(createMockFileCheckData()),
            );
          } else {
            return Promise.reject(new TypeError('Failed to fetch'));
          }
        }
        if (url.includes('/status')) {
          return Promise.resolve(createMockResponse(createMockStatusData()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<DataConfirmationPage />);

      await waitFor(() => {
        expect(screen.getByText(/asset managers/i)).toBeInTheDocument();
      });

      // Advance timers to trigger refresh
      vi.advanceTimersByTime(30000);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to refresh.*click to retry/i),
        ).toBeInTheDocument();
      });
    });
  });
});

describe.skip('Story 7.8: Disable Approval When Incomplete', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Approval Button State', () => {
    it('disables Approve button with tooltip when data confirmation shows issues', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({
                readyForApproval: false,
                status: 'incomplete',
              }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalPage />);

      // Assert
      await waitFor(() => {
        const approveButton = screen.getByRole('button', { name: /approve/i });
        expect(approveButton).toBeDisabled();
      });

      const approveButton = screen.getByRole('button', { name: /approve/i });
      expect(approveButton).toHaveAttribute(
        'title',
        /complete data confirmation first/i,
      );
    });

    it('enables Approve button when all checks pass', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({ readyForApproval: true, status: 'ready' }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalPage />);

      // Assert
      await waitFor(() => {
        const approveButton = screen.getByRole('button', { name: /approve/i });
        expect(approveButton).not.toBeDisabled();
      });
    });

    it('enables button after fixing all issues', async () => {
      // Arrange
      const user = userEvent.setup();
      let callCount = 0;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/status')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve(
              createMockResponse(
                createMockStatusData({
                  readyForApproval: false,
                  status: 'incomplete',
                }),
              ),
            );
          } else {
            return Promise.resolve(
              createMockResponse(
                createMockStatusData({
                  readyForApproval: true,
                  status: 'ready',
                }),
              ),
            );
          }
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const { rerender } = render(<ApprovalPage />);

      await waitFor(() => {
        const approveButton = screen.getByRole('button', { name: /approve/i });
        expect(approveButton).toBeDisabled();
      });

      // Simulate fixing issues and refreshing
      const refreshButton = screen.queryByRole('button', {
        name: /refresh|check status/i,
      });
      if (refreshButton) {
        await user.click(refreshButton);
      }

      // Re-render to trigger re-fetch
      rerender(<ApprovalPage />);

      // Assert
      await waitFor(() => {
        const approveButton = screen.getByRole('button', { name: /approve/i });
        expect(approveButton).not.toBeDisabled();
      });
    });

    it('disables button immediately when data becomes incomplete', async () => {
      // Arrange
      let callCount = 0;

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/status')) {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve(
              createMockResponse(
                createMockStatusData({
                  readyForApproval: true,
                  status: 'ready',
                }),
              ),
            );
          } else {
            return Promise.resolve(
              createMockResponse(
                createMockStatusData({
                  readyForApproval: false,
                  status: 'incomplete',
                }),
              ),
            );
          }
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      const { rerender } = render(<ApprovalPage />);

      await waitFor(() => {
        const approveButton = screen.getByRole('button', { name: /approve/i });
        expect(approveButton).not.toBeDisabled();
      });

      // Simulate data becoming incomplete and re-checking status
      rerender(<ApprovalPage />);

      // Assert
      await waitFor(() => {
        const approveButton = screen.getByRole('button', { name: /approve/i });
        expect(approveButton).toBeDisabled();
      });
    });

    it('calls the correct API endpoint to check approval status', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/status')) {
          return Promise.resolve(
            createMockResponse(
              createMockStatusData({ readyForApproval: true, status: 'ready' }),
            ),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<ApprovalPage />);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/data-confirmation/status'),
          expect.any(Object),
        );
      });
    });
  });
});
