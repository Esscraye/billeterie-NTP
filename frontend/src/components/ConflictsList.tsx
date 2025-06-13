'use client';

import { useState, useEffect } from 'react';
import { Conflict, Reservation, apiService } from '@/lib/api';
import { AlertTriangle, Clock, Users, XCircle } from 'lucide-react';

export default function ConflictsList({ refreshKey }: { refreshKey: number }) {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    
    // Actualiser les données toutes les 5 secondes
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const loadData = async () => {
    try {
      const [conflictsData, reservationsData] = await Promise.all([
        apiService.getConflicts(),
        apiService.getReservations()
      ]);
      
      setConflicts(conflictsData);
      setReservations(reservationsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getReservationsByIds = (reservationIds: string): Reservation[] => {
    try {
      const ids = JSON.parse(reservationIds).map(Number);
      return reservations.filter(r => ids.includes(r.id));
    } catch {
      return [];
    }
  };

  const formatTimeDifference = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(2)}s`;
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="text-red-500" size={24} />
          Conflits de Réservation
        </h2>
        <button
          onClick={loadData}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {conflicts.length === 0 ? (
        <div className="text-center py-8">
          <XCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun conflit détecté</h3>
          <p className="text-gray-500">
            Tous les serveurs sont synchronisés correctement !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Statistiques */}
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={16} />
                <span className="font-medium">
                  {conflicts.length} conflit{conflicts.length > 1 ? 's' : ''} détecté{conflicts.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-blue-500" size={16} />
                <span>
                  {reservations.length} réservation{reservations.length > 1 ? 's' : ''} au total
                </span>
              </div>
            </div>
          </div>

          {/* Liste des conflits */}
          {conflicts.map((conflict) => {
            const conflictReservations = getReservationsByIds(conflict.reservation_ids);
            
            return (
              <div key={conflict.id} className="border border-red-300 rounded-lg p-4 bg-red-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-red-800">
                      Conflit sur le siège #{conflict.seat_id}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Écart: {formatTimeDifference(conflict.time_difference_seconds)}
                      </span>
                      <span>
                        Détecté: {formatDateTime(conflict.detected_at)}
                      </span>
                    </div>
                  </div>
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${conflict.resolved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {conflict.resolved ? 'Résolu' : 'Non résolu'}
                  </span>
                </div>

                {/* Détails des réservations en conflit */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Réservations en conflit:
                  </h4>
                  {conflictReservations.map((reservation) => (
                    <div 
                      key={reservation.id} 
                      className="bg-white border rounded p-3 text-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{reservation.customer_name}</span>
                          <span className="text-gray-500 ml-2">
                            (Réservation #{reservation.id})
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-600">
                            {reservation.server_id}
                          </div>
                          <div className={`text-xs ${
                            reservation.ntp_synced 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {reservation.ntp_synced ? 'NTP Sync' : 'Désynchronisé'}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-600 mt-1">
                        Heure: {formatDateTime(reservation.reserved_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
