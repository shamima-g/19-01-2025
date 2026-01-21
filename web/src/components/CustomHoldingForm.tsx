/**
 * Custom Holding Form Component (Story 6.2, 6.3)
 *
 * TODO: Implement full functionality
 * - Add mode: All fields editable
 * - Edit mode: Portfolio and Instrument read-only
 * - Form validation
 * - Duplicate detection
 * - Audit trail recording
 */

interface CustomHoldingFormProps {
  mode: 'add' | 'edit';
  holdingId?: string;
  initialData?: {
    id: string;
    portfolioCode: string;
    portfolioName: string;
    instrumentCode: string;
    instrumentDescription: string;
    amount: number;
    currency: string;
    effectiveDate: string;
  };
  onSuccess: () => void;
}

export function CustomHoldingForm(_props: CustomHoldingFormProps) {
  return <div>CustomHoldingForm - Not Implemented</div>;
}
