/**
 * Duration Form Component (Stories 5.8, 5.9)
 *
 * STUB: This component will be implemented during the IMPLEMENT phase
 */

'use client';

interface DurationFormProps {
  mode: 'add' | 'edit';
  durationId?: string;
  initialData?: unknown;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function DurationForm({ mode }: DurationFormProps) {
  return (
    <div>
      <h2>{mode === 'add' ? 'Add Duration' : 'Edit Duration'}</h2>
      <p>To be implemented</p>
    </div>
  );
}
