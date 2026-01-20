'use client';

/**
 * Upload Instruments File
 * Epic 4, Story 4.4
 *
 * Provides file upload interface for bulk instrument import from Excel/CSV.
 */

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/contexts/ToastContext';
import { uploadInstrumentsFile } from '@/lib/api/instruments';
import type { InstrumentUploadResponse } from '@/types/instrument';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
];
const VALID_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

interface ValidationError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

interface UploadResult {
  success: boolean;
  instrumentsAdded: number;
  instrumentsUpdated: number;
  totalProcessed: number;
  errors: number;
  validationErrors?: ValidationError[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function InstrumentUploadPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType =
      VALID_FILE_TYPES.includes(file.type) ||
      VALID_EXTENSIONS.includes(extension);

    if (!isValidType) {
      return 'Invalid file format. Please upload an Excel (.xlsx) or CSV file.';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds maximum of 5 MB. Your file is ${formatFileSize(file.size)}.`;
    }

    return null;
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      setUploadResult(null);

      if (!file) {
        setSelectedFile(null);
        setFileError(null);
        return;
      }

      const error = validateFile(file);
      if (error) {
        setFileError(error);
        setSelectedFile(null);
      } else {
        setFileError(null);
        setSelectedFile(file);
      }
    },
    [validateFile],
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const response: InstrumentUploadResponse = await uploadInstrumentsFile(
        selectedFile,
        'CurrentUser',
      );

      const result: UploadResult = {
        success: response.success,
        instrumentsAdded: response.importedCount || 0,
        instrumentsUpdated: 0, // API may not differentiate - update based on actual response
        totalProcessed: response.importedCount || 0,
        errors: response.errorCount || 0,
        validationErrors: response.errors?.map((e) => ({
          row: e.row,
          column: e.field,
          message: e.message,
          value: '',
        })),
      };

      setUploadResult(result);

      if (response.success) {
        showToast({
          title: 'Success',
          message: `Successfully imported ${response.importedCount} instruments`,
          variant: 'success',
        });
      } else {
        showToast({
          title: 'Upload Failed',
          message: response.message || 'Some instruments could not be imported',
          variant: 'error',
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Upload failed. Please try again.';
      setUploadResult({
        success: false,
        instrumentsAdded: 0,
        instrumentsUpdated: 0,
        totalProcessed: 0,
        errors: 1,
      });
      showToast({
        title: 'Error',
        message,
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewInstruments = () => {
    router.push('/instruments');
  };

  const handleSelectAnotherFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Instruments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Import instruments from an Excel (.xlsx) or CSV file
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* File Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            id="file-input"
            aria-label="Select file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile && !uploadResult && (
            <>
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload File"
              >
                Upload File
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                or drag and drop your file here
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Supports Excel (.xlsx) and CSV files up to 5MB
              </p>
            </>
          )}

          {selectedFile && !uploadResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  aria-label="Upload"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSelectAnotherFile}
                  disabled={isUploading}
                >
                  Choose Different File
                </Button>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div
                    role="progressbar"
                    aria-label="Uploading"
                    className="w-full bg-gray-200 rounded-full h-2"
                  >
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Uploading and processing file...
                  </p>
                </div>
              )}
            </div>
          )}

          {fileError && (
            <p className="mt-4 text-sm text-red-600">{fileError}</p>
          )}
        </div>

        {/* Upload Result Section */}
        {uploadResult && (
          <div className="space-y-4">
            {uploadResult.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800">Upload Complete</h3>
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <p>{uploadResult.instrumentsAdded} instruments added</p>
                  {uploadResult.instrumentsUpdated > 0 && (
                    <p>{uploadResult.instrumentsUpdated} instruments updated</p>
                  )}
                  <p>Total processed: {uploadResult.totalProcessed}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleViewInstruments}
                    aria-label="View Instruments"
                  >
                    View Instruments
                  </Button>
                  <Button variant="outline" onClick={handleSelectAnotherFile}>
                    Upload Another File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-800">Upload Failed</h3>
                <p className="mt-1 text-sm text-red-700">
                  {uploadResult.errors} errors found in the file
                </p>

                {uploadResult.validationErrors &&
                  uploadResult.validationErrors.length > 0 && (
                    <div className="mt-4">
                      <Table aria-label="Validation errors">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Column</TableHead>
                            <TableHead>Error</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.validationErrors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>Row {error.row}</TableCell>
                              <TableCell>{error.column}</TableCell>
                              <TableCell>{error.message}</TableCell>
                              <TableCell>{error.value || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                <div className="mt-4">
                  <Button variant="outline" onClick={handleSelectAnotherFile}>
                    Try Another File
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Format Guide */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">
            File Format Requirements
          </h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>First row must contain column headers</li>
            <li>Required columns: ISIN, Name, Asset Class, Currency</li>
            <li>Optional columns: Issuer, Maturity Date</li>
            <li>ISIN must be 12 alphanumeric characters</li>
            <li>Duplicate ISINs will update existing instruments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
