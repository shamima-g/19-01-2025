/**
 * Index Price Form Component (Stories 5.2, 5.3)
 *
 * STUB: This component will be implemented during the IMPLEMENT phase
 */

'use client';

interface IndexPriceFormProps {
  mode: 'add' | 'edit';
  priceId?: string;
  initialData?: unknown;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function IndexPriceForm({ mode }: IndexPriceFormProps) {
  return (
    <div>
      <h2>{mode === 'add' ? 'Add Price' : 'Edit Price'}</h2>
      <p>To be implemented</p>
    </div>
  );
}
