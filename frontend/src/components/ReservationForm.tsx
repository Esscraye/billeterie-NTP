'use client';

import { useState } from 'react';
import { apiService } from '@/lib/api';

interface ReservationFormProps {
  selectedSeatId: number | null;
  onSuccess: () => void;
}

export default function ReservationForm({ selectedSeatId, onSuccess }: ReservationFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [serverId, setServerId] = useState('server-1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const servers = [
    { id: 'server-1', name: 'Serveur 1 (Référence)' },
    { id: 'server-2', name: 'Serveur 2' },
    { id: 'server-3', name: 'Serveur 3' },
    { id: 'server-4', name: 'Serveur 4' },
    { id: 'server-5', name: 'Serveur 5' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSeatId) {
      setError('Veuillez sélectionner un siège');
      return;
    }

    if (!customerName.trim()) {
      setError('Veuillez saisir votre nom');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await apiService.reserveSeat(selectedSeatId, customerName.trim(), serverId);

      setSuccess(`Siège ${selectedSeatId} réservé avec succès pour ${customerName}!`);
      setCustomerName('');
      onSuccess();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const typedError = err as Error;
      setError(typedError.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateConflict = async () => {
    if (!selectedSeatId) return;

    const seatId = selectedSeatId;
    const names = ['Alice', 'Bob', 'Charlie'];
    const serversToSimulate = ['server-2', 'server-3', 'server-4'];

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await apiService.simulateParallelReservations(seatId, names, serversToSimulate);

      setSuccess(`Réservations concurrentes simulées pour le siège ${seatId}`);
      onSuccess();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const typedError = err as Error;
      setError(typedError.message || 'Erreur de simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Réserver un Siège</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Siège sélectionné</label>
          <div className="p-3 bg-gray-50 rounded border">
            {selectedSeatId ? (
              <span className="text-blue-600 font-medium">Siège n°{selectedSeatId}</span>
            ) : (
              <span className="text-gray-500">Aucun siège sélectionné</span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            Nom du client
          </label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez votre nom"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="serverId" className="block text-sm font-medium text-gray-700 mb-1">
            Serveur de réservation
          </label>
          <select
            id="serverId"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Choisissez le serveur qui traite votre réservation</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedSeatId || !customerName.trim() || loading}
          className={`
            w-full py-2 px-4 rounded-md font-medium transition-colors
            ${!selectedSeatId || !customerName.trim() || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Réservation en cours...
            </span>
          ) : (
            'Réserver ce siège...'
          )}
        </button>
        <button
          type="submit"
          onClick={handleSimulateConflict}
          disabled={!selectedSeatId || loading}
          className="mt-2 w-full py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
        >
          💣 Simuler un conflit sur ce siège
        </button>
      </form>
    </div>
  );
}
