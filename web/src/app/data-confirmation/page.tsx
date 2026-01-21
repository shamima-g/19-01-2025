'use client';

/**
 * Data Confirmation Page (Epic 7)
 *
 * Displays data confirmation verification hub with three tabs:
 * - File Check: Expected vs actual file counts (Story 7.1)
 * - Main Data Check: Core table population status (Story 7.2)
 * - Other Data Check: Reference data completeness (Story 7.3)
 *
 * Also includes:
 * - Overall status indicator (Story 7.5)
 * - Export functionality (Story 7.6)
 * - Auto-refresh (Story 7.7)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  getFileCheck,
  getMainCheck,
  getOtherCheck,
  getDataConfirmationStatus,
  exportConfirmationReport,
} from '@/lib/api/data-confirmation';
import type {
  FileCheckData,
  MainCheckData,
  OtherCheckData,
  DataConfirmationStatus,
  DataConfirmationTab,
} from '@/types/data-confirmation';
import { useToast } from '@/contexts/ToastContext';

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

// Status badge component
function StatusBadge({
  status,
  summary,
}: {
  status: DataConfirmationStatus | null;
  summary?: string;
}) {
  if (!status) {
    return (
      <div
        role="status"
        aria-label="Unable to determine status"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700"
      >
        <span role="img" aria-label="unknown status" className="text-gray-500">
          ?
        </span>
        <span>Unable to determine status</span>
      </div>
    );
  }

  if (status.status === 'ready') {
    return (
      <div
        role="status"
        aria-label="Ready for Approval"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800"
      >
        <span role="img" aria-label="check complete" className="text-green-600">
          ✓
        </span>
        <span>Ready for Approval</span>
      </div>
    );
  }

  if (status.status === 'in_progress') {
    return (
      <div
        role="status"
        aria-label="In Progress"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-800"
      >
        <span
          role="img"
          aria-label="in progress"
          className="animate-pulse text-yellow-600"
        >
          ●
        </span>
        <span>In Progress</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Issues Found - Review Required"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-800"
    >
      <span role="img" aria-label="error issues" className="text-red-600">
        ✕
      </span>
      <span>Issues Found - Review Required</span>
      {summary && (
        <span className="text-sm text-red-600 ml-2">({summary})</span>
      )}
    </div>
  );
}

// Check status icon component
function CheckStatusIcon({
  status,
  type,
}: {
  status: 'complete' | 'missing' | 'partial' | 'warning' | 'error';
  type: 'file' | 'data';
}) {
  if (status === 'complete') {
    return (
      <span
        role="img"
        aria-label="check complete"
        className="text-green-600 text-xl"
      >
        ✓
      </span>
    );
  }
  if (status === 'warning') {
    return (
      <span role="img" aria-label="warning" className="text-yellow-600 text-xl">
        ⚠
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={type === 'file' ? 'error missing' : 'error missing'}
      className="text-red-600 text-xl"
    >
      ✕
    </span>
  );
}

// File Check Tab content (Story 7.1)
function FileCheckTab({
  data,
  loading,
  error,
}: {
  data: FileCheckData | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading file status...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="p-4 text-sm text-red-700 bg-red-100 rounded-md"
      >
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const sections = [
    { key: 'assetManagers', label: 'Asset Managers', data: data.assetManagers },
    { key: 'bloomberg', label: 'Bloomberg', data: data.bloomberg },
    { key: 'custodian', label: 'Custodian', data: data.custodian },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.key}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <CheckStatusIcon status={section.data.status} type="file" />
            <span className="font-medium">{section.label}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {section.data.status === 'missing' ? (
              <span className="text-red-600">Missing</span>
            ) : section.data.status === 'partial' ? (
              <span className="text-yellow-600">Partial</span>
            ) : (
              <span className="text-green-600">Received</span>
            )}
            {section.data.timestamp && (
              <span className="ml-2">
                ({new Date(section.data.timestamp).toLocaleString()})
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Data Check Tab content (Story 7.2)
function MainDataCheckTab({
  data,
  loading,
  error,
}: {
  data: MainCheckData | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading data check...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="p-4 text-sm text-red-700 bg-red-100 rounded-md"
      >
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const sections = [
    { key: 'holdings', label: 'Holdings Count', data: data.holdings },
    {
      key: 'transactions',
      label: 'Transactions Count',
      data: data.transactions,
    },
    { key: 'income', label: 'Income Count', data: data.income },
    { key: 'cash', label: 'Cash Count', data: data.cash },
    { key: 'performance', label: 'Performance Count', data: data.performance },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.key}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <CheckStatusIcon status={section.data.status} type="data" />
            <span className="font-medium">{section.label}</span>
          </div>
          <div className="text-sm">
            {section.data.count === 0 ? (
              <span className="text-red-600">0 records</span>
            ) : (
              <span className="text-green-600">{section.data.count}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Other Data Check Tab content (Story 7.3)
function OtherDataCheckTab({
  data,
  loading,
  error,
  onNavigate,
}: {
  data: OtherCheckData | null;
  loading: boolean;
  error: string | null;
  onNavigate: (path: string) => void;
}) {
  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading other checks...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="p-4 text-sm text-red-700 bg-red-100 rounded-md"
      >
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getStatusColor = (count: number) => {
    if (count === 0) return 'complete';
    if (count <= 10) return 'warning';
    return 'error';
  };

  const sections = [
    {
      key: 'incompleteInstruments',
      label: 'Incomplete Instruments',
      data: data.incompleteInstruments,
      path: '/instruments?status=incomplete',
    },
    {
      key: 'missingIndexPrices',
      label: 'Missing Index Prices',
      data: data.missingIndexPrices,
      path: '/index-prices?status=missing',
    },
    {
      key: 'missingDurations',
      label: 'Missing Durations',
      data: data.missingDurations,
      path: '/durations?status=missing',
    },
    {
      key: 'missingBetas',
      label: 'Missing Betas',
      data: data.missingBetas,
      path: '/betas?status=missing',
    },
    {
      key: 'missingCreditRatings',
      label: 'Missing Credit Ratings',
      data: data.missingCreditRatings,
      path: '/credit-ratings?status=missing',
    },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const statusColor = getStatusColor(section.data.count);
        const isClickable = section.data.count > 0;

        return (
          <div
            key={section.key}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <CheckStatusIcon status={statusColor} type="data" />
              <span className="font-medium">{section.label}</span>
            </div>
            <div className="text-sm">
              {section.data.count === 0 ? (
                <span className="text-green-600">0 incomplete</span>
              ) : isClickable ? (
                <button
                  onClick={() => onNavigate(section.path)}
                  className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label={`${section.data.count} incomplete ${section.label.toLowerCase()}`}
                >
                  {section.data.count} incomplete
                </button>
              ) : (
                <span className="text-gray-400">
                  {section.data.count} incomplete
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DataConfirmationPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<DataConfirmationTab>('file-check');
  const [status, setStatus] = useState<DataConfirmationStatus | null>(null);

  // Tab-specific state
  const [fileCheckData, setFileCheckData] = useState<FileCheckData | null>(
    null,
  );
  const [fileCheckLoading, setFileCheckLoading] = useState(true);
  const [fileCheckError, setFileCheckError] = useState<string | null>(null);

  const [mainCheckData, setMainCheckData] = useState<MainCheckData | null>(
    null,
  );
  const [mainCheckLoading, setMainCheckLoading] = useState(false);
  const [mainCheckError, setMainCheckError] = useState<string | null>(null);

  const [otherCheckData, setOtherCheckData] = useState<OtherCheckData | null>(
    null,
  );
  const [otherCheckLoading, setOtherCheckLoading] = useState(false);
  const [otherCheckError, setOtherCheckError] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // Load overall status
  const loadStatus = useCallback(async () => {
    try {
      const data = await getDataConfirmationStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load status:', err);
      // Status errors are handled by showing null status
    }
  }, []);

  // Load file check data
  const loadFileCheck = useCallback(async () => {
    setFileCheckLoading(true);
    setFileCheckError(null);
    try {
      const data = await getFileCheck();
      setFileCheckData(data);
    } catch (err) {
      console.error('Failed to load file check:', err);
      setFileCheckError('Failed to load file status');
    } finally {
      setFileCheckLoading(false);
    }
  }, []);

  // Load main check data
  const loadMainCheck = useCallback(async () => {
    setMainCheckLoading(true);
    setMainCheckError(null);
    try {
      const data = await getMainCheck();
      setMainCheckData(data);
    } catch (err) {
      console.error('Failed to load main check:', err);
      setMainCheckError('Failed to load data check');
    } finally {
      setMainCheckLoading(false);
    }
  }, []);

  // Load other check data
  const loadOtherCheck = useCallback(async () => {
    setOtherCheckLoading(true);
    setOtherCheckError(null);
    try {
      const data = await getOtherCheck();
      setOtherCheckData(data);
    } catch (err) {
      console.error('Failed to load other check:', err);
      setOtherCheckError('Failed to load other checks');
    } finally {
      setOtherCheckLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadStatus(),
        loadFileCheck(),
        activeTab === 'main-check' ? loadMainCheck() : Promise.resolve(),
        activeTab === 'other-check' ? loadOtherCheck() : Promise.resolve(),
      ]);
    } catch (err) {
      console.error('Failed to refresh:', err);
      showToast({
        variant: 'error',
        title: 'Failed to refresh. Click to retry.',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [
    loadStatus,
    loadFileCheck,
    loadMainCheck,
    loadOtherCheck,
    activeTab,
    showToast,
  ]);

  // Handle tab change
  const handleTabChange = useCallback(
    (tab: DataConfirmationTab) => {
      setActiveTab(tab);
      if (tab === 'main-check' && !mainCheckData && !mainCheckLoading) {
        loadMainCheck();
      } else if (
        tab === 'other-check' &&
        !otherCheckData &&
        !otherCheckLoading
      ) {
        loadOtherCheck();
      }
    },
    [
      mainCheckData,
      mainCheckLoading,
      otherCheckData,
      otherCheckLoading,
      loadMainCheck,
      loadOtherCheck,
    ],
  );

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportConfirmationReport();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
      link.download = `DataConfirmation_${dateStr}_${timeStr}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export:', err);
      showToast({
        variant: 'error',
        title: 'Export failed. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle navigation to fix pages (Story 7.4)
  const handleNavigate = useCallback(
    (path: string) => {
      try {
        router.push(path);
      } catch (err) {
        console.error('Navigation failed:', err);
        showToast({
          variant: 'error',
          title: 'Failed to navigate. Please try again.',
        });
      }
    },
    [router, showToast],
  );

  // Initial load
  useEffect(() => {
    loadStatus();
    loadFileCheck();
  }, [loadStatus, loadFileCheck]);

  // Auto-refresh (Story 7.7)
  useEffect(() => {
    refreshIntervalRef.current = setInterval(() => {
      refreshAll();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshAll]);

  // Generate summary text for status badge
  const getSummaryText = () => {
    const issues: string[] = [];
    if (fileCheckData) {
      const missingFiles = [
        fileCheckData.assetManagers,
        fileCheckData.bloomberg,
        fileCheckData.custodian,
      ].filter((f) => f.status === 'missing').length;
      if (missingFiles > 0) {
        issues.push(`${missingFiles} files missing`);
      }
    }
    if (otherCheckData) {
      const incomplete = otherCheckData.incompleteInstruments.count;
      if (incomplete > 0) {
        issues.push(`${incomplete} incomplete instruments`);
      }
    }
    return issues.length > 0 ? issues.join(', ') : undefined;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with status badge */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Confirmation</h1>
        <div className="flex items-center gap-4">
          {isRefreshing && (
            <span className="text-sm text-muted-foreground animate-pulse">
              Updating...
            </span>
          )}
          <StatusBadge status={status} summary={getSummaryText()} />
        </div>
      </div>

      {/* Tab navigation */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex gap-1" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'file-check'}
                aria-controls="panel-file-check"
                onClick={() => handleTabChange('file-check')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'file-check'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                File Check
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'main-check'}
                aria-controls="panel-main-check"
                onClick={() => handleTabChange('main-check')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'main-check'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Main Data Check
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'other-check'}
                aria-controls="panel-other-check"
                onClick={() => handleTabChange('other-check')}
                className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === 'other-check'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Other Data Check
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAll}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Report'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab panels */}
          <div
            id="panel-file-check"
            role="tabpanel"
            aria-labelledby="tab-file-check"
            hidden={activeTab !== 'file-check'}
          >
            {activeTab === 'file-check' && (
              <FileCheckTab
                data={fileCheckData}
                loading={fileCheckLoading}
                error={fileCheckError}
              />
            )}
          </div>
          <div
            id="panel-main-check"
            role="tabpanel"
            aria-labelledby="tab-main-check"
            hidden={activeTab !== 'main-check'}
          >
            {activeTab === 'main-check' && (
              <MainDataCheckTab
                data={mainCheckData}
                loading={mainCheckLoading}
                error={mainCheckError}
              />
            )}
          </div>
          <div
            id="panel-other-check"
            role="tabpanel"
            aria-labelledby="tab-other-check"
            hidden={activeTab !== 'other-check'}
          >
            {activeTab === 'other-check' && (
              <OtherDataCheckTab
                data={otherCheckData}
                loading={otherCheckLoading}
                error={otherCheckError}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Named export for testing
export { DataConfirmationPage };
