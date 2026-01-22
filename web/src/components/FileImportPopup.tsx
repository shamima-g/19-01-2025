'use client';

/**
 * File Import Popup Component (Stories 2.2, 2.3, 3.4)
 *
 * A modal for uploading or re-importing portfolio and other files.
 * Supports drag-and-drop, file validation, progress indicators, and confirm dialogs.
 */

import { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useToast } from '@/contexts/ToastContext';
import {
  uploadPortfolioFile,
  reimportPortfolioFile,
  uploadOtherFile,
} from '@/lib/api/file-upload';
import { CheckCircle2, XCircle, Upload, AlertTriangle, X } from 'lucide-react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5 MB - show warning
const VALID_FILE_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const VALID_EXTENSIONS = ['.csv', '.xls', '.xlsx'];

interface FileImportPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  // Portfolio file props
  portfolioId?: string;
  portfolioName?: string;
  batchId?: string;
  // File type info
  fileType?: string;
  fileCategory?: string; // 'Bloomberg' | 'Custodian' | 'Additional' for other files
  // Upload or re-import mode
  mode?: 'upload' | 'reimport';
  // Re-import mode shows current file info
  existingFileName?: string;
  currentFileName?: string;
  currentFileDate?: string;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

interface FileValidation {
  isValid: boolean;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function validateFile(file: File): FileValidation {
  // Check for empty file
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size exceeds 50MB limit' };
  }

  // Check file type by extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = VALID_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );
  const hasValidType = VALID_FILE_TYPES.includes(file.type) || file.type === '';

  if (!hasValidExtension && !hasValidType) {
    return {
      isValid: false,
      error: 'Invalid file type. CSV or Excel files only',
    };
  }

  return { isValid: true };
}

function getDialogTitle(
  mode: 'upload' | 'reimport',
  fileType?: string,
  portfolioName?: string,
  fileCategory?: string,
): string {
  const action = mode === 'reimport' ? 'Re-import' : 'Upload';

  if (portfolioName) {
    return `${action} ${fileType} for ${portfolioName}`;
  }

  if (fileCategory) {
    return `${action} ${fileType} - ${fileCategory}`;
  }

  return `${action} ${fileType || 'File'}`;
}

