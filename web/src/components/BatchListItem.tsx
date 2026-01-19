'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from './StatusBadge';
import type { ReportBatch } from '@/types/report-batch';

interface BatchListItemProps {
  batch: ReportBatch;
  isDeleting?: boolean;
}

export function BatchListItem({
  batch,
  isDeleting = false,
}: BatchListItemProps) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleViewDetails = () => {
    setNavigating(true);
    router.push(`/batches/${batch.id}/workflow`);
  };

  const handleViewLogs = () => {
    setNavigating(true);
    router.push(`/batches/${batch.id}/logs`);
  };

  return (
    <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 hover:bg-gray-50">
      <div className="flex items-center gap-6">
        <div className="text-sm font-medium text-gray-900">{batch.id}</div>
        <div className="text-sm text-gray-600">
          {batch.month} {batch.year}
        </div>
        <StatusBadge status={batch.status} />
        <div className="text-sm text-gray-500">
          {formatDate(batch.createdDate)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleViewDetails}
          disabled={isDeleting || navigating}
          title="View workflow details for this batch"
          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View Details
        </button>

        <span className="text-gray-300">|</span>

        <button
          onClick={handleViewLogs}
          disabled={isDeleting || navigating}
          title="View execution logs for this batch"
          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View Logs
        </button>
      </div>
    </div>
  );
}
