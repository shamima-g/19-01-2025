'use client';

/**
 * Index Price Popup Component (Story 5.6)
 *
 * Epic 5: Market Data Maintenance
 *
 * Features:
 * - Quick view popup showing price details
 * - Opens when info icon is clicked
 * - Shows Index Code, Name, Current Price, Previous Price, Change %
 * - View History button navigates to history view
 * - Closes when clicking outside
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getIndexPrice, type IndexPriceDetail } from '@/lib/api/market-data';
import { IndexPriceHistory } from './IndexPriceHistory';

interface IndexPricePopupProps {
  priceId: string;
}

export function IndexPricePopup({ priceId }: IndexPricePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceDetail, setPriceDetail] = useState<IndexPriceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryView, setShowHistoryView] = useState(false);

  const handleInfoClick = async () => {
    setIsOpen(true);
    setLoading(true);
    setError(null);

    try {
      const data = await getIndexPrice(priceId);
      setPriceDetail(data);
    } catch {
      setError('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
    setPriceDetail(null);
    setError(null);
    setShowHistoryView(false);
  };

  const handleViewHistory = () => {
    setShowHistoryView(true);
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format change percent
  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  if (showHistoryView && priceDetail) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Price History</h2>
        <IndexPriceHistory indexCode={priceDetail.indexCode} />
        <Button variant="outline" onClick={() => setShowHistoryView(false)}>
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

            {priceDetail && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Index Code
                  </Label>
                  <div className="font-medium">{priceDetail.indexCode}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <div>{priceDetail.indexName}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Current Price
                  </Label>
                  <div>{formatPrice(priceDetail.currentPrice)}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Previous Price
                  </Label>
                  <div>{formatPrice(priceDetail.previousPrice)}</div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Change %
                  </Label>
                  <div>{formatChangePercent(priceDetail.changePercent)}</div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleViewHistory}
                  aria-label="View History"
                >
                  View History
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default IndexPricePopup;
