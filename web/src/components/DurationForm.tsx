'use client';

/**
 * Duration Form Component (Stories 5.8, 5.9)
 *
 * Epic 5: Market Data Maintenance
 *
 * Features:
 * - Add new instrument duration
 * - Edit existing duration
 * - Validation and error handling
 * - Audit trail support
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createInstrumentDuration,
  updateInstrumentDuration,
} from '@/lib/api/market-data';

interface DurationData {
  id?: string;
  isin: string;
  instrumentName?: string;
  duration: number;
  ytm: number;
  effectiveDate: string;
}

interface DurationFormProps {
  mode: 'add' | 'edit';
  durationId?: string;
  initialData?: DurationData;
  onSuccess: () => void;
  onCancel?: () => void;
}

const ISINS = [
  'US0378331005',
  'US5949181045',
  'US02079K1079',
  'GB0002374006',
  'DE0005140008',
];

export function DurationForm({
  mode,
  durationId,
  initialData,
  onSuccess,
  onCancel,
}: DurationFormProps) {
  const [isin, setIsin] = useState(initialData?.isin || '');
  const [effectiveDate, setEffectiveDate] = useState(
    initialData?.effectiveDate || '',
  );
  const [duration, setDuration] = useState(
    initialData?.duration?.toString() || '',
  );
  const [ytm, setYtm] = useState(initialData?.ytm?.toString() || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setIsin(initialData.isin);
      setEffectiveDate(initialData.effectiveDate);
      setDuration(initialData.duration.toString());
      setYtm(initialData.ytm.toString());
    }
  }, [mode, initialData]);

  // Validate form
  const validate = () => {
    const errors: Record<string, string> = {};

    if (!isin) {
      errors.isin = 'ISIN is required';
    }
    if (!effectiveDate) {
      errors.effectiveDate = 'Effective date is required';
    }
    if (!duration) {
      errors.duration = 'Duration is required';
    } else if (isNaN(parseFloat(duration)) || parseFloat(duration) < 0) {
      errors.duration = 'Duration must be a positive number';
    }
    if (!ytm) {
      errors.ytm = 'YTM is required';
    } else if (isNaN(parseFloat(ytm))) {
      errors.ytm = 'YTM must be a valid number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const data = {
        isin,
        instrumentName: '', // Will be populated by API
        effectiveDate,
        duration: parseFloat(duration),
        ytm: parseFloat(ytm),
      };

      if (mode === 'add') {
        await createInstrumentDuration(data, 'currentUser');
        setSuccessMessage('Duration added successfully');
      } else if (durationId) {
        await updateInstrumentDuration(
          durationId,
          {
            duration: parseFloat(duration),
            ytm: parseFloat(ytm),
          },
          'currentUser',
        );
        setSuccessMessage('Duration updated successfully');
      }

      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.message.includes('409') ||
          err.message.includes('already exists')
        ) {
          setError('Duration already exists');
        } else {
          setError('Failed to update. Please try again.');
        }
      } else {
        setError('Failed to update. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">
        {mode === 'add' ? 'Add Duration' : 'Edit Duration'}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="isin">ISIN</Label>
        {mode === 'add' ? (
          <Select value={isin} onValueChange={setIsin}>
            <SelectTrigger id="isin" aria-label="ISIN">
              <SelectValue placeholder="Select ISIN" />
            </SelectTrigger>
            <SelectContent>
              {ISINS.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input id="isin" value={isin} disabled aria-label="ISIN" />
        )}
        {validationErrors.isin && (
          <div className="text-sm text-red-500">{validationErrors.isin}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="effectiveDate">Effective Date</Label>
        <Input
          id="effectiveDate"
          type="date"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
          disabled={mode === 'edit'}
          aria-label="Effective Date"
        />
        {validationErrors.effectiveDate && (
          <div className="text-sm text-red-500">
            {validationErrors.effectiveDate}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration</Label>
        <Input
          id="duration"
          type="number"
          step="0.01"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          aria-label="Duration"
        />
        {validationErrors.duration && (
          <div className="text-sm text-red-500">
            {validationErrors.duration}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ytm">YTM</Label>
        <Input
          id="ytm"
          type="number"
          step="0.01"
          value={ytm}
          onChange={(e) => setYtm(e.target.value)}
          aria-label="YTM"
        />
        {validationErrors.ytm && (
          <div className="text-sm text-red-500">{validationErrors.ytm}</div>
        )}
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}
      {successMessage && (
        <div className="text-sm text-green-600">{successMessage}</div>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

export default DurationForm;
