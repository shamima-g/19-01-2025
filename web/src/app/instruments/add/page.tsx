'use client';

/**
 * Add New Instrument Form
 * Epic 4, Story 4.2
 *
 * Provides a form to add a new instrument with validation.
 */

import { InstrumentForm } from '@/components/InstrumentForm';

export default function AddInstrumentPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Instrument</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new instrument to the static data
        </p>
      </div>

      <InstrumentForm />
    </div>
  );
}
