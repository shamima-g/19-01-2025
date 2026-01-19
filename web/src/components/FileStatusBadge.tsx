'use client';

import { Badge } from '@/components/ui/badge';
import type { FileStatus } from '@/types/portfolio-file';

interface FileStatusBadgeProps {
  status: FileStatus;
  progress?: number;
}

const STATUS_CONFIG: Record<
  FileStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: string;
    ariaLabel: string;
  }
> = {
  Success: {
    label: 'Done',
    variant: 'default',
    icon: '✓',
    ariaLabel: 'success',
  },
  Processing: {
    label: 'Processing',
    variant: 'secondary',
    icon: '🔄',
    ariaLabel: 'processing',
  },
  Pending: {
    label: 'Pending',
    variant: 'outline',
    icon: '⏳',
    ariaLabel: 'pending',
  },
  Warning: {
    label: 'Fix Data',
    variant: 'secondary',
    icon: '⚠️',
    ariaLabel: 'warning',
  },
  Failed: {
    label: 'Failed',
    variant: 'destructive',
    icon: '❌',
    ariaLabel: 'failed',
  },
};

export function FileStatusBadge({ status, progress }: FileStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      <span role="img" aria-label={config.ariaLabel}>
        {config.icon}
      </span>
      <Badge variant={config.variant}>
        {config.label}
        {status === 'Processing' && progress !== undefined && ` ${progress}%`}
      </Badge>
    </div>
  );
}
