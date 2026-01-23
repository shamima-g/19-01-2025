'use client';

/**
 * Instrument Popup Component
 *
 * Epic 4: Instrument Static Data Management
 * Story: 4.8 (View Popup Details)
 *
 * Features:
 * - Quick view popup showing instrument details
 * - Opens when info icon is clicked
 * - Shows Name, Asset Class, Currency, Issuer, Maturity Date, Status
 * - View Full Details button navigates to full details page
 * - Closes when clicking outside
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { STATIC_DATA_API_URL } from '@/lib/utils/constants';
import type { Instrument } from '@/lib/api/instruments';

interface InstrumentPopupProps {
  instrumentId: string;
}

export function InstrumentPopup({ instrumentId }: InstrumentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

  const handleInfoClick = async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${STATIC_DATA_API_URL}/v1/instruments/${instrumentId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      setInstrument(data);
    } catch {
      setError('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
    setInstrument(null);
    setError(null);
  };

  const handleViewFullDetails = () => {
    setShowDetailView(true);
  };

  if (showDetailView && instrument) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Instrument Details</h2>
        <div className="space-y-4">
          <div>
            <Label>ISIN</Label>
            <div>{instrument.isin}</div>
          </div>
          <div>
            <Label>Name</Label>
            <div>{instrument.name}</div>
          </div>
          <div>
            <Label>Asset Class</Label>
            <div>{instrument.assetClass}</div>
          </div>
          <div>
            <Label>Currency</Label>
            <div>{instrument.currency}</div>
          </div>
          <div>
            <Label>Issuer</Label>
            <div>{instrument.issuer || 'N/A'}</div>
          </div>
          <div>
            <Label>Maturity Date</Label>
            <div>{instrument.maturityDate || 'N/A'}</div>
          </div>
          <div>
            <Label>Status</Label>
            <div>{instrument.status}</div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowDetailView(false)}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleInfoClick}
        aria-label="Info"
      >
        i
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            data-testid="popup-backdrop"
            className="fixed inset-0 z-40"
            onClick={handleBackdropClick}
          />

          {/* Popup */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-lg border bg-background p-4 shadow-lg">
            {loading && <div>Loading...</div>}

            {error && <div className="text-red-500">{error}</div>}

            {instrument && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <div className="font-medium">{instrument.name}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Asset Class
                  </Label>
                  <div>{instrument.assetClass}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Currency
                  </Label>
                  <div>{instrument.currency}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Issuer
                  </Label>
                  <div>{instrument.issuer || 'N/A'}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Maturity Date
                  </Label>
                  <div>{instrument.maturityDate || 'N/A'}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <div>{instrument.status}</div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleViewFullDetails}
                  aria-label="View Full Details"
                >
                  View Full Details
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default InstrumentPopup;
