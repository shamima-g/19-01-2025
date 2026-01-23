/**
 * Instrument Form Component (Stub)
 *
 * This is a stub file created for TDD (Test-Driven Development).
 * Tests have been written in __tests__/integration/instrument-static-data.test.tsx
 *
 * TODO: Implement this component to make the tests pass
 *
 * Stories: 4.2 (Add), 4.3 (Update)
 */

interface InstrumentFormProps {
  mode: 'add' | 'edit';
  instrumentId?: string;
  initialData?: Record<string, unknown>;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function InstrumentForm({
  mode,
  instrumentId,
  initialData,
  onSuccess,
  onCancel,
}: InstrumentFormProps) {
  return (
    <div>
      <h2>
        {mode === 'add' ? 'Add Instrument' : 'Edit Instrument'} - To Be
        Implemented
      </h2>
    </div>
  );
}
