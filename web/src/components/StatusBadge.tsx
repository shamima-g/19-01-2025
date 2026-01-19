'use client';

import type { BatchStatus } from '@/types/report-batch';

interface StatusBadgeProps {
  status: BatchStatus;
}

const statusConfig: Record<
  BatchStatus,
  { bgColor: string; textColor: string; label: string }
> = {
  Pending: {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    label: 'Pending',
  },
  'In Progress': {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    label: 'In Progress',
  },
  Completed: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    label: 'Completed',
  },
  Failed: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    label: 'Failed',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
}
