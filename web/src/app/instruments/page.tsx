'use client';

/**
 * Instrument Static Data Management - Grid View
 * Epic 4, Story 4.1, 4.9
 *
 * Displays a searchable, sortable grid of instruments with column toggling.
 */

import { useState } from 'react';
import { InstrumentGrid } from '@/components/InstrumentGrid';
import { InstrumentDetailPopup } from '@/components/InstrumentDetailPopup';
import type { Instrument } from '@/types/instrument';

export default function InstrumentStaticPage() {
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);

  const handleSelectInstrument = (instrument: Instrument) => {
    setSelectedInstrument(instrument);
  };

  const handleClosePopup = () => {
    setSelectedInstrument(null);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Instrument Static Data
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage instrument static data
        </p>
      </div>

      <InstrumentGrid onSelectInstrument={handleSelectInstrument} />

      {selectedInstrument && (
        <InstrumentDetailPopup
          instrument={selectedInstrument}
          open={!!selectedInstrument}
          onOpenChange={(open) => !open && handleClosePopup()}
        />
      )}
    </div>
  );
}
