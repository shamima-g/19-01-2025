/**
 * Integration Test: File Import Popup (Stories 2.2, 2.3, 3.4)
 *
 * Tests for the shared File Import Popup component used across:
 * - Story 2.2: Upload Portfolio File
 * - Story 2.3: Re-import Portfolio File
 * - Story 3.4: Upload/Re-import Other Files
 *
 * Test Strategy:
 * - Test file upload workflow from user perspective
 * - Test drag-and-drop and file browser selection
 * - Test file validation and error messages
 * - Test progress indicators and success states
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { FileImportPopup } from '@/components/FileImportPopup';
import * as fileUploadApi from '@/lib/api/file-upload';

// Mock the file upload API module
vi.mock('@/lib/api/file-upload', () => ({
  uploadPortfolioFile: vi.fn(),
  reimportPortfolioFile: vi.fn(),
  uploadOtherFile: vi.fn(),
}));

// Mock ToastContext
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const mockUploadPortfolioFile = fileUploadApi.uploadPortfolioFile as Mock;
const mockReimportPortfolioFile = fileUploadApi.reimportPortfolioFile as Mock;
const mockUploadOtherFile = fileUploadApi.uploadOtherFile as Mock;

// Mock File object for testing
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File(['content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('File Import Popup - Story 2.2: Upload Portfolio File', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens with correct title for portfolio file upload', () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    expect(
      screen.getByRole('dialog', { name: /upload holdings for portfolio a/i }),
    ).toBeInTheDocument();
  });

  it('displays file upload dropzone with instruction text', () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    expect(
      screen.getByText(/drag & drop file here, or click to browse/i),
    ).toBeInTheDocument();
  });

  it('shows file name with checkmark after valid file is selected', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('holdings.csv')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /success/i })).toBeInTheDocument();
    });
  });

  it('displays file size after file is selected', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings.csv', 2500000, 'text/csv'); // 2.5 MB
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/2\.4 MB/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid file type', async () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    // Use fireEvent for file upload to bypass the accept attribute restriction
    const file = createMockFile('document.pdf', 1024, 'application/pdf');
    // Find dropzone text first, then get parent element
    const dropzoneText = screen.getByText(/drag & drop file here/i);
    const dropzone = dropzoneText.closest('.border-dashed');
    const { fireEvent } = await import('@testing-library/react');

    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });

  it('shows error for file size exceeding 50MB limit', async () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    // Use fireEvent drop to bypass userEvent limitations with file size mock
    // 50 MB = 52428800 bytes, use 52428801 to exceed limit
    const file = createMockFile('large.csv', 52428801, 'text/csv'); // Over 50 MB
    const dropzoneText = screen.getByText(/drag & drop file here/i);
    const dropzone = dropzoneText.closest('.border-dashed');
    const { fireEvent } = await import('@testing-library/react');

    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/file size exceeds 50mb limit/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error for empty file', async () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    // Use fireEvent drop to bypass userEvent limitations with empty file
    const file = createMockFile('empty.csv', 0, 'text/csv');
    const dropzoneText = screen.getByText(/drag & drop file here/i);
    const dropzone = dropzoneText.closest('.border-dashed');
    const { fireEvent } = await import('@testing-library/react');

    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText(/file is empty/i)).toBeInTheDocument();
    });
  });

  it('displays validate-only checkbox after file is selected', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByRole('checkbox', { name: /validate only/i }),
      ).toBeInTheDocument();
    });
  });

  it('uploads file and shows progress when Upload & Process is clicked', async () => {
    const user = userEvent.setup();
    // Make the API call hang indefinitely to catch the uploading state
    mockUploadPortfolioFile.mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('holdings.csv')).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', {
      name: /upload & process/i,
    });
    await user.click(uploadButton);

    // The button text changes to "Uploading..." during upload
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /uploading/i }),
      ).toBeInTheDocument();
    });
  });

  it('shows success message after successful upload', async () => {
    const user = userEvent.setup();
    mockUploadPortfolioFile.mockResolvedValue({
      success: true,
      fileId: 'file-123',
    });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/file uploaded successfully/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error message when upload fails', async () => {
    const user = userEvent.setup();
    mockUploadPortfolioFile.mockRejectedValue(new Error('Network error'));

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('allows removing selected file', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('holdings.csv')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('holdings.csv')).not.toBeInTheDocument();
    });
  });

  it('validates-only without importing when validate-only is checked', async () => {
    const user = userEvent.setup();
    mockUploadPortfolioFile.mockResolvedValue({
      success: true,
      validationPassed: true,
      message: 'Validation passed. No errors found.',
    });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    const validateOnlyCheckbox = screen.getByRole('checkbox', {
      name: /validate only/i,
    });
    await user.click(validateOnlyCheckbox);

    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(mockUploadPortfolioFile).toHaveBeenCalledWith(
        'batch-1',
        'portfolio-1',
        'Holdings',
        expect.any(File),
        true,
      );
    });
  });

  it('closes modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <FileImportPopup
        isOpen={true}
        onClose={onClose}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('shows confirmation when closing with unsaved file', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText('holdings.csv')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/file not uploaded.*close anyway/i),
      ).toBeInTheDocument();
    });
  });
});

describe('File Import Popup - Story 2.3: Re-import Portfolio File', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens with re-import title and warning banner', () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_jan2024.csv"
        currentFileDate="2024-01-15"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    expect(
      screen.getByRole('dialog', {
        name: /re-import holdings for portfolio a/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/this will replace the existing file/i),
    ).toBeInTheDocument();
  });

  it('displays current file information', () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_jan2024.csv"
        currentFileDate="2024-01-15"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    expect(
      screen.getByText(/current file: holdings_jan2024\.csv/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/01\/15\/24/i)).toBeInTheDocument();
  });

  it('shows confirmation dialog before re-importing', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_old.csv"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings_new.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/are you sure you want to replace/i),
      ).toBeInTheDocument();
    });
  });

  it('proceeds with re-import when user confirms', async () => {
    const user = userEvent.setup();
    mockReimportPortfolioFile.mockResolvedValue({
      success: true,
      fileId: 'file-456',
    });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_old.csv"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings_new.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /yes, replace/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /yes, replace/i }));

    await waitFor(() => {
      expect(mockReimportPortfolioFile).toHaveBeenCalledWith(
        'batch-1',
        'portfolio-1',
        'Holdings',
        expect.any(File),
        false,
      );
    });
  });

  it('cancels re-import when user declines confirmation', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_old.csv"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings_new.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    // Click the AlertDialog cancel button (second cancel button)
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    await user.click(cancelButtons[cancelButtons.length - 1]);

    await waitFor(() => {
      expect(
        screen.queryByText(/are you sure you want to replace/i),
      ).not.toBeInTheDocument();
    });

    expect(mockReimportPortfolioFile).not.toHaveBeenCalled();
  });

  it('shows success message after successful re-import', async () => {
    const user = userEvent.setup();
    mockReimportPortfolioFile.mockResolvedValue({ success: true });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_old.csv"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings_new.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));
    await user.click(screen.getByRole('button', { name: /yes, replace/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/file re-imported successfully/i),
      ).toBeInTheDocument();
    });
  });

  it('shows rollback message when re-import fails', async () => {
    const user = userEvent.setup();
    mockReimportPortfolioFile.mockRejectedValue(new Error('Server error'));

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_old.csv"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const file = createMockFile('holdings_new.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));
    await user.click(screen.getByRole('button', { name: /yes, replace/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/original file remains unchanged/i),
      ).toBeInTheDocument();
    });
  });
});

describe('File Import Popup - Story 3.4: Upload Other Files', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens with correct title for Bloomberg file upload', () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        fileType="Security Master"
        fileCategory="Bloomberg"
        mode="upload"
        batchId="batch-1"
      />,
    );

    expect(
      screen.getByRole('dialog', {
        name: /upload security master - bloomberg/i,
      }),
    ).toBeInTheDocument();
  });

  it('opens with correct title for Custodian file upload', () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        fileType="Holdings Reconciliation"
        fileCategory="Custodian"
        mode="upload"
        batchId="batch-1"
      />,
    );

    expect(
      screen.getByRole('dialog', {
        name: /upload holdings reconciliation - custodian/i,
      }),
    ).toBeInTheDocument();
  });

  it('opens with correct title for Additional file upload', () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        fileType="FX Rates"
        fileCategory="Additional"
        mode="upload"
        batchId="batch-1"
      />,
    );

    expect(
      screen.getByRole('dialog', { name: /upload fx rates - additional/i }),
    ).toBeInTheDocument();
  });

  it('shows warning for large Bloomberg file', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        fileType="Prices"
        fileCategory="Bloomberg"
        mode="upload"
        batchId="batch-1"
      />,
    );

    // Simulate large file (calculated to exceed row threshold)
    const file = createMockFile('prices_large.csv', 10485760, 'text/csv'); // 10 MB
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByText(/large file detected.*may take several minutes/i),
      ).toBeInTheDocument();
    });
  });

  it('uploads Bloomberg file successfully', async () => {
    const user = userEvent.setup();
    mockUploadOtherFile.mockResolvedValue({
      success: true,
      fileId: 'bloomberg-123',
    });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        fileType="Prices"
        fileCategory="Bloomberg"
        mode="upload"
        batchId="batch-1"
      />,
    );

    const file = createMockFile('bloomberg_prices.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(mockUploadOtherFile).toHaveBeenCalledWith(
        'batch-1',
        'Prices',
        'Bloomberg',
        expect.any(File),
        false,
      );
    });
  });

  it('uploads Custodian file successfully', async () => {
    const user = userEvent.setup();
    mockUploadOtherFile.mockResolvedValue({
      success: true,
      fileId: 'custodian-123',
    });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        fileType="Holdings Reconciliation"
        fileCategory="Custodian"
        mode="upload"
        batchId="batch-1"
      />,
    );

    const file = createMockFile('custodian_holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(mockUploadOtherFile).toHaveBeenCalledWith(
        'batch-1',
        'Holdings Reconciliation',
        'Custodian',
        expect.any(File),
        false,
      );
    });
  });
});

describe('File Import Popup - Drag and Drop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('highlights dropzone when file is dragged over', async () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const dropzoneText = screen.getByText(/drag & drop file here/i);
    const dropzone = dropzoneText.closest('.border-dashed');

    // Simulate drag enter using fireEvent since userEvent doesn't support drag events well
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.dragEnter(dropzone!);

    await waitFor(() => {
      expect(dropzone).toHaveClass('border-blue-500');
    });
  });

  it('accepts dropped CSV file', async () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
        batchId="batch-1"
        portfolioId="portfolio-1"
      />,
    );

    const dropzoneText = screen.getByText(/drag & drop file here/i);
    const dropzone = dropzoneText.closest('.border-dashed');
    const file = createMockFile('holdings.csv', 1024, 'text/csv');

    // Simulate drop using fireEvent
    const { fireEvent } = await import('@testing-library/react');

    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(screen.getByText('holdings.csv')).toBeInTheDocument();
    });
  });
});
