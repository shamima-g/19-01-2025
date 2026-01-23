'use client';

/**
 * Instrument Form Component
 *
 * Epic 4: Instrument Static Data Management
 * Stories: 4.2 (Add), 4.3 (Update)
 *
 * Features:
 * - Add new instrument with all required fields
 * - Edit existing instrument (ISIN disabled)
 * - Form validation
 * - Audit trail recording via LastChangedUser header
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STATIC_DATA_API_URL } from '@/lib/utils/constants';
import type { Instrument } from '@/lib/api/instruments';

interface InstrumentFormProps {
  mode: 'add' | 'edit';
  instrumentId?: string;
  initialData?: Partial<Instrument>;
  onSuccess: (instrument: Instrument) => void;
  onCancel?: () => void;
}

const ASSET_CLASSES = [
  'Equity',
  'Fixed Income',
  'Fund',
  'Commodity',
  'Currency',
];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD'];

export function InstrumentForm({
  mode,
  instrumentId,
  initialData,
  onSuccess,
  onCancel,
}: InstrumentFormProps) {
  const [formData, setFormData] = useState({
    isin: initialData?.isin || '',
    name: initialData?.name || '',
    assetClass: initialData?.assetClass || '',
    currency: initialData?.currency || '',
    issuer: initialData?.issuer || '',
    maturityDate: initialData?.maturityDate || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.isin.trim()) {
      newErrors.isin = 'ISIN is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.assetClass) {
      newErrors.assetClass = 'Asset Class is required';
    }
    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const url =
        mode === 'add'
          ? `${STATIC_DATA_API_URL}/v1/instruments`
          : `${STATIC_DATA_API_URL}/v1/instruments/${instrumentId}`;

      const method = mode === 'add' ? 'POST' : 'PUT';

      const body =
        mode === 'add'
          ? formData
          : {
              name: formData.name,
              assetClass: formData.assetClass,
              currency: formData.currency,
              issuer: formData.issuer,
              maturityDate: formData.maturityDate || null,
            };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          LastChangedUser: 'currentUser', // In real app, get from auth context
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.Messages?.[0] || 'Operation failed';
        setApiError(message);
        return;
      }

      const result = await response.json();

      setSuccessMessage(
        mode === 'add'
          ? 'Instrument added successfully'
          : 'Instrument updated successfully',
      );

      onSuccess(result);
    } catch {
      setApiError(
        mode === 'add'
          ? 'Failed to add instrument. Please try again.'
          : 'Failed to update instrument. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        {mode === 'add' ? 'Add Instrument' : 'Edit Instrument'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ISIN */}
        <div className="space-y-2">
          <Label htmlFor="isin">ISIN</Label>
          <Input
            id="isin"
            value={formData.isin}
            onChange={(e) => handleInputChange('isin', e.target.value)}
            disabled={mode === 'edit'}
            aria-invalid={!!errors.isin}
          />
          {errors.isin && (
            <div className="text-red-500 text-sm">{errors.isin}</div>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <div className="text-red-500 text-sm">{errors.name}</div>
          )}
        </div>

        {/* Asset Class */}
        <div className="space-y-2">
          <Label htmlFor="assetClass">Asset Class</Label>
          <select
            id="assetClass"
            aria-label="Asset Class"
            value={formData.assetClass}
            onChange={(e) => handleInputChange('assetClass', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select asset class</option>
            {ASSET_CLASSES.map((ac) => (
              <option key={ac} value={ac}>
                {ac}
              </option>
            ))}
          </select>
          {errors.assetClass && (
            <div className="text-red-500 text-sm">{errors.assetClass}</div>
          )}
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <select
            id="currency"
            aria-label="Currency"
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select currency</option>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.currency && (
            <div className="text-red-500 text-sm">{errors.currency}</div>
          )}
        </div>

        {/* Issuer */}
        <div className="space-y-2">
          <Label htmlFor="issuer">Issuer</Label>
          <Input
            id="issuer"
            value={formData.issuer}
            onChange={(e) => handleInputChange('issuer', e.target.value)}
          />
        </div>

        {/* Maturity Date */}
        <div className="space-y-2">
          <Label htmlFor="maturityDate">Maturity Date</Label>
          <Input
            id="maturityDate"
            type="date"
            value={formData.maturityDate}
            onChange={(e) => handleInputChange('maturityDate', e.target.value)}
          />
        </div>

        {/* API Error */}
        {apiError && <div className="text-red-500">{apiError}</div>}

        {/* Success Message */}
        {successMessage && (
          <div className="text-green-600">{successMessage}</div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default InstrumentForm;
