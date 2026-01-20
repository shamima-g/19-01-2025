'use client';

/**
 * Instrument Form Component
 * Epic 4, Stories 4.2, 4.3
 *
 * Shared form component for adding and editing instruments.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/contexts/ToastContext';
import {
  createInstrument,
  updateInstrument,
  validateIsin,
} from '@/lib/api/instruments';
import type {
  Instrument,
  InstrumentRequest,
  AssetClass,
  CurrencyCode,
} from '@/types/instrument';

interface InstrumentFormProps {
  instrument?: Instrument;
  isEditMode?: boolean;
}

const ASSET_CLASSES: AssetClass[] = [
  'Equity',
  'Fixed Income',
  'Money Market',
  'Derivatives',
  'Alternative',
  'Real Estate',
  'Commodities',
  'Other',
];

const CURRENCIES: CurrencyCode[] = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'AUD',
  'CAD',
  'ZAR',
  'Other',
];

interface FormErrors {
  isin?: string;
  name?: string;
  assetClass?: string;
  currency?: string;
  general?: string;
}

export function InstrumentForm({
  instrument,
  isEditMode = false,
}: InstrumentFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<InstrumentRequest>({
    isin: instrument?.isin || '',
    name: instrument?.name || '',
    assetClass: instrument?.assetClass || '',
    currency: instrument?.currency || '',
    issuer: instrument?.issuer || '',
    maturityDate: instrument?.maturityDate || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Track if form has unsaved changes
  useEffect(() => {
    if (instrument) {
      const hasChanges =
        formData.name !== (instrument.name || '') ||
        formData.assetClass !== (instrument.assetClass || '') ||
        formData.currency !== (instrument.currency || '') ||
        formData.issuer !== (instrument.issuer || '') ||
        formData.maturityDate !== (instrument.maturityDate || '');
      setIsDirty(hasChanges);
    } else {
      const hasAnyValue = Object.values(formData).some((v) => v !== '');
      setIsDirty(hasAnyValue);
    }
  }, [formData, instrument]);

  const handleInputChange = (field: keyof InstrumentRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // ISIN validation
    if (!formData.isin.trim()) {
      newErrors.isin = 'ISIN is required';
    } else if (!validateIsin(formData.isin)) {
      newErrors.isin = 'ISIN must be 12 alphanumeric characters';
    }

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Asset Class validation
    if (!formData.assetClass) {
      newErrors.assetClass = 'Asset Class is required';
    }

    // Currency validation
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

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isEditMode && instrument) {
        await updateInstrument(instrument.id, formData, 'CurrentUser');
        showToast({
          title: 'Success',
          message: 'Instrument updated successfully',
          variant: 'success',
        });
      } else {
        await createInstrument(formData, 'CurrentUser');
        showToast({
          title: 'Success',
          message: 'Instrument added successfully',
          variant: 'success',
        });
      }

      router.push('/instruments');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      if (errorMessage.toLowerCase().includes('already exists')) {
        setErrors({ isin: 'ISIN already exists' });
      } else if (
        errorMessage.toLowerCase().includes('concurrency') ||
        errorMessage.toLowerCase().includes('conflict')
      ) {
        setErrors({
          general:
            'Another user has updated this instrument. Please refresh and try again.',
        });
      } else {
        setErrors({
          general: isEditMode
            ? 'Failed to update instrument. Please try again.'
            : 'Failed to add instrument. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      router.push('/instruments');
    }
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    router.push('/instruments');
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="space-y-4">
          {/* ISIN */}
          <div className="space-y-2">
            <Label htmlFor="isin">ISIN *</Label>
            <Input
              id="isin"
              aria-label="ISIN"
              value={formData.isin}
              onChange={(e) =>
                handleInputChange('isin', e.target.value.toUpperCase())
              }
              placeholder="e.g., US0378331005"
              disabled={isEditMode}
              required
              maxLength={12}
              className={errors.isin ? 'border-red-500' : ''}
            />
            {errors.isin && (
              <p className="text-sm text-red-500">{errors.isin}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              aria-label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Apple Inc."
              required
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Asset Class */}
          <div className="space-y-2">
            <Label htmlFor="assetClass">Asset Class *</Label>
            <Select
              value={formData.assetClass}
              onValueChange={(value) => handleInputChange('assetClass', value)}
            >
              <SelectTrigger
                id="assetClass"
                aria-label="Asset Class"
                className={errors.assetClass ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select asset class" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_CLASSES.map((ac) => (
                  <SelectItem key={ac} value={ac}>
                    {ac}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assetClass && (
              <p className="text-sm text-red-500">{errors.assetClass}</p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange('currency', value)}
            >
              <SelectTrigger
                id="currency"
                aria-label="Currency"
                className={errors.currency ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-red-500">{errors.currency}</p>
            )}
          </div>

          {/* Issuer */}
          <div className="space-y-2">
            <Label htmlFor="issuer">Issuer</Label>
            <Input
              id="issuer"
              aria-label="Issuer"
              value={formData.issuer}
              onChange={(e) => handleInputChange('issuer', e.target.value)}
              placeholder="e.g., Apple Inc."
            />
          </div>

          {/* Maturity Date */}
          <div className="space-y-2">
            <Label htmlFor="maturityDate">Maturity Date</Label>
            <Input
              id="maturityDate"
              type="date"
              aria-label="Maturity Date"
              value={formData.maturityDate}
              onChange={(e) =>
                handleInputChange('maturityDate', e.target.value)
              }
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              Unsaved changes will be lost. Are you sure you want to cancel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Continue Editing
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
