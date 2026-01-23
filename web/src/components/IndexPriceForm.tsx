'use client';

/**
 * Index Price Form Component (Stories 5.2, 5.3)
 *
 * Epic 5: Market Data Maintenance
 *
 * Features:
 * - Add new index price
 * - Edit existing index price
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
import { createIndexPrice, updateIndexPrice } from '@/lib/api/market-data';
import { STATIC_DATA_API_URL } from '@/lib/utils/constants';

interface IndexPriceData {
  id?: string;
  indexCode: string;
  indexName?: string;
  date: string;
  price: number;
  currency: string;
}

interface IndexPriceFormProps {
  mode: 'add' | 'edit';
  priceId?: string;
  initialData?: IndexPriceData;
  onSuccess: () => void;
  onCancel?: () => void;
}

const INDEX_CODES = ['S&P500', 'NASDAQ', 'DOW', 'FTSE100', 'DAX'];
const CURRENCIES = ['USD', 'GBP', 'EUR', 'JPY', 'CHF'];

export function IndexPriceForm({
  mode,
  priceId,
  initialData,
  onSuccess,
  onCancel,
}: IndexPriceFormProps) {
  const [indexCode, setIndexCode] = useState(initialData?.indexCode || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setIndexCode(initialData.indexCode);
      setDate(initialData.date);
      setPrice(initialData.price.toString());
      setCurrency(initialData.currency);
    }
  }, [mode, initialData]);

  // Validate form
  const validate = () => {
    const errors: Record<string, string> = {};

    if (!indexCode) {
      errors.indexCode = 'Index code is required';
    }
    if (!date) {
      errors.date = 'Date is required';
    }
    if (!price) {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      errors.price = 'Price must be a positive number';
    }
    if (!currency) {
      errors.currency = 'Currency is required';
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
        indexCode,
        date,
        price: parseFloat(price),
        currency,
      };

      if (mode === 'add') {
        await createIndexPrice(
          data as Parameters<typeof createIndexPrice>[0],
          'currentUser',
        );
        setSuccessMessage('Price added successfully');
      } else if (priceId) {
        await updateIndexPrice(priceId, data, 'currentUser');
        setSuccessMessage('Price updated successfully');
      }

      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        // Check for conflict error (duplicate)
        if (
          err.message.includes('409') ||
          err.message.includes('already exists')
        ) {
          setError('Price already exists for this date');
        } else {
          setError(
            mode === 'add'
              ? 'Failed to add. Please try again.'
              : 'Failed to update. Please try again.',
          );
        }
      } else {
        setError(
          mode === 'add'
            ? 'Failed to add. Please try again.'
            : 'Failed to update. Please try again.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">
        {mode === 'add' ? 'Add Price' : 'Edit Price'}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="indexCode">Index Code</Label>
        {mode === 'add' ? (
          <Select value={indexCode} onValueChange={setIndexCode}>
            <SelectTrigger id="indexCode" aria-label="Index Code">
              <SelectValue placeholder="Select index" />
            </SelectTrigger>
            <SelectContent>
              {INDEX_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="indexCode"
            value={indexCode}
            disabled
            aria-label="Index Code"
          />
        )}
        {validationErrors.indexCode && (
          <div className="text-sm text-red-500">
            {validationErrors.indexCode}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={mode === 'edit'}
          aria-label="Date"
        />
        {validationErrors.date && (
          <div className="text-sm text-red-500">{validationErrors.date}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          aria-label="Price"
        />
        {validationErrors.price && (
          <div className="text-sm text-red-500">{validationErrors.price}</div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        {mode === 'add' ? (
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency" aria-label="Currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="currency"
            value={currency}
            disabled
            aria-label="Currency"
          />
        )}
        {validationErrors.currency && (
          <div className="text-sm text-red-500">
            {validationErrors.currency}
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

export default IndexPriceForm;
