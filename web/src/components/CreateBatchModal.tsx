'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8042';

const MONTHS = [
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

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateBatchModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBatchModalProps) {
  const currentDate = new Date();
  const currentMonth = MONTHS[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(String(currentYear));
  const [autoImport, setAutoImport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthError, setMonthError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Generate years (current year - 5 to current year + 1)
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

  // Track changes
  useEffect(() => {
    if (month !== currentMonth || year !== String(currentYear) || autoImport) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [month, year, autoImport, currentMonth, currentYear]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMonth(currentMonth);
      setYear(String(currentYear));
      setAutoImport(false);
      setError(null);
      setMonthError(null);
      setYearError(null);
      setHasChanges(false);
      setShowDiscardConfirm(false);
    }
  }, [isOpen, currentMonth, currentYear]);

  const handleClose = () => {
    if (hasChanges) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSubmit = async () => {
    // Reset errors
    setError(null);
    setMonthError(null);
    setYearError(null);

    // Validate
    let hasError = false;
    if (!month) {
      setMonthError('Month is required');
      hasError = true;
    }
    if (!year) {
      setYearError('Year is required');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/report-batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          year: Number(year),
          autoImport,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.Messages?.[0];

        if (response.status === 409) {
          setError(
            errorMessage || `A batch for ${month} ${year} already exists`,
          );
        } else if (response.status === 500) {
          setError(
            errorMessage || 'Unable to create batch. Please try again later.',
          );
        } else {
          setError(
            errorMessage || 'Unable to create batch. Please try again later.',
          );
        }
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      if (err instanceof Error && err.message.includes('timeout')) {
        setError('Request timed out. Please try again.');
      } else {
        setError('Unable to create batch. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-labelledby="modal-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-xl font-semibold mb-4">
          Create New Report Batch
        </h2>

        {/* Discard confirmation */}
        {showDiscardConfirm && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              Are you sure? Unsaved changes will be lost.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleConfirmDiscard}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Yes, discard changes
              </button>
              <button
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Keep editing
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Month select */}
        <div className="mb-4">
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Month
          </label>
          <select
            id="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setMonthError(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          {monthError && (
            <p className="mt-1 text-sm text-red-600">{monthError}</p>
          )}
        </div>

        {/* Year select */}
        <div className="mb-4">
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Year
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setYearError(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
          {yearError && (
            <p className="mt-1 text-sm text-red-600">{yearError}</p>
          )}
        </div>

        {/* Auto-import checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoImport"
              checked={autoImport}
              onChange={(e) => setAutoImport(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Auto-Import from SFTP</span>
          </label>
          {autoImport && (
            <p className="mt-1 text-sm text-gray-500 ml-6">
              Files will be imported automatically from configured SFTP server
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Batch'}
          </button>
        </div>
      </div>
    </div>
  );
}
