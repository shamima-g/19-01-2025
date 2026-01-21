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
 *
 * NOTE: These tests are skipped (describe.skip) because FileImportPopup component
 * is stubbed for TDD red phase. Type errors are expected and suppressed.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
// FIXME: Uncomment when implemented: import { FileImportPopup } from '@/components/FileImportPopup';
import { post } from '@/lib/api/client';

// Temporary stub for TDD red phase - typed interface for expected props
interface FileImportPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  portfolioId?: string;
  portfolioName?: string;
  fileType?: string;
  fileCategory?: string;
  mode?: 'upload' | 'reimport';
  existingFileName?: string;
  currentFileName?: string;
  currentFileDate?: string;
}
const FileImportPopup: React.FC<FileImportPopupProps> = () => null;

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  post: vi.fn(),
}));

// Mock ToastContext
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const mockPost = post as ReturnType<typeof vi.fn>;

// Mock File object for testing
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File(['content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe.skip('File Import Popup - Story 2.2: Upload Portfolio File', () => {
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
      />,
    );

    const file = createMockFile('holdings.csv', 2500000, 'text/csv'); // 2.5 MB
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/2\.5 mb/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid file type', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
      />,
    );

    const file = createMockFile('document.pdf', 1024, 'application/pdf');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid file type.*csv or excel files only/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error for file size exceeding 50MB limit', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
      />,
    );

    const file = createMockFile('large.csv', 52428800, 'text/csv'); // 50+ MB
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByText(/file size exceeds 50mb limit/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error for empty file', async () => {
    const user = userEvent.setup();
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
      />,
    );

    const file = createMockFile('empty.csv', 0, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/file is empty/i)).toBeInTheDocument();
    });
  });

  it('displays validate-only checkbox option', () => {
    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
      />,
    );

    expect(
      screen.getByRole('checkbox', { name: /validate only/i }),
    ).toBeInTheDocument();
  });

  it('uploads file and shows progress when Upload & Process is clicked', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ success: true, fileId: 'file-123' });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
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

    await waitFor(() => {
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    });
  });

  it('shows success message after successful upload', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ success: true, fileId: 'file-123' });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
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
    mockPost.mockRejectedValue(new Error('Network error'));

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="upload"
      />,
    );

    const file = createMockFile('holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to upload file/i)).toBeInTheDocument();
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
    mockPost.mockResolvedValue({
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
      expect(mockPost).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ validateOnly: true }),
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

describe.skip('File Import Popup - Story 2.3: Re-import Portfolio File', () => {
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
      />,
    );

    const file = createMockFile('holdings_new.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/are you sure you want to replace the existing file/i),
      ).toBeInTheDocument();
    });
  });

  it('proceeds with re-import when user confirms', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ success: true, fileId: 'file-456' });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_old.csv"
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
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/reimport'),
        expect.anything(),
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

    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    await user.click(cancelButtons[0]); // Click the confirmation cancel button

    await waitFor(() => {
      expect(
        screen.queryByText(/are you sure you want to replace/i),
      ).not.toBeInTheDocument();
    });

    expect(mockPost).not.toHaveBeenCalled();
  });

  it('shows success message after successful re-import', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ success: true });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_old.csv"
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
    mockPost.mockRejectedValue(new Error('Server error'));

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        portfolioName="Portfolio A"
        fileType="Holdings"
        mode="reimport"
        currentFileName="holdings_old.csv"
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

describe.skip('File Import Popup - Story 3.4: Upload Other Files', () => {
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
    mockPost.mockResolvedValue({ success: true, fileId: 'bloomberg-123' });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        fileType="Prices"
        fileCategory="Bloomberg"
        mode="upload"
      />,
    );

    const file = createMockFile('bloomberg_prices.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/other-files/upload'),
        expect.objectContaining({
          fileCategory: 'Bloomberg',
        }),
      );
    });
  });

  it('uploads Custodian file successfully', async () => {
    const user = userEvent.setup();
    mockPost.mockResolvedValue({ success: true, fileId: 'custodian-123' });

    render(
      <FileImportPopup
        isOpen={true}
        onClose={vi.fn()}
        fileType="Holdings Reconciliation"
        fileCategory="Custodian"
        mode="upload"
      />,
    );

    const file = createMockFile('custodian_holdings.csv', 1024, 'text/csv');
    const input = screen.getByLabelText(/browse/i);

    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /upload & process/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/other-files/upload'),
        expect.objectContaining({
          fileCategory: 'Custodian',
        }),
      );
    });
  });
});

describe.skip('File Import Popup - Drag and Drop', () => {
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
      />,
    );

    const dropzone = screen.getByText(/drag & drop file here/i).closest('div');

    // Simulate drag enter
    const dragEvent = new DragEvent('dragenter', { bubbles: true });
    dropzone?.dispatchEvent(dragEvent);

    await waitFor(() => {
      expect(dropzone).toHaveClass(/border-blue/i); // test-quality-ignore - visual feedback for drag highlighting
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
      />,
    );

    const dropzone = screen.getByText(/drag & drop file here/i).closest('div');
    const file = createMockFile('holdings.csv', 1024, 'text/csv');

    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      dataTransfer: {
        files: [file],
      } as unknown as DataTransfer,
    });

    dropzone?.dispatchEvent(dropEvent);

    await waitFor(() => {
      expect(screen.getByText('holdings.csv')).toBeInTheDocument();
    });
  });
});
