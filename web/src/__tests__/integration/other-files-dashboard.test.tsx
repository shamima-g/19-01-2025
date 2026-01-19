/**
 * Integration Test: Other Files Dashboard (Epic 3)
 *
 * Tests for Epic 3: Other Files Import Dashboard
 * Stories covered: 3.1-3.6
 *
 * Test Strategy:
 * - Test user-observable behavior across Bloomberg, Custodian, and Additional file sections
 * - Mock only the HTTP client (test real components)
 * - Use accessibility-first queries
 * - Verify collapsible sections and category-specific validations
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
// FIXME: Uncomment when implemented: import { OtherFilesDashboard } from '@/app/batches/[batchId]/other-files/page';
import { get } from '@/lib/api/client';
// Temporary stub for TDD red phase
const OtherFilesDashboard = () => null;

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useParams: () => ({ batchId: 'batch-123' }),
  usePathname: () => '/batches/batch-123/other-files',
}));

// Mock ToastContext
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockGet = get as ReturnType<typeof vi.fn>;
// const mockPost = post as ReturnType<typeof vi.fn>;

// Test data factories
const createMockBloombergFiles = (overrides = {}) => ({
  files: [
    {
      fileType: 'SecurityMaster',
      status: 'Success',
      fileName: 'security_master_jan2024.csv',
      uploadedBy: 'Jane Doe',
      uploadedAt: '2024-01-15T10:00:00Z',
      errorCount: 0,
    },
    {
      fileType: 'Prices',
      status: 'Warning',
      fileName: 'prices_jan2024.csv',
      uploadedBy: 'John Smith',
      uploadedAt: '2024-01-15T11:00:00Z',
      errorCount: 5,
    },
    {
      fileType: 'CreditRatings',
      status: 'Pending',
    },
    {
      fileType: 'Analytics',
      status: 'Processing',
      fileName: 'analytics_jan2024.csv',
    },
  ],
  ...overrides,
});

const createMockCustodianFiles = (overrides = {}) => ({
  files: [
    {
      fileType: 'HoldingsReconciliation',
      status: 'Success',
      fileName: 'holdings_recon.csv',
      uploadedBy: 'Bob Wilson',
      uploadedAt: '2024-01-16T09:00:00Z',
      errorCount: 0,
    },
    {
      fileType: 'TransactionReconciliation',
      status: 'Failed',
      fileName: 'transaction_recon.csv',
      uploadedBy: 'Alice Brown',
      uploadedAt: '2024-01-16T10:00:00Z',
      errorCount: 15,
    },
    {
      fileType: 'CashReconciliation',
      status: 'Pending',
    },
  ],
  ...overrides,
});

const createMockAdditionalFiles = (overrides = {}) => ({
  files: [
    {
      fileType: 'FXRates',
      status: 'Pending',
    },
    {
      fileType: 'CustomBenchmarks',
      status: 'Pending',
    },
    {
      fileType: 'MarketCommentary',
      status: 'Success',
      fileName: 'commentary_jan2024.pdf',
      uploadedBy: 'Emily Davis',
      uploadedAt: '2024-01-17T14:00:00Z',
    },
  ],
  ...overrides,
});

describe.skip('Other Files Dashboard - Story 3.1: Bloomberg Files Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays Bloomberg Files section with correct title', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /bloomberg files/i }),
      ).toBeInTheDocument();
    });
  });

  it('displays all 4 Bloomberg file types', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Security Master')).toBeInTheDocument();
    });

    expect(screen.getByText('Prices')).toBeInTheDocument();
    expect(screen.getByText('Credit Ratings')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('displays file metadata for uploaded Bloomberg files', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText('security_master_jan2024.csv'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/j\. doe/i)).toBeInTheDocument();
    expect(screen.getByText(/01\/15\/24/i)).toBeInTheDocument();
  });

  it('displays status icons for Bloomberg files', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      const bloombergSection = screen
        .getByRole('heading', { name: /bloomberg files/i })
        .closest('section');

      expect(
        within(bloombergSection!).getByRole('img', { name: /success/i }),
      ).toBeInTheDocument();
      expect(
        within(bloombergSection!).getByRole('img', { name: /warning/i }),
      ).toBeInTheDocument();
      expect(
        within(bloombergSection!).getByRole('img', { name: /processing/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows action buttons based on Bloomberg file status', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      const bloombergSection = screen
        .getByRole('heading', { name: /bloomberg files/i })
        .closest('section');

      // Pending status shows Upload
      expect(
        within(bloombergSection!).getByRole('button', { name: /upload/i }),
      ).toBeInTheDocument();

      // Success status shows Re-import
      expect(
        within(bloombergSection!).getByRole('button', { name: /re-import/i }),
      ).toBeInTheDocument();

      // Warning status shows View Errors
      expect(
        within(bloombergSection!).getByRole('button', { name: /view errors/i }),
      ).toBeInTheDocument();

      // Processing status shows Cancel
      expect(
        within(bloombergSection!).getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument();
    });
  });

  it('collapses Bloomberg section when header is clicked', async () => {
    const user = userEvent.setup();
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Security Master')).toBeInTheDocument();
    });

    const bloombergHeader = screen.getByRole('heading', {
      name: /bloomberg files/i,
    });
    await user.click(bloombergHeader);

    await waitFor(() => {
      expect(screen.queryByText('Security Master')).not.toBeInTheDocument();
    });
  });

  it('expands Bloomberg section when clicked again', async () => {
    const user = userEvent.setup();
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Security Master')).toBeInTheDocument();
    });

    const bloombergHeader = screen.getByRole('heading', {
      name: /bloomberg files/i,
    });

    // Collapse
    await user.click(bloombergHeader);
    await waitFor(() => {
      expect(screen.queryByText('Security Master')).not.toBeInTheDocument();
    });

    // Expand
    await user.click(bloombergHeader);
    await waitFor(() => {
      expect(screen.getByText('Security Master')).toBeInTheDocument();
    });
  });

  it('shows green checkmark on section header when all Bloomberg files are Success', async () => {
    const allSuccessFiles = {
      files: createMockBloombergFiles().files.map((file) => ({
        ...file,
        status: 'Success',
      })),
    };

    mockGet
      .mockResolvedValueOnce(allSuccessFiles)
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      const bloombergHeader = screen
        .getByRole('heading', { name: /bloomberg files/i })
        .closest('div');
      expect(
        within(bloombergHeader!).getByRole('img', { name: /success/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows loading state for Bloomberg section', () => {
    mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<OtherFilesDashboard />);

    expect(screen.getByText(/loading bloomberg files/i)).toBeInTheDocument();
  });

  it('shows error message when Bloomberg API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/unable to load bloomberg files/i),
      ).toBeInTheDocument();
    });
  });
});

describe.skip('Other Files Dashboard - Story 3.2: Custodian Files Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays Custodian Files section with correct title', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /custodian files/i }),
      ).toBeInTheDocument();
    });
  });

  it('displays all 3 Custodian file types', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Holdings Reconciliation')).toBeInTheDocument();
    });

    expect(screen.getByText('Transaction Reconciliation')).toBeInTheDocument();
    expect(screen.getByText('Cash Reconciliation')).toBeInTheDocument();
  });

  it('displays file metadata for uploaded Custodian files', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(screen.getByText('holdings_recon.csv')).toBeInTheDocument();
    });

    expect(screen.getByText(/b\. wilson/i)).toBeInTheDocument();
  });

  it('shows View Errors button for Failed Custodian files', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      const custodianSection = screen
        .getByRole('heading', { name: /custodian files/i })
        .closest('section');

      const viewErrorsButtons = within(custodianSection!).getAllByRole(
        'button',
        { name: /view errors/i },
      );
      expect(viewErrorsButtons.length).toBeGreaterThan(0);
    });
  });

  it('collapses and expands Custodian section', async () => {
    const user = userEvent.setup();
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Holdings Reconciliation')).toBeInTheDocument();
    });

    const custodianHeader = screen.getByRole('heading', {
      name: /custodian files/i,
    });
    await user.click(custodianHeader);

    await waitFor(() => {
      expect(
        screen.queryByText('Holdings Reconciliation'),
      ).not.toBeInTheDocument();
    });
  });
});

describe.skip('Other Files Dashboard - Story 3.3: Additional Data Files Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays Additional Data Files section with Optional label', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /additional data files.*optional/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it('displays all 3 Additional file types', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(screen.getByText('FX Rates')).toBeInTheDocument();
    });

    expect(screen.getByText('Custom Benchmarks')).toBeInTheDocument();
    expect(screen.getByText('Market Commentary')).toBeInTheDocument();
  });

  it('shows info icon tooltip indicating files are optional', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      const additionalSection = screen
        .getByRole('heading', { name: /additional data files/i })
        .closest('div');

      const infoIcon = within(additionalSection!).getByRole('img', {
        name: /info/i,
      });
      expect(infoIcon).toBeInTheDocument();
    });
  });

  it('allows skipping Additional files without warnings', async () => {
    const user = userEvent.setup();
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /proceed to data confirmation/i }),
      ).toBeInTheDocument();
    });

    // No validation warnings should appear for pending Additional files
    await user.click(
      screen.getByRole('button', { name: /proceed to data confirmation/i }),
    );

    await waitFor(() => {
      // Should not show warning about Additional files being pending
      expect(
        screen.queryByText(/additional.*not uploaded/i),
      ).not.toBeInTheDocument();
    });
  });
});

describe.skip('Other Files Dashboard - Story 3.5: View Errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens Error Details modal for Bloomberg file errors', async () => {
    const user = userEvent.setup();
    const errorData = {
      summary: { totalErrors: 10, criticalCount: 5, warningCount: 5 },
      errors: [
        {
          rowNumber: 10,
          column: 'ISIN',
          message: 'Invalid ISIN format',
          severity: 'Critical',
          originalValue: 'ABC123',
        },
      ],
      hasMore: false,
    };

    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles())
      .mockResolvedValueOnce(errorData);

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      const bloombergSection = screen
        .getByRole('heading', { name: /bloomberg files/i })
        .closest('section');
      expect(
        within(bloombergSection!).getByRole('button', { name: /view errors/i }),
      ).toBeInTheDocument();
    });

    const viewErrorsButton = screen.getByRole('button', {
      name: /view errors/i,
    });
    await user.click(viewErrorsButton);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByText('Invalid ISIN format'),
      ).toBeInTheDocument();
      expect(within(dialog).getByText('ABC123')).toBeInTheDocument();
    });
  });

  it('displays reconciliation discrepancy errors for Custodian files', async () => {
    const user = userEvent.setup();
    const reconErrorData = {
      summary: { totalErrors: 3, criticalCount: 3, warningCount: 0 },
      errors: [
        {
          rowNumber: 5,
          column: 'Shares',
          message:
            'Mismatch: Portfolio Holdings = 100 shares, Custodian = 95 shares',
          severity: 'Critical',
        },
      ],
      hasMore: false,
    };

    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles())
      .mockResolvedValueOnce(reconErrorData);

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      const custodianSection = screen
        .getByRole('heading', { name: /custodian files/i })
        .closest('section');
      const viewErrorsButtons = within(custodianSection!).getAllByRole(
        'button',
        { name: /view errors/i },
      );
      expect(viewErrorsButtons[0]).toBeInTheDocument();
    });

    const viewErrorsButtons = screen.getAllByRole('button', {
      name: /view errors/i,
    });
    await user.click(viewErrorsButtons[viewErrorsButtons.length - 1]);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByText(/portfolio holdings = 100.*custodian = 95/i),
      ).toBeInTheDocument();
    });
  });

  it('exports errors with category-specific filename', async () => {
    const user = userEvent.setup();
    const errorData = {
      summary: { totalErrors: 5 },
      errors: [],
      hasMore: false,
    };

    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles())
      .mockResolvedValueOnce(errorData);

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /view errors/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /view errors/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(
        within(dialog).getByRole('button', { name: /export errors/i }),
      ).toBeInTheDocument();
    });

    const exportButton = within(screen.getByRole('dialog')).getByRole(
      'button',
      { name: /export errors/i },
    );
    await user.click(exportButton);

    // Verify filename includes category
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        expect.stringContaining('errors'),
        expect.objectContaining({
          filename: expect.stringMatching(/bloomberg.*prices/i),
        }),
      );
    });
  });
});

describe.skip('Other Files Dashboard - Story 3.6: Navigate to Data Confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to Data Confirmation when Proceed button is clicked', async () => {
    const user = userEvent.setup();
    const mockRouter = { push: vi.fn() };
    vi.mocked(useRouter).mockReturnValue(
      mockRouter as unknown as ReturnType<typeof useRouter>,
    );

    const allSuccessBloomberg = {
      files: createMockBloombergFiles().files.map((f) => ({
        ...f,
        status: 'Success',
      })),
    };
    const allSuccessCustodian = {
      files: createMockCustodianFiles().files.map((f) => ({
        ...f,
        status: 'Success',
      })),
    };

    mockGet
      .mockResolvedValueOnce(allSuccessBloomberg)
      .mockResolvedValueOnce(allSuccessCustodian)
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /proceed to data confirmation/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /proceed to data confirmation/i }),
    );

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining('/data-confirmation'),
      );
    });
  });

  it('shows warning when Bloomberg files are pending', async () => {
    const user = userEvent.setup();
    const allPendingBloomberg = {
      files: createMockBloombergFiles().files.map((f) => ({
        ...f,
        status: 'Pending',
      })),
    };

    mockGet
      .mockResolvedValueOnce(allPendingBloomberg)
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /proceed to data confirmation/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /proceed to data confirmation/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /bloomberg files not uploaded.*data quality may be affected/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows warning when Custodian files have failed', async () => {
    const user = userEvent.setup();
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles()) // Has Failed status
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /proceed to data confirmation/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /proceed to data confirmation/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/custodian reconciliation failed.*review errors/i),
      ).toBeInTheDocument();
    });
  });

  it('does NOT warn when only Additional files are pending', async () => {
    const user = userEvent.setup();
    const mockRouter = { push: vi.fn() };
    vi.mocked(useRouter).mockReturnValue(
      mockRouter as unknown as ReturnType<typeof useRouter>,
    );

    const allSuccessBloomberg = {
      files: createMockBloombergFiles().files.map((f) => ({
        ...f,
        status: 'Success',
      })),
    };
    const allSuccessCustodian = {
      files: createMockCustodianFiles().files.map((f) => ({
        ...f,
        status: 'Success',
      })),
    };
    // Additional files all pending (but that's OK)

    mockGet
      .mockResolvedValueOnce(allSuccessBloomberg)
      .mockResolvedValueOnce(allSuccessCustodian)
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /proceed to data confirmation/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /proceed to data confirmation/i }),
    );

    // Should navigate without warning
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  it('shows warning when files are processing', async () => {
    const user = userEvent.setup();
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles()) // Has Processing status
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /proceed to data confirmation/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: /proceed to data confirmation/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/files are still processing.*continue in background/i),
      ).toBeInTheDocument();
    });
  });

  it('disables Proceed button while loading', () => {
    mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<OtherFilesDashboard />);

    const proceedButton = screen.getByRole('button', {
      name: /proceed to data confirmation/i,
    });
    expect(proceedButton).toBeDisabled();
  });

  it('shows tooltip on Proceed button hover', async () => {
    const user = userEvent.setup();
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /proceed to data confirmation/i }),
      ).toBeInTheDocument();
    });

    const proceedButton = screen.getByRole('button', {
      name: /proceed to data confirmation/i,
    });

    await user.hover(proceedButton);

    await waitFor(() => {
      expect(
        screen.getByText(/continue to data verification phase/i),
      ).toBeInTheDocument();
    });
  });
});

describe.skip('Other Files Dashboard - Integration across all sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads all three sections independently', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /bloomberg files/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /custodian files/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /additional data files/i }),
      ).toBeInTheDocument();
    });
  });

  it('displays batch context in page header', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles())
      .mockResolvedValueOnce(createMockCustodianFiles())
      .mockResolvedValueOnce(createMockAdditionalFiles());

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/batch-123/i)).toBeInTheDocument();
    });
  });

  it('shows error state when all API calls fail', async () => {
    mockGet
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/unable to load bloomberg files/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/unable to load custodian files/i),
      ).toBeInTheDocument();
    });
  });

  it('handles partial API failures gracefully', async () => {
    mockGet
      .mockResolvedValueOnce(createMockBloombergFiles()) // Success
      .mockRejectedValueOnce(new Error('Network error')) // Custodian fails
      .mockResolvedValueOnce(createMockAdditionalFiles()); // Success

    render(<OtherFilesDashboard />);

    await waitFor(() => {
      // Bloomberg section should load
      expect(screen.getByText('Security Master')).toBeInTheDocument();

      // Custodian section should show error
      expect(
        screen.getByText(/unable to load custodian files/i),
      ).toBeInTheDocument();

      // Additional section should load
      expect(screen.getByText('FX Rates')).toBeInTheDocument();
    });
  });
});