export function FileImportPopup({
  isOpen,
  onClose,
  onSuccess,
  portfolioId,
  portfolioName,
  batchId,
  fileType,
  fileCategory,
  mode = 'upload',
  currentFileName,
  currentFileDate,
}: FileImportPopupProps) {
  const { showToast } = useToast();

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [validateOnly, setValidateOnly] = useState(false);
  const [isLargeFile, setIsLargeFile] = useState(false);

  // Upload state
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  // Confirmation dialogs
  const [showReimportConfirm, setShowReimportConfirm] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset all state - called when dialog opens via onOpenChange
  const resetState = useCallback(() => {
    setSelectedFile(null);
    setFileError(null);
    setValidateOnly(false);
    setIsLargeFile(false);
    setUploadState('idle');
    setUploadProgress(0);
    setUploadError(null);
    setUploadMessage(null);
    setIsDragging(false);
    setShowReimportConfirm(false);
    setShowCloseConfirm(false);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const validation = validateFile(file);

    if (!validation.isValid) {
      setSelectedFile(null);
      setFileError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setFileError(null);
    setUploadState('idle');
    setUploadError(null);
    setUploadMessage(null);
    setIsLargeFile(file.size > LARGE_FILE_THRESHOLD);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFileError(null);
    setUploadState('idle');
    setUploadError(null);
    setUploadMessage(null);
    setIsLargeFile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !batchId) return;

    // For reimport mode, show confirmation first
    if (mode === 'reimport' && !showReimportConfirm) {
      setShowReimportConfirm(true);
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);
    setUploadError(null);
    setUploadMessage(null);

    // Simulate progress (real progress would come from XMLHttpRequest)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      let response;

      if (portfolioId && fileType) {
        // Portfolio file upload
        if (mode === 'reimport') {
          response = await reimportPortfolioFile(
            batchId,
            portfolioId,
            fileType,
            selectedFile,
            validateOnly,
          );
        } else {
          response = await uploadPortfolioFile(
            batchId,
            portfolioId,
            fileType,
            selectedFile,
            validateOnly,
          );
        }
      } else if (fileCategory && fileType) {
        // Other file upload (Bloomberg, Custodian, Additional)
        response = await uploadOtherFile(
          batchId,
          fileType,
          fileCategory,
          selectedFile,
          validateOnly,
        );
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response?.success) {
        setUploadState('success');
        const successMessage =
          mode === 'reimport'
            ? 'File re-imported successfully'
            : validateOnly
              ? response.message || 'Validation passed. No errors found.'
              : 'File uploaded successfully';
        setUploadMessage(successMessage);

        showToast({
          variant: 'success',
          title: successMessage,
        });

        // Notify parent of success
        onSuccess?.();
      } else {
        setUploadState('error');
        setUploadError(response?.message || 'Upload failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadState('error');
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to upload file';
      setUploadError(errorMessage);

      if (mode === 'reimport') {
        setUploadMessage('Original file remains unchanged');
      }
    }
  }, [
    selectedFile,
    batchId,
    portfolioId,
    fileType,
    fileCategory,
    mode,
    validateOnly,
    showReimportConfirm,
    showToast,
    onSuccess,
  ]);

  const handleConfirmReimport = useCallback(() => {
    setShowReimportConfirm(false);
    handleUpload();
  }, [handleUpload]);

  const handleCancelReimport = useCallback(() => {
    setShowReimportConfirm(false);
  }, []);

  const handleClose = useCallback(() => {
    // If file is selected but not uploaded, show confirmation
    if (selectedFile && uploadState !== 'success') {
      setShowCloseConfirm(true);
      return;
    }
    onClose();
  }, [selectedFile, uploadState, onClose]);

  const handleConfirmClose = useCallback(() => {
    setShowCloseConfirm(false);
    onClose();
  }, [onClose]);

  const handleCancelClose = useCallback(() => {
    setShowCloseConfirm(false);
  }, []);

  // Handle dialog open/close state changes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        // Dialog is opening - reset state
        resetState();
      } else {
        // Dialog is closing - trigger close handler
        handleClose();
      }
    },
    [resetState, handleClose],
  );

  const title = getDialogTitle(mode, fileType, portfolioName, fileCategory);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-md"
          aria-labelledby="file-import-title"
        >
          <DialogHeader>
            <DialogTitle id="file-import-title">{title}</DialogTitle>
            {mode === 'reimport' && (
              <DialogDescription className="sr-only">
                Re-import file dialog with warning about replacing existing file
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            {/* Re-import warning banner */}
            {mode === 'reimport' && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">
                    This will replace the existing file
                  </p>
                  {currentFileName && (
                    <p className="mt-1">
                      Current file: {currentFileName}
                      {currentFileDate && ` (${formatDate(currentFileDate)})`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Large file warning */}
            {isLargeFile && uploadState === 'idle' && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="text-sm">
                  Large file detected. Processing may take several minutes.
                </p>
              </div>
            )}

            {/* Dropzone */}
            <div
              className={cn(
                'relative border-2 border-dashed rounded-lg p-6 transition-colors',
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400',
                uploadState === 'uploading' && 'pointer-events-none opacity-50',
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Browse files"
                disabled={uploadState === 'uploading'}
              />

              {selectedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {uploadState === 'success' ? (
                      <CheckCircle2
                        className="h-5 w-5 text-green-500"
                        role="img"
                        aria-label="Success"
                      />
                    ) : uploadState === 'error' ? (
                      <XCircle
                        className="h-5 w-5 text-red-500"
                        role="img"
                        aria-label="Error"
                      />
                    ) : (
                      <CheckCircle2
                        className="h-5 w-5 text-green-500"
                        role="img"
                        aria-label="Success"
                      />
                    )}
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  {uploadState === 'idle' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFile();
                      }}
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag & drop file here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    CSV or Excel files, max 50MB
                  </p>
                </div>
              )}
            </div>

            {/* File validation error */}
            {fileError && (
              <p className="text-sm text-red-600" role="alert">
                {fileError}
              </p>
            )}

            {/* Upload progress */}
            {uploadState === 'uploading' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Success message */}
            {uploadState === 'success' && uploadMessage && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="text-sm">{uploadMessage}</p>
              </div>
            )}

            {/* Error message */}
            {uploadState === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                <p className="text-sm font-medium">
                  {uploadError || 'Unable to upload file'}
                </p>
                {uploadMessage && (
                  <p className="text-sm mt-1">{uploadMessage}</p>
                )}
              </div>
            )}

            {/* Validate only option */}
            {uploadState === 'idle' && selectedFile && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="validate-only"
                  checked={validateOnly}
                  onCheckedChange={(checked) =>
                    setValidateOnly(checked === true)
                  }
                />
                <Label htmlFor="validate-only" className="text-sm font-normal">
                  Validate only (don&apos;t import)
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploadState === 'uploading'}
            >
              Cancel
            </Button>
            {uploadState === 'success' ? (
              <Button onClick={onClose}>Close</Button>
            ) : (
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadState === 'uploading'}
              >
                {uploadState === 'uploading'
                  ? 'Uploading...'
                  : 'Upload & Process'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Re-import confirmation dialog */}
      <AlertDialog
        open={showReimportConfirm}
        onOpenChange={setShowReimportConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Re-import</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to replace the existing file? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelReimport}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReimport}>
              Yes, Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close without upload confirmation */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              File not uploaded. Close anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Yes, Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
