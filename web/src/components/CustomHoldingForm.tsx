'use client';

/**
 * Custom Holding Form Component (Story 6.2, 6.3)
 *
 * Supports both Add and Edit modes:
 * - Add mode: All fields editable
 * - Edit mode: Portfolio and Instrument read-only
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getPortfolios,
  getInstruments,
  createCustomHolding,
  updateCustomHolding,
} from '@/lib/api/custom-holdings';
import type {
  Portfolio,
  Instrument,
  CustomHoldingFormData,
} from '@/types/custom-holding';

interface CustomHoldingFormProps {
  mode: 'add' | 'edit';
  holdingId?: string;
  initialData?: {
    id: string;
    portfolioCode: string;
    portfolioName: string;
    instrumentCode: string;
    instrumentDescription: string;
    amount: number;
    currency: string;
    effectiveDate: string;
  };
  onSuccess: () => void;
}

interface FormErrors {
  portfolioCode?: string;
  instrumentCode?: string;
  amount?: string;
  currency?: string;
  effectiveDate?: string;
  general?: string;
}

const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'CAD',
  'AUD',
  'NZD',
  'ZAR',
];

export function CustomHoldingForm({
  mode,
  holdingId,
  initialData,
  onSuccess,
}: CustomHoldingFormProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [portfolioCode, setPortfolioCode] = useState(
    initialData?.portfolioCode || '',
  );
  const [instrumentCode, setInstrumentCode] = useState(
    initialData?.instrumentCode || '',
  );
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || '');
  const [effectiveDate, setEffectiveDate] = useState(
    initialData?.effectiveDate || '',
  );

  // Load portfolios and instruments on mount
  useEffect(() => {
    async function loadDropdownData() {
      try {
        const [portfolioData, instrumentData] = await Promise.all([
          getPortfolios(),
          getInstruments(),
        ]);
        setPortfolios(portfolioData);
        setInstruments(instrumentData);
      } catch (error) {
        console.error('Failed to load dropdown data:', error);
        setErrors({ general: 'Failed to load form data. Please try again.' });
      } finally {
        setLoading(false);
      }
    }

    loadDropdownData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!portfolioCode) {
      newErrors.portfolioCode = 'Portfolio Code is required';
    }

    if (!instrumentCode) {
      newErrors.instrumentCode = 'Instrument Code is required';
    }

    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount))) {
      newErrors.amount = 'Amount must be a valid number';
    }

    if (!currency) {
      newErrors.currency = 'Currency is required';
    }

    if (!effectiveDate) {
      newErrors.effectiveDate = 'Effective Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const formData: CustomHoldingFormData = {
        portfolioCode,
        instrumentCode,
        amount: parseFloat(amount),
        currency,
        effectiveDate,
      };

      // Use a placeholder username - in production this would come from auth
      const username = 'CurrentUser';

      if (mode === 'add') {
        await createCustomHolding(formData, username);
        setSuccessMessage('Custom holding added successfully');
      } else {
        // In edit mode, only send editable fields
        const updateData = {
          amount: parseFloat(amount),
          currency,
          effectiveDate,
        };
        await updateCustomHolding(holdingId!, updateData, username);
        setSuccessMessage('Holding updated successfully');
      }

      // Call success callback after a brief delay to show the message
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      console.error('Failed to save holding:', error);

      // Handle APIError objects from the API client
      const apiError = error as {
        message?: string;
        details?: string[];
        statusCode?: number;
      };

      // Check for network errors (statusCode 0)
      if (apiError.statusCode === 0) {
        setErrors({
          general:
            mode === 'edit'
              ? 'Failed to update'
              : 'Unable to add holding. Please try again later.',
        });
      } else if (apiError.details && apiError.details.length > 0) {
        // Check for specific error messages in details array
        const detailMessage = apiError.details[0].toLowerCase();
        if (
          detailMessage.includes('already exists') ||
          detailMessage.includes('duplicate') ||
          detailMessage.includes('conflict')
        ) {
          setErrors({ general: 'Holding already exists' });
        } else {
          setErrors({
            general:
              mode === 'edit'
                ? 'Failed to update'
                : 'Unable to add holding. Please try again later.',
          });
        }
      } else if (apiError.message) {
        const message = apiError.message.toLowerCase();
        if (
          message.includes('already exists') ||
          message.includes('duplicate') ||
          message.includes('conflict')
        ) {
          setErrors({ general: 'Holding already exists' });
        } else {
          setErrors({
            general:
              mode === 'edit'
                ? 'Failed to update'
                : 'Unable to add holding. Please try again later.',
          });
        }
      } else {
        setErrors({
          general:
            mode === 'edit'
              ? 'Failed to update'
              : 'Unable to add holding. Please try again later.',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Loading form...</p>
        </CardContent>
      </Card>
    );
  }

  const isEditMode = mode === 'edit';

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{isEditMode ? 'Edit Custom Holding' : 'Add Custom Holding'}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success Message */}
          {successMessage && (
            <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
              {successMessage}
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Portfolio Code */}
          <div className="space-y-2">
            <Label htmlFor="portfolioCode">Portfolio Code</Label>
            {isEditMode ? (
              <Select
                value={portfolioCode}
                onValueChange={setPortfolioCode}
                disabled
              >
                <SelectTrigger
                  id="portfolioCode"
                  aria-label="Portfolio Code"
                  disabled
                >
                  <SelectValue placeholder="Select portfolio">
                    {initialData?.portfolioName || portfolioCode}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((p) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <select
                id="portfolioCode"
                aria-label="Portfolio Code"
                value={portfolioCode}
                onChange={(e) => setPortfolioCode(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select portfolio</option>
                {portfolios.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            {errors.portfolioCode && (
              <p className="text-sm text-red-500">{errors.portfolioCode}</p>
            )}
          </div>

          {/* Instrument Code */}
          <div className="space-y-2">
            <Label htmlFor="instrumentCode">Instrument Code</Label>
            {isEditMode ? (
              <Select
                value={instrumentCode}
                onValueChange={setInstrumentCode}
                disabled
              >
                <SelectTrigger
                  id="instrumentCode"
                  aria-label="Instrument Code"
                  disabled
                >
                  <SelectValue placeholder="Select instrument">
                    {initialData?.instrumentDescription || instrumentCode}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((i) => (
                    <SelectItem key={i.code} value={i.code}>
                      {i.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <select
                id="instrumentCode"
                aria-label="Instrument Code"
                value={instrumentCode}
                onChange={(e) => setInstrumentCode(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select instrument</option>
                {instruments.map((i) => (
                  <option key={i.code} value={i.code}>
                    {i.description}
                  </option>
                ))}
              </select>
            )}
            {errors.instrumentCode && (
              <p className="text-sm text-red-500">{errors.instrumentCode}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              aria-label="Amount"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select currency</option>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.currency && (
              <p className="text-sm text-red-500">{errors.currency}</p>
            )}
          </div>

          {/* Effective Date */}
          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Effective Date</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              aria-label="Effective Date"
            />
            {errors.effectiveDate && (
              <p className="text-sm text-red-500">{errors.effectiveDate}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
