'use client';

/**
 * Approval Logs Page (Stories 8.13, 8.14)
 *
 * Displays a list of all approval actions with filtering and export.
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/contexts/ToastContext';
import { getApprovalLogs, exportApprovalLogs } from '@/lib/api/approvals';
import type { ApprovalLogItem } from '@/types/approval';

export default function ApprovalLogsPage() {
  const { showToast } = useToast();

  const [logs, setLogs] = useState<ApprovalLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { startDate?: string; endDate?: string; level?: number } =
        {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (levelFilter && levelFilter !== 'all')
        params.level = parseInt(levelFilter);

      const data = await getApprovalLogs(params);
      setLogs(data.logs);
    } catch (err) {
      console.error('Failed to load logs:', err);
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, levelFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const params: { startDate?: string; endDate?: string } = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const blob = await exportApprovalLogs(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `approval-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast({
        variant: 'success',
        title: 'Approval logs exported successfully',
      });
    } catch (err) {
      console.error('Failed to export logs:', err);
      setExportError('Export failed. Please try again.');
      showToast({
        variant: 'error',
        title: 'Failed to export logs. Please try again.',
      });
    } finally {
      setExporting(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    // Only show time since batch date is in a separate column
    return date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Approval Logs</h1>
        <Button
          onClick={handleExport}
          disabled={exporting || logs.length === 0}
        >
          {exporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </div>

      {exportError && (
        <div
          role="alert"
          className="p-4 text-sm text-red-700 bg-red-100 rounded-md"
        >
          {exportError}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="level-filter">Approval Level</Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger id="level-filter" className="mt-1">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadLogs} variant="outline">
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          {loading && (
            <div role="status" className="flex items-center gap-2 py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">
                Loading logs...
              </span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="p-4 text-sm text-red-700 bg-red-100 rounded-md"
            >
              {error}
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No approval logs found
            </div>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Batch Date</th>
                    <th className="text-left py-3 px-4">Level</th>
                    <th className="text-left py-3 px-4">Action</th>
                    <th className="text-left py-3 px-4">Approver</th>
                    <th className="text-left py-3 px-4">Timestamp</th>
                    <th className="text-left py-3 px-4">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr
                      key={`${log.batchDate}-${log.level}-${log.timestamp}-${index}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{log.batchDate}</td>
                      <td className="py-3 px-4">Level {log.level}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            log.action === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">{log.approver}</td>
                      <td className="py-3 px-4">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="py-3 px-4">{log.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Named export for testing
export { ApprovalLogsPage };
