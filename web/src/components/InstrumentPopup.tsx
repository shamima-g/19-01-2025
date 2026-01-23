/**
 * Instrument Popup Component (Stub)
 *
 * This is a stub file created for TDD (Test-Driven Development).
 * Tests have been written in __tests__/integration/instrument-static-data.test.tsx
 *
 * TODO: Implement this component to make the tests pass
 *
 * Story: 4.8 (View Popup Details)
 */

interface InstrumentPopupProps {
  instrumentId: string;
}

export function InstrumentPopup({ instrumentId }: InstrumentPopupProps) {
  return (
    <div>
      <button aria-label="info">Info</button>
      <p>Popup for {instrumentId} - To Be Implemented</p>
    </div>
  );
}
