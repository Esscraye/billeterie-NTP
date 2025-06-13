'use client';

import { useState } from 'react';
import SeatsGrid from '@/components/SeatsGrid';
import ReservationForm from '@/components/ReservationForm';
import SimulationPanel from '@/components/SimulationPanel';
import ConflictsList from '@/components/ConflictsList';

export default function Home() {
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSeatSelect = (seatId: number) => {
    setSelectedSeatId(seatId);
  };

  const handleReservationSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedSeatId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Système de Réservation de Billets - Démonstration NTP</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">
                Démonstration de synchronisation temporelle
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SeatsGrid
                onSeatSelect={handleSeatSelect}
                selectedSeatId={selectedSeatId}
                refreshKey={refreshKey}
              />
            </div>
            <div className="space-y-6">
              <ReservationForm
                selectedSeatId={selectedSeatId}
                onSuccess={handleReservationSuccess}
              />
              <SimulationPanel onSuccess={handleReservationSuccess} />
              <ConflictsList refreshKey={refreshKey} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}