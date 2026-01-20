'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { ColumnVisibility } from '@/types/instrument';
import {
  INSTRUMENT_COLUMNS,
  SUMMARY_COLUMN_VISIBILITY,
  ALL_COLUMNS_VISIBILITY,
} from '@/types/instrument';

interface ColumnVisibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
}

export function ColumnVisibilityDialog({
  open,
  onOpenChange,
  columnVisibility,
  onColumnVisibilityChange,
}: ColumnVisibilityDialogProps) {
  const [localVisibility, setLocalVisibility] =
    useState<ColumnVisibility>(columnVisibility);
  const [error, setError] = useState<string | null>(null);

  // Handle dialog open/close - reset state when opening
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset to current visibility when dialog opens
      setLocalVisibility(columnVisibility);
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleCheckboxChange = (columnKey: keyof ColumnVisibility) => {
    setLocalVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
    setError(null);
  };

  const handleApply = () => {
    // Check if at least one column is visible
    const hasVisibleColumn = Object.values(localVisibility).some(
      (visible) => visible,
    );

    if (!hasVisibleColumn) {
      setError('At least one column must be visible');
      return;
    }

    onColumnVisibilityChange(localVisibility);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalVisibility(columnVisibility);
    setError(null);
    onOpenChange(false);
  };

  const handleSummary = () => {
    setLocalVisibility(SUMMARY_COLUMN_VISIBILITY);
    setError(null);
  };

  const handleAllColumns = () => {
    setLocalVisibility(ALL_COLUMNS_VISIBILITY);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Column Visibility</DialogTitle>
          <DialogDescription>
            Choose which columns to display in the grid.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick toggle buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSummary}
              aria-label="Summary"
            >
              Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAllColumns}
              aria-label="All Columns"
            >
              All Columns
            </Button>
          </div>

          {/* Column checkboxes */}
          <div className="space-y-3">
            {INSTRUMENT_COLUMNS.map((column) => (
              <div key={column.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  role="checkbox"
                  id={`column-${column.key}`}
                  aria-label={column.label}
                  checked={
                    localVisibility[column.key as keyof ColumnVisibility]
                  }
                  onChange={() =>
                    handleCheckboxChange(column.key as keyof ColumnVisibility)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor={`column-${column.key}`}>{column.label}</Label>
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} aria-label="Cancel">
            Cancel
          </Button>
          <Button onClick={handleApply} aria-label="Apply">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
