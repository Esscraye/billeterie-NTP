'use client';

import { useState, useEffect } from 'react';
import { Seat, apiService } from '@/lib/api';

interface SeatsGridProps {
  onSeatSelect: (seatId: number) => void;
  selectedSeatId: number | null;
  refreshKey: number;
}

export default function SeatsGrid({ onSeatSelect, selectedSeatId, refreshKey }: SeatsGridProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSeats();
  }, [refreshKey]);

  const loadSeats = async () => {
    try {
      setLoading(true);
      const seatsData = await apiService.getSeats();
      
      // Si aucun siège n'existe, les initialiser
      if (seatsData.length === 0) {
        await apiService.initializeSeats(100);
        const newSeatsData = await apiService.getSeats();
        setSeats(newSeatsData);
      } else {
        setSeats(seatsData);
      }
    } catch (err) {
      setError('Erreur lors du chargement des sièges');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.id === selectedSeatId) {
      return 'bg-blue-500 border-blue-600 text-white';
    }
    if (seat.is_available) {
      return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
    }
    return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
        <button 
          onClick={loadSeats}
          className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Plan des Sièges</h2>
        <button
          onClick={loadSeats}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
        >
          Actualiser
        </button>
      </div>
      
      {/* Légende */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
          <span>Sélectionné</span>
        </div>
      </div>

      {/* Scène */}
      <div className="bg-gray-800 text-white text-center py-3 mb-6 rounded">
        🎭 SCÈNE
      </div>

      {/* Grille des sièges */}
      <div className="grid grid-cols-10 gap-2">
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => seat.is_available && onSeatSelect(seat.id)}
            className={`
              w-12 h-12 border-2 rounded text-xs font-medium transition-colors
              ${getSeatColor(seat)}
              ${!seat.is_available ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={!seat.is_available}
            title={`Siège ${seat.number} - ${seat.is_available ? 'Disponible' : 'Réservé'}`}
          >
            {seat.number}
          </button>
        ))}
      </div>

      {/* Statistiques */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Total: {seats.length} sièges | 
          Disponibles: {seats.filter(s => s.is_available).length} | 
          Réservés: {seats.filter(s => !s.is_available).length}
        </p>
      </div>
    </div>
  );
}
