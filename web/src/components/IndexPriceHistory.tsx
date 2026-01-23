'use client';

/**
 * Index Price History Component (Story 5.5)
 *
 * Epic 5: Market Data Maintenance
 *
 * Features:
 * - Display historical prices sorted by date descending
 * - Date range filtering
 * - Shows Date, Price, Change %, User columns
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getIndexPriceHistory,
  type IndexPriceHistory as IndexPriceHistoryType,
} from '@/lib/api/market-data';

interface IndexPriceHistoryProps {
  indexCode: string;
}

export function IndexPriceHistory({ indexCode }: IndexPriceHistoryProps) {
  const [history, setHistory] = useState<IndexPriceHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch history
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await getIndexPriceHistory(indexCode, params);
      // Sort by date descending
      const sorted = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setHistory(sorted);
    } catch {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [indexCode, startDate, endDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Apply date filter
  const handleApply = () => {
    fetchHistory();
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Format change percent
  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Price History - {indexCode}</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Price History - {indexCode}</h2>

      {/* Date range filter */}
      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button onClick={handleApply}>Apply</Button>
      </div>

      {/* Loading state */}
      {loading && <div>Loading...</div>}

      {/* Empty state */}
      {!loading && history.length === 0 && (
        <div className="text-muted-foreground">No historical data</div>
      )}

      {/* History table */}
      {!loading && history.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Change %</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{formatPrice(item.price)}</TableCell>
                <TableCell>{formatChangePercent(item.changePercent)}</TableCell>
                <TableCell>{item.user}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default IndexPriceHistory;
