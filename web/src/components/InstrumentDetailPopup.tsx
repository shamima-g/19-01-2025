'use client';

/**
 * Instrument Detail Popup
 * Epic 4, Story 4.8: View Popup Details
 *
 * Displays detailed instrument information in a modal dialog.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Instrument } from '@/types/instrument';

interface InstrumentDetailPopupProps {
  instrument: Instrument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstrumentDetailPopup({
  instrument,
  open,
  onOpenChange,
}: InstrumentDetailPopupProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{instrument.name}</span>
            <Badge
              variant={
                instrument.status === 'Complete' ? 'default' : 'destructive'
              }
            >
              {instrument.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>ISIN: {instrument.isin}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Asset Class</p>
              <p className="text-sm text-gray-900">{instrument.assetClass}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Currency</p>
              <p className="text-sm text-gray-900">{instrument.currency}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Issuer</p>
              <p className="text-sm text-gray-900">
                {instrument.issuer || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Maturity Date</p>
              <p className="text-sm text-gray-900">
                {formatDate(instrument.maturityDate)}
              </p>
            </div>
          </div>

          {instrument.lastChangedBy && (
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Last modified by {instrument.lastChangedBy}
                {instrument.updatedAt &&
                  ` on ${formatDate(instrument.updatedAt)}`}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
