/**
 * Beta Form Component (Stories 5.11, 5.12)
 *
 * STUB: This component will be implemented during the IMPLEMENT phase
 */

'use client';

interface BetaFormProps {
  mode: 'add' | 'edit';
  betaId?: string;
  initialData?: unknown;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function BetaForm({ mode }: BetaFormProps) {
  return (
    <div>
      <h2>{mode === 'add' ? 'Add Beta' : 'Edit Beta'}</h2>
      <p>To be implemented</p>
    </div>
  );
}
