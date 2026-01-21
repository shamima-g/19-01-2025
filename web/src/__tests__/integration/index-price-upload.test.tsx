/**
 * Integration Test: Index Price File Upload (Epic 5)
 *
 * Tests for Epic 5: Market Data Maintenance
 * Story covered: 5.4 (Upload Index Prices File)
 *
 * Test Strategy:
 * - Test file upload workflow and validation
 * - Mock only the HTTP client (test real components)
 * - Use accessibility-first queries
 * - Verify user sees correct feedback and results
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import IndexPriceUploadPage from '@/app/index-prices/upload/page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
  usePathname: () => '/index-prices/upload',
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

// Helper to create mock file
const createMockFile = (name: string, size: number, type: string) => {
  const file = new File(['mock content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe.skip('Index Price Upload - Story 5.4: Upload Index Prices File', () => {
  it('shows Upload File button', () => {
    render(<IndexPriceUploadPage />);

    expect(
      screen.getByRole('button', { name: /upload file/i }),
    ).toBeInTheDocument();
  });

  it('displays file name after valid file is selected', async () => {
    const user = userEvent.setup();
    render(<IndexPriceUploadPage />);

    const file = createMockFile(
      'index-prices.xlsx',
      1024 * 100,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    const fileInput = screen.getByLabelText(/select file/i);

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('index-prices.xlsx')).toBeInTheDocument();
    });
  });

  it('shows upload summary after successful file processing', async () => {
    const user = userEvent.setup();
    const uploadResponse = {
      success: true,
      message: 'Import successful',
      addedCount: 15,
      updatedCount: 10,
      errorCount: 0,
    };

    mockFetch.mockResolvedValue(createMockResponse(uploadResponse));

    render(<IndexPriceUploadPage />);

    const file = createMockFile(
      'index-prices.xlsx',
      1024,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    const fileInput = screen.getByLabelText(/select file/i);
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('index-prices.xlsx')).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: /^upload$/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/15 prices added/i)).toBeInTheDocument();
      expect(screen.getByText(/10.*updated/i)).toBeInTheDocument();
    });
  });

  it('refreshes grid to show new prices after upload completes', async () => {
    const user = userEvent.setup();
    const uploadResponse = {
      success: true,
      message: 'Import successful',
      addedCount: 5,
      updatedCount: 3,
      errorCount: 0,
    };

    mockFetch.mockResolvedValue(createMockResponse(uploadResponse));

    render(<IndexPriceUploadPage />);

    const file = createMockFile(
      'index-prices.xlsx',
      1024,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    await user.upload(screen.getByLabelText(/select file/i), file);
    await user.click(screen.getByRole('button', { name: /^upload$/i }));

    await waitFor(() => {
      expect(screen.getByText(/5 prices added/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /view prices/i }),
    ).toBeInTheDocument();
  });

  it('shows validation errors for invalid prices (negative)', async () => {
    const user = userEvent.setup();
    const uploadResponse = {
      success: false,
      message: 'Validation errors found',
      addedCount: 0,
      updatedCount: 0,
      errorCount: 3,
      errors: [
        { row: 5, field: 'Price', message: 'Price must be positive' },
        { row: 10, field: 'Price', message: 'Price must be positive' },
        { row: 15, field: 'IndexCode', message: 'Invalid index code' },
      ],
    };

    mockFetch.mockResolvedValue(createMockResponse(uploadResponse));

    render(<IndexPriceUploadPage />);

    const file = createMockFile(
      'index-prices.xlsx',
      1024,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    await user.upload(screen.getByLabelText(/select file/i), file);
    await user.click(screen.getByRole('button', { name: /^upload$/i }));

    await waitFor(() => {
      expect(screen.getByText(/3 errors/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/row 5/i)).toBeInTheDocument();
    expect(screen.getByText(/price must be positive/i)).toBeInTheDocument();
  });

  it('shows error message when wrong file format is uploaded', async () => {
    const user = userEvent.setup();
    render(<IndexPriceUploadPage />);

    const invalidFile = createMockFile('index-prices.txt', 1024, 'text/plain');
    const fileInput = screen.getByLabelText(/select file/i);

    await user.upload(fileInput, invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/invalid file format/i)).toBeInTheDocument();
    });
  });

  it('accepts .xlsx files as valid format', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        success: true,
        message: 'Import successful',
        addedCount: 5,
        updatedCount: 0,
        errorCount: 0,
      }),
    );

    render(<IndexPriceUploadPage />);

    const file = createMockFile(
      'index-prices.xlsx',
      1024,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    await user.upload(screen.getByLabelText(/select file/i), file);

    await waitFor(() => {
      expect(screen.getByText('index-prices.xlsx')).toBeInTheDocument();
    });

    expect(screen.queryByText(/invalid file format/i)).not.toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /^upload$/i }),
    ).toBeInTheDocument();
  });

  it('accepts .csv files as valid format', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        success: true,
        message: 'Import successful',
        addedCount: 5,
        updatedCount: 0,
        errorCount: 0,
      }),
    );

    render(<IndexPriceUploadPage />);

    const csvFile = createMockFile('index-prices.csv', 1024, 'text/csv');
    await user.upload(screen.getByLabelText(/select file/i), csvFile);

    await waitFor(() => {
      expect(screen.getByText('index-prices.csv')).toBeInTheDocument();
    });

    expect(screen.queryByText(/invalid file format/i)).not.toBeInTheDocument();
  });

  it('shows expected columns format in instructions', () => {
    render(<IndexPriceUploadPage />);

    expect(screen.getByText(/indexcode/i)).toBeInTheDocument();
    expect(screen.getByText(/date/i)).toBeInTheDocument();
    expect(screen.getByText(/price/i)).toBeInTheDocument();
    expect(screen.getByText(/currency/i)).toBeInTheDocument();
  });

  it('shows progress indicator during file upload', async () => {
    const user = userEvent.setup();
    let resolveUpload: (value: unknown) => void;
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpload = resolve;
        }),
    );

    render(<IndexPriceUploadPage />);

    const file = createMockFile(
      'index-prices.xlsx',
      1024,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    await user.upload(screen.getByLabelText(/select file/i), file);

    const uploadButton = screen.getByRole('button', { name: /^upload$/i });
    user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    resolveUpload!(
      createMockResponse({
        success: true,
        message: 'Done',
        addedCount: 1,
        updatedCount: 0,
        errorCount: 0,
      }),
    );
  });

  it('shows error message when upload API fails', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValue(new Error('Upload failed. Please try again.'));

    render(<IndexPriceUploadPage />);

    const file = createMockFile(
      'index-prices.xlsx',
      1024,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    await user.upload(screen.getByLabelText(/select file/i), file);
    await user.click(screen.getByRole('button', { name: /^upload$/i }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
        }),
      );
    });
  });

  it('allows selecting a different file after validation error', async () => {
    const user = userEvent.setup();
    render(<IndexPriceUploadPage />);

    const invalidFile = createMockFile('index-prices.txt', 1024, 'text/plain');
    await user.upload(screen.getByLabelText(/select file/i), invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/invalid file format/i)).toBeInTheDocument();
    });

    const validFile = createMockFile(
      'index-prices.xlsx',
      1024,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    await user.upload(screen.getByLabelText(/select file/i), validFile);

    await waitFor(() => {
      expect(
        screen.queryByText(/invalid file format/i),
      ).not.toBeInTheDocument();
      expect(screen.getByText('index-prices.xlsx')).toBeInTheDocument();
    });
  });

  it('sends file via multipart/form-data POST request', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      createMockResponse({
        success: true,
        message: 'Import successful',
        addedCount: 5,
        updatedCount: 0,
        errorCount: 0,
      }),
    );

    render(<IndexPriceUploadPage />);

    const file = createMockFile(
      'index-prices.xlsx',
      1024,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    await user.upload(screen.getByLabelText(/select file/i), file);
    await user.click(screen.getByRole('button', { name: /^upload$/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/index-prices/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
    });
  });
});
