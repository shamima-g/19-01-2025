'use client';

/**
 * Edit Instrument Form
 * Epic 4, Story 4.3
 *
 * Provides a form to edit an existing instrument with validation.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { InstrumentForm } from '@/components/InstrumentForm';
import { getInstrument } from '@/lib/api/instruments';
import type { Instrument } from '@/types/instrument';

export default function EditInstrumentPage() {
  const params = useParams();
  const instrumentId = params.id as string;

  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstrument() {
      try {
        const data = await getInstrument(instrumentId);
        setInstrument(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load instrument. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    }

    if (instrumentId) {
      fetchInstrument();
    }
  }, [instrumentId]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Loading instrument...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!instrument) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-gray-600">Instrument not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Instrument</h1>
        <p className="mt-1 text-sm text-gray-500">
          Edit instrument {instrument.isin}
        </p>
      </div>

      <InstrumentForm instrument={instrument} isEditMode />
    </div>
  );
}
