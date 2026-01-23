'use client';

/**
 * Beta Form Component (Stories 5.11, 5.12)
 *
 * Epic 5: Market Data Maintenance
 *
 * Features:
 * - Add new instrument beta
 * - Edit existing beta
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
  createInstrumentBeta,
  updateInstrumentBeta,
} from '@/lib/api/market-data';

interface BetaData {
  id?: string;
  isin: string;
  instrumentName?: string;
  beta: number;
  benchmark: string;
  effectiveDate: string;
}

interface BetaFormProps {
  mode: 'add' | 'edit';
  betaId?: string;
  initialData?: BetaData;
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

const BENCHMARKS = ['S&P500', 'NASDAQ', 'DOW', 'FTSE100', 'DAX'];

export function BetaForm({
  mode,
  betaId,
  initialData,
  onSuccess,
  onCancel,
}: BetaFormProps) {
  const [isin, setIsin] = useState(initialData?.isin || '');
  const [benchmark, setBenchmark] = useState(initialData?.benchmark || '');
  const [beta, setBeta] = useState(initialData?.beta?.toString() || '');
  const [effectiveDate, setEffectiveDate] = useState(
    initialData?.effectiveDate || '',
  );

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
      setBenchmark(initialData.benchmark);
      setBeta(initialData.beta.toString());
      setEffectiveDate(initialData.effectiveDate);
    }
  }, [mode, initialData]);

  // Validate form
  const validate = () => {
    const errors: Record<string, string> = {};

    if (!isin) {
      errors.isin = 'ISIN is required';
    }
    if (!benchmark) {
      errors.benchmark = 'Benchmark is required';
    }
    if (!beta) {
      errors.beta = 'Beta is required';
    } else if (isNaN(parseFloat(beta))) {
      errors.beta = 'Beta must be a valid number';
    }
    if (!effectiveDate) {
      errors.effectiveDate = 'Effective date is required';
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
        benchmark,
        beta: parseFloat(beta),
        effectiveDate,
      };

      if (mode === 'add') {
        await createInstrumentBeta(data, 'currentUser');
        setSuccessMessage('Beta added successfully');
      } else if (betaId) {
        await updateInstrumentBeta(
          betaId,
          {
            beta: parseFloat(beta),
          },
          'currentUser',
        );
        setSuccessMessage('Beta updated successfully');
      }

      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.message.includes('409') ||
          err.message.includes('already exists')
        ) {
          setError('Beta already exists');
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
        {mode === 'add' ? 'Add Beta' : 'Edit Beta'}
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
        <Label htmlFor="benchmark">Benchmark</Label>
        {mode === 'add' ? (
          <Select value={benchmark} onValueChange={setBenchmark}>
            <SelectTrigger id="benchmark" aria-label="Benchmark">
              <SelectValue placeholder="Select benchmark" />
            </SelectTrigger>
            <SelectContent>
              {BENCHMARKS.map((bm) => (
                <SelectItem key={bm} value={bm}>
                  {bm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="benchmark"
            value={benchmark}
            disabled
            aria-label="Benchmark"
          />
        )}
        {validationErrors.benchmark && (
          <div className="text-sm text-red-500">
            {validationErrors.benchmark}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="beta">Beta</Label>
        <Input
          id="beta"
          type="number"
          step="0.01"
          value={beta}
          onChange={(e) => setBeta(e.target.value)}
          aria-label="Beta"
        />
        {validationErrors.beta && (
          <div className="text-sm text-red-500">{validationErrors.beta}</div>
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

export default BetaForm;
