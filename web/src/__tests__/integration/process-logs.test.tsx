/**
 * Integration Test: Monthly Process Monitoring & Logs (Epic 9)
 *
 * Tests the complete process monitoring and logging functionality including:
 * - Story 9.1: View File Process Logs
 * - Story 9.2: Download Processed File
 * - Story 9.3: View File Faults
 * - Story 9.4: Export File Faults
 * - Story 9.5: View Weekly Process Logs
 * - Story 9.6: View User Audit Trail
 * - Story 9.7: Export Weekly Process Logs
 * - Story 9.8: View Monthly Process Logs
 * - Story 9.9: Search Process Logs
 * - Story 9.10: Export Monthly Process Logs
 * - Story 9.11: View Calculation Logs
 * - Story 9.12: View Calculation Errors
 * - Story 9.13: Filter Logs by Status
 * - Story 9.14: View Detailed Log Entry
 *
 * NOTE: Tests are skipped until components are implemented (TDD red phase)
 * All 14 stories have failing tests ready for implementation.
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

// NOTE: Component mocks removed - components don't exist yet
// Tests are skipped until Epic 9 implementation begins
// When implementing, remove .skip from describe blocks and add actual imports

// Type definitions for mocked components (actual imports removed until implementation)
// When implementing Epic 9, replace these with actual component imports
type FileProcessLogsPageComponent = React.FC;
type FileFaultsPageComponent = React.FC;
type WeeklyProcessLogsPageComponent = React.FC;
type MonthlyProcessLogsPageComponent = React.FC;
type CalculationLogsPageComponent = React.FC;
type CalculationErrorsPageComponent = React.FC;
type LogDetailsModalProps = {
  logId: string;
  isOpen: boolean;
  onClose: () => void;
};
type FileDownloadButtonProps = {
  fileId: string;
  fileName: string;
  onDownloadComplete?: () => void;
};
type UserAuditTrailGridProps = { batchDate: string };

// Placeholder component references (tests are skipped until implementation)
// These will be replaced with actual imports when Epic 9 is implemented
const FileProcessLogsPage: FileProcessLogsPageComponent = () => null;
const FileFaultsPage: FileFaultsPageComponent = () => null;
const WeeklyProcessLogsPage: WeeklyProcessLogsPageComponent = () => null;
const MonthlyProcessLogsPage: MonthlyProcessLogsPageComponent = () => null;
const CalculationLogsPage: CalculationLogsPageComponent = () => null;
const CalculationErrorsPage: CalculationErrorsPageComponent = () => null;
const LogDetailsModal: React.FC<LogDetailsModalProps> = () => null;
const FileDownloadButton: React.FC<FileDownloadButtonProps> = () => null;
const UserAuditTrailGrid: React.FC<UserAuditTrailGridProps> = () => null;

// Store original fetch
const originalFetch = global.fetch;

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/logs/file-process',
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

// Mock blob response for downloads
const createMockBlobResponse = (status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: new Headers({
    'content-type':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }),
  blob: async () =>
    new Blob(['mock file content'], { type: 'application/octet-stream' }),
});

// Mock data factories
const createMockFileProcessLogs = (overrides = {}) => ({
  logs: [
    {
      id: 'file-1',
      fileName: 'bloomberg_positions_2024-01-31.csv',
      fileType: 'BLOOMBERG',
      status: 'SUCCESS',
      uploadDate: '2024-01-31T08:00:00Z',
      processedDate: '2024-01-31T08:05:00Z',
      recordsCount: 1250,
      errorCount: 0,
      batchDate: '2024-01-31',
    },
    {
      id: 'file-2',
      fileName: 'custodian_holdings_2024-01-31.xlsx',
      fileType: 'CUSTODIAN',
      status: 'FAILED',
      uploadDate: '2024-01-31T08:10:00Z',
      processedDate: '2024-01-31T08:12:00Z',
      recordsCount: 0,
      errorCount: 5,
      batchDate: '2024-01-31',
    },
    {
      id: 'file-3',
      fileName: 'nav_data_2024-01-31.csv',
      fileType: 'NAV',
      status: 'WARNING',
      uploadDate: '2024-01-31T08:15:00Z',
      processedDate: '2024-01-31T08:18:00Z',
      recordsCount: 500,
      errorCount: 2,
      batchDate: '2024-01-31',
    },
  ],
  totalCount: 3,
  ...overrides,
});

const createMockFileFaults = (overrides = {}) => ({
  faults: [
    {
      id: 'fault-1',
      fileName: 'custodian_holdings_2024-01-31.xlsx',
      rowNumber: 45,
      column: 'Quantity',
      errorMessage: 'Invalid numeric value: "N/A"',
      timestamp: '2024-01-31T08:12:01Z',
      severity: 'ERROR',
    },
    {
      id: 'fault-2',
      fileName: 'custodian_holdings_2024-01-31.xlsx',
      rowNumber: 89,
      column: 'SecurityID',
      errorMessage: 'Missing required field',
      timestamp: '2024-01-31T08:12:02Z',
      severity: 'ERROR',
    },
    {
      id: 'fault-3',
      fileName: 'nav_data_2024-01-31.csv',
      rowNumber: 15,
      column: 'NAV',
      errorMessage: 'Value exceeds threshold',
      timestamp: '2024-01-31T08:18:01Z',
      severity: 'WARNING',
    },
  ],
  totalCount: 3,
  ...overrides,
});

const createMockWeeklyProcessLogs = (overrides = {}) => ({
  logs: [
    {
      id: 'process-1',
      processName: 'Bloomberg Data Import',
      startTime: '2024-01-31T08:00:00Z',
      endTime: '2024-01-31T08:05:00Z',
      duration: 300,
      status: 'SUCCESS',
      errorCount: 0,
    },
    {
      id: 'process-2',
      processName: 'Custodian File Validation',
      startTime: '2024-01-31T08:10:00Z',
      endTime: '2024-01-31T08:12:00Z',
      duration: 120,
      status: 'FAILED',
      errorCount: 5,
    },
    {
      id: 'process-3',
      processName: 'NAV Calculation',
      startTime: '2024-01-31T08:15:00Z',
      endTime: '2024-01-31T08:20:00Z',
      duration: 300,
      status: 'WARNING',
      errorCount: 2,
    },
  ],
  batchDate: '2024-01-31',
  ...overrides,
});

const createMockUserAuditTrail = (overrides = {}) => ({
  entries: [
    {
      id: 'audit-1',
      user: 'john.smith@example.com',
      action: 'APPROVE',
      entity: 'ReportBatch',
      entityId: 'batch-2024-01-001',
      timestamp: '2024-01-31T09:00:00Z',
      details: 'Approved Level 1 for batch 2024-01-31',
    },
    {
      id: 'audit-2',
      user: 'jane.doe@example.com',
      action: 'UPDATE',
      entity: 'CustomHolding',
      entityId: 'holding-123',
      timestamp: '2024-01-31T10:30:00Z',
      details: 'Updated quantity from 100 to 150',
      beforeValue: '100',
      afterValue: '150',
    },
    {
      id: 'audit-3',
      user: 'admin@example.com',
      action: 'EXPORT',
      entity: 'ApprovalLogs',
      timestamp: '2024-01-31T14:00:00Z',
      details: 'Exported approval logs to Excel',
    },
  ],
  totalCount: 3,
  ...overrides,
});

const createMockMonthlyProcessLogs = (overrides = {}) => ({
  logs: [
    {
      id: 'monthly-1',
      processName: 'Month-End Reconciliation',
      startTime: '2024-01-31T00:00:00Z',
      endTime: '2024-01-31T02:30:00Z',
      duration: 9000,
      status: 'SUCCESS',
      errorCount: 0,
      recordsProcessed: 15000,
    },
    {
      id: 'monthly-2',
      processName: 'Report Generation',
      startTime: '2024-01-31T03:00:00Z',
      endTime: '2024-01-31T03:45:00Z',
      duration: 2700,
      status: 'SUCCESS',
      errorCount: 0,
      recordsProcessed: 8500,
    },
  ],
  reportDate: '2024-01',
  ...overrides,
});

const createMockCalculationLogs = (overrides = {}) => ({
  logs: [
    {
      id: 'calc-1',
      calculationName: 'NAV Calculation - Portfolio A',
      calculationType: 'NAV',
      startTime: '2024-01-31T08:00:00Z',
      endTime: '2024-01-31T08:15:00Z',
      status: 'SUCCESS',
      recordsProcessed: 250,
    },
    {
      id: 'calc-2',
      calculationName: 'Performance Attribution - All Portfolios',
      calculationType: 'ATTRIBUTION',
      startTime: '2024-01-31T08:20:00Z',
      endTime: '2024-01-31T08:45:00Z',
      status: 'SUCCESS',
      recordsProcessed: 1500,
    },
    {
      id: 'calc-3',
      calculationName: 'Risk Metrics - Portfolio B',
      calculationType: 'RISK',
      startTime: '2024-01-31T09:00:00Z',
      endTime: '2024-01-31T09:10:00Z',
      status: 'FAILED',
      recordsProcessed: 0,
    },
  ],
  totalCount: 3,
  ...overrides,
});

const createMockCalculationErrors = (overrides = {}) => ({
  errors: [
    {
      id: 'error-1',
      calculationName: 'Risk Metrics - Portfolio B',
      errorType: 'DATA_VALIDATION',
      errorMessage: 'Missing price data for security XYZ123',
      affectedRecord: 'Portfolio B - XYZ123',
      timestamp: '2024-01-31T09:08:00Z',
      stackTrace: 'Error at RiskCalculator.calculate() line 245...',
    },
    {
      id: 'error-2',
      calculationName: 'NAV Calculation - Portfolio C',
      errorType: 'CALCULATION',
      errorMessage: 'Division by zero in NAV formula',
      affectedRecord: 'Portfolio C - Fund NAV',
      timestamp: '2024-01-31T09:12:00Z',
    },
  ],
  totalCount: 2,
  ...overrides,
});

const createMockLogDetails = (overrides = {}) => ({
  id: 'process-1',
  processName: 'Bloomberg Data Import',
  fullLog: `[2024-01-31 08:00:00] Starting Bloomberg Data Import...
[2024-01-31 08:00:05] Connected to Bloomberg API
[2024-01-31 08:00:10] Fetching positions for 8 portfolios
[2024-01-31 08:04:55] Processed 1250 records
[2024-01-31 08:05:00] Import completed successfully`,
  parameters: {
    portfolioIds: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    dateRange: '2024-01-31',
    dataTypes: ['positions', 'prices'],
  },
  inputCount: 8,
  outputCount: 1250,
  startTime: '2024-01-31T08:00:00Z',
  endTime: '2024-01-31T08:05:00Z',
  duration: 300,
  ...overrides,
});

// =============================================================================
// Story 9.1: View File Process Logs
// =============================================================================
describe.skip('Story 9.1: View File Process Logs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('File Process Logs Page Display', () => {
    it('displays file process logs with File Name, Type, Status, Upload Date, Processed Date, Records Count', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockFileProcessLogs()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileProcessLogsPage />);

      // Assert
      await waitFor(() => {
        // Check column headers are present
        expect(screen.getByText(/file name/i)).toBeInTheDocument();
        expect(screen.getByText(/type/i)).toBeInTheDocument();
        expect(screen.getByText(/status/i)).toBeInTheDocument();
        expect(screen.getByText(/upload date/i)).toBeInTheDocument();
        expect(screen.getByText(/processed date/i)).toBeInTheDocument();
        expect(screen.getByText(/records count/i)).toBeInTheDocument();
      });

      // Check data is displayed
      await waitFor(() => {
        expect(
          screen.getByText(/bloomberg_positions_2024-01-31.csv/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/custodian_holdings_2024-01-31.xlsx/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/1250/)).toBeInTheDocument();
      });
    });

    it('filters logs by report batch date when filter is applied', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockFileProcessLogs()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByText(/bloomberg_positions/i)).toBeInTheDocument();
      });

      // Find and interact with date filter
      const dateFilter = screen.getByLabelText(/batch date/i);
      await user.clear(dateFilter);
      await user.type(dateFilter, '2024-01-31');

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('batchDate=2024-01-31'),
          expect.any(Object),
        );
      });
    });

    it('shows detailed processing log when file row is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-process-logs') && !url.includes('/details')) {
          return Promise.resolve(
            createMockResponse(createMockFileProcessLogs()),
          );
        }
        if (url.includes('/details')) {
          return Promise.resolve(createMockResponse(createMockLogDetails()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByText(/bloomberg_positions/i)).toBeInTheDocument();
      });

      // Click on file row
      const fileRow = screen.getByText(/bloomberg_positions/i).closest('tr');
      if (fileRow) {
        await user.click(fileRow);
      }

      // Assert - detailed log modal appears
      await waitFor(() => {
        expect(screen.getByText(/processing log/i)).toBeInTheDocument();
        expect(
          screen.getByText(/starting bloomberg data import/i),
        ).toBeInTheDocument();
      });
    });

    it('shows "No file logs found" when no files have been processed', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-process-logs')) {
          return Promise.resolve(
            createMockResponse({ logs: [], totalCount: 0 }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileProcessLogsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no file logs found/i)).toBeInTheDocument();
      });
    });

    it('shows error message "Failed to load file logs" when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-process-logs')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileProcessLogsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load file logs/i),
        ).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.2: Download Processed File
// =============================================================================
describe.skip('Story 9.2: Download Processed File', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Download Functionality', () => {
    it('downloads file when Download button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnDownload = vi.fn();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/download')) {
          return Promise.resolve(createMockBlobResponse());
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <FileDownloadButton
          fileId="file-1"
          fileName="bloomberg_positions_2024-01-31.csv"
          onDownloadComplete={mockOnDownload}
        />,
      );

      const downloadButton = screen.getByRole('button', { name: /download/i });
      await user.click(downloadButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/file-process-logs/file-1/download'),
          expect.any(Object),
        );
      });
    });

    it('shows progress indicator for large file downloads', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/download')) {
          // Simulate delayed response
          return new Promise((resolve) => {
            setTimeout(() => resolve(createMockBlobResponse()), 100);
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileDownloadButton fileId="file-1" fileName="large_file.csv" />);

      const downloadButton = screen.getByRole('button', { name: /download/i });
      await user.click(downloadButton);

      // Assert - progress indicator shows during download
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Wait for download to complete
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });

    it('shows "File not found or has been archived" when file is unavailable', async () => {
      // Arrange
      const user = userEvent.setup();

      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/download')) {
          return Promise.resolve(createMockBlobResponse(404));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <FileDownloadButton fileId="archived-file" fileName="old_file.csv" />,
      );

      const downloadButton = screen.getByRole('button', { name: /download/i });
      await user.click(downloadButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/file not found or has been archived/i),
        ).toBeInTheDocument();
      });
    });

    it('shows "Download failed. Please try again." on download error', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/download')) {
          return Promise.reject(new TypeError('Network error'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileDownloadButton fileId="file-1" fileName="file.csv" />);

      const downloadButton = screen.getByRole('button', { name: /download/i });
      await user.click(downloadButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/download failed.*please try again/i),
        ).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.3: View File Faults
// =============================================================================
describe.skip('Story 9.3: View File Faults', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('File Faults Page Display', () => {
    it('displays file faults with File Name, Row Number, Column, Error Message, Timestamp', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-faults')) {
          return Promise.resolve(createMockResponse(createMockFileFaults()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileFaultsPage />);

      // Assert - column headers
      await waitFor(() => {
        expect(screen.getByText(/file name/i)).toBeInTheDocument();
        expect(screen.getByText(/row number/i)).toBeInTheDocument();
        expect(screen.getByText(/column/i)).toBeInTheDocument();
        expect(screen.getByText(/error message/i)).toBeInTheDocument();
        expect(screen.getByText(/timestamp/i)).toBeInTheDocument();
      });

      // Assert - fault data
      await waitFor(() => {
        expect(screen.getByText(/custodian_holdings/i)).toBeInTheDocument();
        expect(screen.getByText(/45/)).toBeInTheDocument();
        expect(screen.getByText(/quantity/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid numeric value/i)).toBeInTheDocument();
      });
    });

    it('filters faults by file name when filter is applied', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-faults')) {
          return Promise.resolve(createMockResponse(createMockFileFaults()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileFaultsPage />);

      await waitFor(() => {
        expect(screen.getByText(/custodian_holdings/i)).toBeInTheDocument();
      });

      // Find and use file filter
      const fileFilter = screen.getByLabelText(/file name/i);
      await user.type(fileFilter, 'custodian');

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('fileName=custodian'),
          expect.any(Object),
        );
      });
    });

    it('shows detailed error context when fault row is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-faults')) {
          return Promise.resolve(createMockResponse(createMockFileFaults()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileFaultsPage />);

      await waitFor(() => {
        expect(screen.getByText(/invalid numeric value/i)).toBeInTheDocument();
      });

      // Click on fault row
      const faultRow = screen.getByText(/invalid numeric value/i).closest('tr');
      if (faultRow) {
        await user.click(faultRow);
      }

      // Assert - detail panel appears with error context
      await waitFor(() => {
        expect(screen.getByText(/error details/i)).toBeInTheDocument();
        expect(screen.getByText(/row 45/i)).toBeInTheDocument();
      });
    });

    it('shows "No faults found - all files processed successfully" when no faults exist', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-faults')) {
          return Promise.resolve(
            createMockResponse({ faults: [], totalCount: 0 }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileFaultsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /no faults found.*all files processed successfully/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows "Failed to load faults" when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-faults')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileFaultsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to load faults/i)).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.4: Export File Faults
// =============================================================================
describe.skip('Story 9.4: Export File Faults', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Export Functionality', () => {
    it('downloads Excel file when "Export to Excel" is clicked on File Faults page', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-faults/export')) {
          return Promise.resolve(createMockBlobResponse());
        }
        if (url.includes('/file-faults')) {
          return Promise.resolve(createMockResponse(createMockFileFaults()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileFaultsPage />);

      await waitFor(() => {
        expect(screen.getByText(/custodian_holdings/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export to excel/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/file-faults/export'),
          expect.any(Object),
        );
      });
    });

    it('exports Excel file with columns: File Name, Row Number, Column, Error Message, Timestamp', async () => {
      // Arrange
      const user = userEvent.setup();
      let exportUrl = '';
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-faults/export')) {
          exportUrl = url;
          return Promise.resolve(createMockBlobResponse());
        }
        if (url.includes('/file-faults')) {
          return Promise.resolve(createMockResponse(createMockFileFaults()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileFaultsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export to excel/i }),
        ).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export to excel/i,
      });
      await user.click(exportButton);

      // Assert - API was called (actual column verification would be in backend)
      await waitFor(() => {
        expect(exportUrl).toContain('/file-faults/export');
      });
    });

    it('only exports filtered faults when filter is applied before export', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-faults/export')) {
          return Promise.resolve(createMockBlobResponse());
        }
        if (url.includes('/file-faults')) {
          return Promise.resolve(createMockResponse(createMockFileFaults()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileFaultsPage />);

      await waitFor(() => {
        expect(screen.getByText(/custodian_holdings/i)).toBeInTheDocument();
      });

      // Apply filter first
      const fileFilter = screen.getByLabelText(/file name/i);
      await user.type(fileFilter, 'custodian');

      const applyButton = screen.getByRole('button', { name: /apply/i });
      await user.click(applyButton);

      // Then export
      const exportButton = screen.getByRole('button', {
        name: /export to excel/i,
      });
      await user.click(exportButton);

      // Assert - export includes filter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('fileName=custodian'),
          expect.any(Object),
        );
      });
    });

    it('shows "Export failed" when export fails', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/file-faults/export')) {
          return Promise.resolve(createMockBlobResponse(500));
        }
        if (url.includes('/file-faults')) {
          return Promise.resolve(createMockResponse(createMockFileFaults()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<FileFaultsPage />);

      await waitFor(() => {
        expect(screen.getByText(/custodian_holdings/i)).toBeInTheDocument();
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

// =============================================================================
// Story 9.5: View Weekly Process Logs
// =============================================================================
describe.skip('Story 9.5: View Weekly Process Logs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Weekly Process Logs Page Display', () => {
    it('displays page with Report Batch Date dropdown and two grids (Process Logs, User Audit Trail)', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(
            createMockResponse({
              dates: ['2024-01-31', '2024-01-24', '2024-01-17'],
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      // Assert
      await waitFor(() => {
        // Batch date dropdown
        expect(screen.getByLabelText(/report batch date/i)).toBeInTheDocument();
        // Two grid sections
        expect(screen.getByText(/process logs/i)).toBeInTheDocument();
        expect(screen.getByText(/user audit trail/i)).toBeInTheDocument();
      });
    });

    it('shows logs for selected batch date when date is applied', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(
            createMockResponse({ dates: ['2024-01-31', '2024-01-24'] }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/report batch date/i)).toBeInTheDocument();
      });

      // Select a batch date
      const dateDropdown = screen.getByLabelText(/report batch date/i);
      await user.click(dateDropdown);
      await user.click(screen.getByText('2024-01-31'));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('batchDate=2024-01-31'),
          expect.any(Object),
        );
      });
    });

    it('displays process logs with Process Name, Start Time, End Time, Duration, Status, Error Count', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      // Assert - process log data
      await waitFor(() => {
        expect(screen.getByText(/bloomberg data import/i)).toBeInTheDocument();
        expect(screen.getByText(/success/i)).toBeInTheDocument();
        expect(
          screen.getByText(/custodian file validation/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });

    it('shows "No logs found for this date" when no logs exist for selected date', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse({ logs: [], batchDate: '2024-01-31' }),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse({ entries: [], totalCount: 0 }),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no logs found for this date/i),
        ).toBeInTheDocument();
      });
    });

    it('shows "Failed to load weekly logs" when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load weekly logs/i),
        ).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.6: View User Audit Trail
// =============================================================================
describe.skip('Story 9.6: View User Audit Trail', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('User Audit Trail Display', () => {
    it('displays User Audit Trail grid with User, Action, Entity, Timestamp, Details', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<UserAuditTrailGrid batchDate="2024-01-31" />);

      // Assert - column headers and data
      await waitFor(() => {
        expect(screen.getByText(/user/i)).toBeInTheDocument();
        expect(screen.getByText(/action/i)).toBeInTheDocument();
        expect(screen.getByText(/entity/i)).toBeInTheDocument();
        expect(screen.getByText(/timestamp/i)).toBeInTheDocument();
        expect(screen.getByText(/details/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/john.smith@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/approve/i)).toBeInTheDocument();
        expect(screen.getByText(/reportbatch/i)).toBeInTheDocument();
      });
    });

    it('filters by user when user filter is applied', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<UserAuditTrailGrid batchDate="2024-01-31" />);

      await waitFor(() => {
        expect(screen.getByText(/john.smith/i)).toBeInTheDocument();
      });

      // Apply user filter
      const userFilter = screen.getByLabelText(/filter by user/i);
      await user.type(userFilter, 'john');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('user=john'),
          expect.any(Object),
        );
      });
    });

    it('filters by entity when search by entity is used', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<UserAuditTrailGrid batchDate="2024-01-31" />);

      await waitFor(() => {
        expect(screen.getByText(/reportbatch/i)).toBeInTheDocument();
      });

      // Search by entity
      const entitySearch = screen.getByPlaceholderText(/search entity/i);
      await user.type(entitySearch, 'CustomHolding');

      // Assert - matching actions filter (client-side or server-side)
      await waitFor(() => {
        expect(screen.getByText(/customholding/i)).toBeInTheDocument();
      });
    });

    it('shows "No user actions recorded" when no actions occurred', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse({ entries: [], totalCount: 0 }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<UserAuditTrailGrid batchDate="2024-01-31" />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no user actions recorded/i),
        ).toBeInTheDocument();
      });
    });

    it('shows "Failed to load audit trail" when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/user-audit-trail')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<UserAuditTrailGrid batchDate="2024-01-31" />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load audit trail/i),
        ).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.7: Export Weekly Process Logs
// =============================================================================
describe.skip('Story 9.7: Export Weekly Process Logs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Export Functionality', () => {
    it('downloads Excel file with two sheets when "Export to Excel" is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs/export')) {
          return Promise.resolve(createMockBlobResponse());
        }
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByText(/bloomberg data import/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export to excel/i,
      });
      await user.click(exportButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/v1/weekly-process-logs/export'),
          expect.any(Object),
        );
      });
    });

    it('includes batch date in export request', async () => {
      // Arrange
      const user = userEvent.setup();
      let exportUrl = '';
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs/export')) {
          exportUrl = url;
          return Promise.resolve(createMockBlobResponse());
        }
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /export to excel/i }),
        ).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', {
        name: /export to excel/i,
      });
      await user.click(exportButton);

      // Assert - export URL includes batch date
      await waitFor(() => {
        expect(exportUrl).toContain('batchDate=');
      });
    });

    it('shows "Export failed" when export fails', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs/export')) {
          return Promise.resolve(createMockBlobResponse(500));
        }
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

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

// =============================================================================
// Story 9.8: View Monthly Process Logs
// =============================================================================
describe.skip('Story 9.8: View Monthly Process Logs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Monthly Process Logs Page Display', () => {
    it('displays page with Report Date filter, Process Logs grid, and Approval Logs grid', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (
          url.includes('/monthly-process-logs') &&
          !url.includes('/approval-logs')
        ) {
          return Promise.resolve(
            createMockResponse(createMockMonthlyProcessLogs()),
          );
        }
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse({ logs: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<MonthlyProcessLogsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/report date/i)).toBeInTheDocument();
        expect(screen.getByText(/process logs/i)).toBeInTheDocument();
        expect(screen.getByText(/approval logs/i)).toBeInTheDocument();
      });
    });

    it('shows logs for selected month when date filter is applied', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/monthly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockMonthlyProcessLogs()),
          );
        }
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse({ logs: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<MonthlyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/report date/i)).toBeInTheDocument();
      });

      // Apply date filter
      const dateFilter = screen.getByLabelText(/report date/i);
      await user.clear(dateFilter);
      await user.type(dateFilter, '2024-01');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('reportDate=2024-01'),
          expect.any(Object),
        );
      });
    });

    it('displays process logs with Process Name, Start Time, End Time, Duration, Status, Error Count', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/monthly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockMonthlyProcessLogs()),
          );
        }
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse({ logs: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<MonthlyProcessLogsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/month-end reconciliation/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/report generation/i)).toBeInTheDocument();
        expect(screen.getByText(/15000/)).toBeInTheDocument(); // records processed
      });
    });

    it('shows "No logs found" when no logs exist for selected month', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/monthly-process-logs')) {
          return Promise.resolve(
            createMockResponse({ logs: [], reportDate: '2024-01' }),
          );
        }
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse({ logs: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<MonthlyProcessLogsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no logs found/i)).toBeInTheDocument();
      });
    });

    it('shows "Failed to load monthly logs" when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/monthly-process-logs')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<MonthlyProcessLogsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load monthly logs/i),
        ).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.9: Search Process Logs
// =============================================================================
describe.skip('Story 9.9: Search Process Logs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Search Functionality', () => {
    it('filters matching logs when typing in search box', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      // Type in search box
      const searchBox = screen.getByPlaceholderText(/search/i);
      await user.type(searchBox, 'bloomberg');

      // Assert - matching logs filter
      await waitFor(() => {
        expect(screen.getByText(/bloomberg data import/i)).toBeInTheDocument();
      });
    });

    it('shows all logs containing "validation error" when searched', async () => {
      // Arrange
      const user = userEvent.setup();
      const logsWithError = createMockWeeklyProcessLogs({
        logs: [
          ...createMockWeeklyProcessLogs().logs,
          {
            id: 'process-4',
            processName: 'Data Validation Error Handler',
            startTime: '2024-01-31T09:00:00Z',
            endTime: '2024-01-31T09:05:00Z',
            duration: 300,
            status: 'FAILED',
            errorCount: 10,
          },
        ],
      });
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(createMockResponse(logsWithError));
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      const searchBox = screen.getByPlaceholderText(/search/i);
      await user.type(searchBox, 'validation error');

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/validation error handler/i),
        ).toBeInTheDocument();
      });
    });

    it('shows "No results found for \'{search term}\'" when no logs match search', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      const searchBox = screen.getByPlaceholderText(/search/i);
      await user.type(searchBox, 'nonexistent process');

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no results found for 'nonexistent process'/i),
        ).toBeInTheDocument();
      });
    });

    it('shows "Search failed. Please try again." when search service fails', async () => {
      // Arrange
      const user = userEvent.setup();
      let searchCount = 0;
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          searchCount++;
          if (searchCount > 1 && url.includes('search=')) {
            return Promise.reject(new TypeError('Search failed'));
          }
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      const searchBox = screen.getByPlaceholderText(/search/i);
      await user.type(searchBox, 'test search');

      // Trigger server-side search
      await user.keyboard('{Enter}');

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/search failed.*please try again/i),
        ).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.10: Export Monthly Process Logs
// =============================================================================
describe.skip('Story 9.10: Export Monthly Process Logs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Export Functionality', () => {
    it('downloads Excel file when "Export to Excel" is clicked on Monthly Process Logs page', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/monthly-process-logs/export')) {
          return Promise.resolve(createMockBlobResponse());
        }
        if (url.includes('/monthly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockMonthlyProcessLogs()),
          );
        }
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse({ logs: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<MonthlyProcessLogsPage />);

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
          expect.stringContaining('/v1/monthly-process-logs/export'),
          expect.any(Object),
        );
      });
    });

    it('includes only filtered data when export happens after filter is applied', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/monthly-process-logs/export')) {
          return Promise.resolve(createMockBlobResponse());
        }
        if (url.includes('/monthly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockMonthlyProcessLogs()),
          );
        }
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse({ logs: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<MonthlyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/report date/i)).toBeInTheDocument();
      });

      // Apply filter first
      const dateFilter = screen.getByLabelText(/report date/i);
      await user.clear(dateFilter);
      await user.type(dateFilter, '2024-01');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // Then export
      const exportButton = screen.getByRole('button', {
        name: /export to excel/i,
      });
      await user.click(exportButton);

      // Assert - export includes filter
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('reportDate=2024-01'),
          expect.any(Object),
        );
      });
    });

    it('shows "Export failed" when export fails', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/monthly-process-logs/export')) {
          return Promise.resolve(createMockBlobResponse(500));
        }
        if (url.includes('/monthly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockMonthlyProcessLogs()),
          );
        }
        if (url.includes('/approval-logs')) {
          return Promise.resolve(createMockResponse({ logs: [] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<MonthlyProcessLogsPage />);

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

// =============================================================================
// Story 9.11: View Calculation Logs
// =============================================================================
describe.skip('Story 9.11: View Calculation Logs', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Calculation Logs Page Display', () => {
    it('displays calculation logs with Calculation Name, Start Time, End Time, Status, Records Processed', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-logs')) {
          return Promise.resolve(
            createMockResponse(createMockCalculationLogs()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationLogsPage />);

      // Assert - column headers
      await waitFor(() => {
        expect(screen.getByText(/calculation name/i)).toBeInTheDocument();
        expect(screen.getByText(/start time/i)).toBeInTheDocument();
        expect(screen.getByText(/end time/i)).toBeInTheDocument();
        expect(screen.getByText(/status/i)).toBeInTheDocument();
        expect(screen.getByText(/records processed/i)).toBeInTheDocument();
      });

      // Assert - data
      await waitFor(() => {
        expect(
          screen.getByText(/nav calculation.*portfolio a/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/performance attribution/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/250/)).toBeInTheDocument();
      });
    });

    it('shows detailed step-by-step log when calculation is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const logsWithSteps = {
        ...createMockCalculationLogs(),
        logs: [
          {
            ...createMockCalculationLogs().logs[0],
            steps: [
              {
                stepNumber: 1,
                stepName: 'Load Positions',
                startTime: '2024-01-31T08:00:00Z',
                endTime: '2024-01-31T08:02:00Z',
                duration: 120,
                recordsProcessed: 100,
              },
              {
                stepNumber: 2,
                stepName: 'Calculate NAV',
                startTime: '2024-01-31T08:02:00Z',
                endTime: '2024-01-31T08:14:00Z',
                duration: 720,
                recordsProcessed: 250,
              },
              {
                stepNumber: 3,
                stepName: 'Save Results',
                startTime: '2024-01-31T08:14:00Z',
                endTime: '2024-01-31T08:15:00Z',
                duration: 60,
                recordsProcessed: 250,
              },
            ],
          },
          ...createMockCalculationLogs().logs.slice(1),
        ],
      };
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-logs')) {
          return Promise.resolve(createMockResponse(logsWithSteps));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationLogsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/nav calculation.*portfolio a/i),
        ).toBeInTheDocument();
      });

      // Click on calculation row
      const calcRow = screen
        .getByText(/nav calculation.*portfolio a/i)
        .closest('tr');
      if (calcRow) {
        await user.click(calcRow);
      }

      // Assert - step-by-step log appears
      await waitFor(() => {
        expect(screen.getByText(/load positions/i)).toBeInTheDocument();
        expect(screen.getByText(/calculate nav/i)).toBeInTheDocument();
        expect(screen.getByText(/save results/i)).toBeInTheDocument();
      });
    });

    it('shows green status indicators for successful calculations', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-logs')) {
          return Promise.resolve(
            createMockResponse(createMockCalculationLogs()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationLogsPage />);

      // Assert - green status for SUCCESS
      await waitFor(() => {
        const successStatuses = screen.getAllByText(/success/i);
        expect(successStatuses.length).toBeGreaterThan(0);
        // Visual indicator would be tested via className or computed styles
      });
    });

    it('shows "No calculation logs found" when no calculations have run', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-logs')) {
          return Promise.resolve(
            createMockResponse({ logs: [], totalCount: 0 }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationLogsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no calculation logs found/i),
        ).toBeInTheDocument();
      });
    });

    it('shows "Failed to load calculation logs" when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-logs')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationLogsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load calculation logs/i),
        ).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.12: View Calculation Errors
// =============================================================================
describe.skip('Story 9.12: View Calculation Errors', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Calculation Errors Page Display', () => {
    it('displays calculation errors with Calculation Name, Error Type, Error Message, Affected Record, Timestamp', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-log-errors')) {
          return Promise.resolve(
            createMockResponse(createMockCalculationErrors()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationErrorsPage />);

      // Assert - column headers
      await waitFor(() => {
        expect(screen.getByText(/calculation name/i)).toBeInTheDocument();
        expect(screen.getByText(/error type/i)).toBeInTheDocument();
        expect(screen.getByText(/error message/i)).toBeInTheDocument();
        expect(screen.getByText(/affected record/i)).toBeInTheDocument();
        expect(screen.getByText(/timestamp/i)).toBeInTheDocument();
      });

      // Assert - error data
      await waitFor(() => {
        expect(
          screen.getByText(/risk metrics.*portfolio b/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/data_validation/i)).toBeInTheDocument();
        expect(screen.getByText(/missing price data/i)).toBeInTheDocument();
      });
    });

    it('filters errors by calculation name when filter is applied', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-log-errors')) {
          return Promise.resolve(
            createMockResponse(createMockCalculationErrors()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationErrorsPage />);

      await waitFor(() => {
        expect(screen.getByText(/risk metrics/i)).toBeInTheDocument();
      });

      // Apply filter
      const calcFilter = screen.getByLabelText(/calculation name/i);
      await user.type(calcFilter, 'Risk Metrics');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('calculationName=Risk'),
          expect.any(Object),
        );
      });
    });

    it('shows full stack trace and context when error is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-log-errors')) {
          return Promise.resolve(
            createMockResponse(createMockCalculationErrors()),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationErrorsPage />);

      await waitFor(() => {
        expect(screen.getByText(/missing price data/i)).toBeInTheDocument();
      });

      // Click on error row
      const errorRow = screen.getByText(/missing price data/i).closest('tr');
      if (errorRow) {
        await user.click(errorRow);
      }

      // Assert - stack trace appears
      await waitFor(() => {
        expect(
          screen.getByText(/riskcalculator\.calculate/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/line 245/i)).toBeInTheDocument();
      });
    });

    it('shows "No calculation errors found - all calculations successful" when no errors exist', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-log-errors')) {
          return Promise.resolve(
            createMockResponse({ errors: [], totalCount: 0 }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationErrorsPage />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(
            /no calculation errors found.*all calculations successful/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows "Failed to load errors" when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/calculation-log-errors')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<CalculationErrorsPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to load errors/i)).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.13: Filter Logs by Status
// =============================================================================
describe.skip('Story 9.13: Filter Logs by Status', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Status Filter Functionality', () => {
    it('shows only failed processes when "Failed" is selected from status dropdown', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          // If status filter is applied, return filtered data
          if (url.includes('status=FAILED')) {
            return Promise.resolve(
              createMockResponse({
                logs: createMockWeeklyProcessLogs().logs.filter(
                  (l) => l.status === 'FAILED',
                ),
                batchDate: '2024-01-31',
              }),
            );
          }
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      });

      // Select Failed from dropdown
      const statusDropdown = screen.getByLabelText(/status/i);
      await user.click(statusDropdown);
      await user.click(screen.getByText(/^failed$/i));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=FAILED'),
          expect.any(Object),
        );
      });
    });

    it('shows only successful processes when "Success" is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          if (url.includes('status=SUCCESS')) {
            return Promise.resolve(
              createMockResponse({
                logs: createMockWeeklyProcessLogs().logs.filter(
                  (l) => l.status === 'SUCCESS',
                ),
                batchDate: '2024-01-31',
              }),
            );
          }
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      });

      // Select Success from dropdown
      const statusDropdown = screen.getByLabelText(/status/i);
      await user.click(statusDropdown);
      await user.click(screen.getByText(/^success$/i));

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=SUCCESS'),
          expect.any(Object),
        );
      });
    });

    it('shows all statuses when "All" is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      });

      // Select All from dropdown
      const statusDropdown = screen.getByLabelText(/status/i);
      await user.click(statusDropdown);
      await user.click(screen.getByText(/^all$/i));

      // Assert - all logs visible
      await waitFor(() => {
        expect(screen.getByText(/bloomberg data import/i)).toBeInTheDocument();
        expect(
          screen.getByText(/custodian file validation/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/nav calculation/i)).toBeInTheDocument();
      });
    });

    it('shows "No logs found with status \'{status}\'" when no logs match selected status', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          if (url.includes('status=IN_PROGRESS')) {
            return Promise.resolve(
              createMockResponse({ logs: [], batchDate: '2024-01-31' }),
            );
          }
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      });

      // Select In Progress from dropdown
      const statusDropdown = screen.getByLabelText(/status/i);
      await user.click(statusDropdown);
      await user.click(screen.getByText(/in progress/i));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/no logs found with status 'in progress'/i),
        ).toBeInTheDocument();
      });
    });

    it('shows "Failed to apply filter" when filter fails', async () => {
      // Arrange
      const user = userEvent.setup();
      let filterAttempts = 0;
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/weekly-process-logs')) {
          filterAttempts++;
          if (filterAttempts > 1 && url.includes('status=')) {
            return Promise.reject(new TypeError('Filter failed'));
          }
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      });

      // Select a status
      const statusDropdown = screen.getByLabelText(/status/i);
      await user.click(statusDropdown);
      await user.click(screen.getByText(/^failed$/i));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to apply filter/i)).toBeInTheDocument();
      });
    });
  });
});

// =============================================================================
// Story 9.14: View Detailed Log Entry
// =============================================================================
describe.skip('Story 9.14: View Detailed Log Entry', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  describe('Log Details Modal', () => {
    it('shows detail panel with Full Process Log, Parameters Used, Input/Output Counts, Error Details when log row is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/process-logs') && url.includes('/details')) {
          return Promise.resolve(createMockResponse(createMockLogDetails()));
        }
        if (url.includes('/weekly-process-logs')) {
          return Promise.resolve(
            createMockResponse(createMockWeeklyProcessLogs()),
          );
        }
        if (url.includes('/user-audit-trail')) {
          return Promise.resolve(
            createMockResponse(createMockUserAuditTrail()),
          );
        }
        if (url.includes('/batch-dates')) {
          return Promise.resolve(createMockResponse({ dates: ['2024-01-31'] }));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(<WeeklyProcessLogsPage />);

      await waitFor(() => {
        expect(screen.getByText(/bloomberg data import/i)).toBeInTheDocument();
      });

      // Click on log row
      const logRow = screen.getByText(/bloomberg data import/i).closest('tr');
      if (logRow) {
        await user.click(logRow);
      }

      // Assert - detail panel appears
      await waitFor(() => {
        expect(screen.getByText(/full process log/i)).toBeInTheDocument();
        expect(screen.getByText(/parameters used/i)).toBeInTheDocument();
        expect(screen.getByText(/input.*8/i)).toBeInTheDocument();
        expect(screen.getByText(/output.*1250/i)).toBeInTheDocument();
        expect(
          screen.getByText(/starting bloomberg data import/i),
        ).toBeInTheDocument();
      });
    });

    it('allows expand/collapse of log sections in detail view', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/process-logs') && url.includes('/details')) {
          return Promise.resolve(createMockResponse(createMockLogDetails()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <LogDetailsModal logId="process-1" isOpen={true} onClose={() => {}} />,
      );

      await waitFor(() => {
        expect(screen.getByText(/full process log/i)).toBeInTheDocument();
      });

      // Find and click collapse button for log section
      const collapseButton = screen.getByRole('button', {
        name: /collapse.*log/i,
      });
      await user.click(collapseButton);

      // Assert - section collapses
      await waitFor(() => {
        expect(
          screen.queryByText(/starting bloomberg data import/i),
        ).not.toBeVisible();
      });

      // Expand again
      const expandButton = screen.getByRole('button', { name: /expand.*log/i });
      await user.click(expandButton);

      // Assert - section expands
      await waitFor(() => {
        expect(
          screen.getByText(/starting bloomberg data import/i),
        ).toBeVisible();
      });
    });

    it('copies log text to clipboard when "Copy Log" is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/process-logs') && url.includes('/details')) {
          return Promise.resolve(createMockResponse(createMockLogDetails()));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <LogDetailsModal logId="process-1" isOpen={true} onClose={() => {}} />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /copy log/i }),
        ).toBeInTheDocument();
      });

      const copyButton = screen.getByRole('button', { name: /copy log/i });
      await user.click(copyButton);

      // Assert
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('Starting Bloomberg Data Import'),
        );
      });
    });

    it('hides Error Details section when log has no errors', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/process-logs') && url.includes('/details')) {
          return Promise.resolve(
            createMockResponse({
              ...createMockLogDetails(),
              errorDetails: undefined,
            }),
          );
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <LogDetailsModal logId="process-1" isOpen={true} onClose={() => {}} />,
      );

      // Assert - Error Details section should not be present
      await waitFor(() => {
        expect(screen.getByText(/full process log/i)).toBeInTheDocument();
      });
      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();
    });

    it('shows "Failed to load log details" when API fails', async () => {
      // Arrange
      (global.fetch as Mock).mockImplementation((url: string) => {
        if (url.includes('/process-logs') && url.includes('/details')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Act
      render(
        <LogDetailsModal logId="process-1" isOpen={true} onClose={() => {}} />,
      );

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load log details/i),
        ).toBeInTheDocument();
      });
    });
  });
});
