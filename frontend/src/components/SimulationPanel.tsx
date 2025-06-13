'use client';

import { useState, useEffect } from 'react';
import { apiService, SimulationScenarios } from '@/lib/api';

export default function SimulationPanel({ onSuccess }: { onSuccess?: () => void }) {
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [scenarios, setScenarios] = useState<SimulationScenarios>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadOffsets();
    loadScenarios();
  }, []);

  const loadOffsets = async () => {
    try {
      const data = await apiService.getAllOffsets();
      setOffsets(data.offsets);
    } catch {
      console.error('Erreur lors du chargement des décalages');
    }
  };

  const loadScenarios = async () => {
    try {
      const data = await apiService.getSimulationScenarios();
      setScenarios(data);
    } catch {
      console.error('Erreur lors du chargement des scénarios');
    }
  };

  const applyOffset = async (serverId: string, offset: number) => {
    try {
      setLoading(true);
      await apiService.setTimeOffset(serverId, offset);
      await loadOffsets();
      setMessage(`Décalage appliqué au ${serverId}: ${offset}s`);
      setTimeout(() => setMessage(null), 3000);
      onSuccess?.();
    } catch {
      setMessage("Erreur lors de l'application du décalage");
    } finally {
      setLoading(false);
    }
  };

  const removeOffset = async (serverId: string) => {
    try {
      setLoading(true);
      await apiService.removeTimeOffset(serverId);
      await loadOffsets();
      setMessage(`Décalage supprimé pour ${serverId}`);
      setTimeout(() => setMessage(null), 3000);
      onSuccess?.();
    } catch {
      setMessage('Erreur lors de la suppression du décalage');
    } finally {
      setLoading(false);
    }
  };

  const applyScenario = async (scenarioName: string) => {
    try {
      setLoading(true);
      await apiService.applyScenario(scenarioName);
      await loadOffsets();
      setMessage(`Scénario "${scenarioName}" appliqué avec succès`);
      setTimeout(() => setMessage(null), 3000);
      onSuccess?.();
    } catch {
      setMessage('Erreur lors de l\'application du scénario');
    } finally {
      setLoading(false);
    }
  };

  const startDemo = async () => {
    try {
      setLoading(true);
      await apiService.startDemoSimulation();
      await loadOffsets();
      setMessage('Démonstration démarrée avec succès');
      setTimeout(() => setMessage(null), 3000);
      onSuccess?.();
    } catch {
      setMessage('Erreur lors du démarrage de la démonstration');
    } finally {
      setLoading(false);
    }
  };

  const stopSimulation = async () => {
    try {
      setLoading(true);
      await apiService.stopSimulation();
      await loadOffsets();
      setMessage('Simulation arrêtée - Tous les serveurs synchronisés');
      setTimeout(() => setMessage(null), 3000);
      onSuccess?.();
    } catch {
      setMessage('Erreur lors de l\'arrêt de la simulation');
    } finally {
      setLoading(false);
    }
  };

  const quickOffsets = [-10, -5, -1, 0, 1, 5, 10];
  const servers = ['server-1', 'server-2', 'server-3', 'server-4', 'server-5'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">🕐 Simulation NTP</h2>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-md text-blue-700">
          {message}
        </div>
      )}

      {/* Décalages rapides */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Décalages rapides</h3>
        <div className="grid grid-cols-4 gap-2">
          {servers.map(serverId => (
            <div key={serverId} className="text-center">
              <div className="text-sm text-gray-600 mb-1">{serverId}</div>
              <div className="flex flex-wrap gap-1 justify-center">
                {quickOffsets.map(offset => (
                  <button
                    key={offset}
                    onClick={() => applyOffset(serverId, offset)}
                    disabled={loading}
                    className={`px-2 py-1 text-xs rounded ${
                      offsets[serverId] === offset
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    } disabled:opacity-50`}
                  >
                    {offset > 0 ? '+' : ''}{offset}s
                  </button>
                ))}
              </div>
              {offsets[serverId] !== undefined && (
                <button
                  onClick={() => removeOffset(serverId)}
                  disabled={loading}
                  className="mt-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Reset
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* État actuel */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">État actuel des décalages</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {Object.keys(offsets).length === 0 ? (
            <p className="text-gray-500 text-center">Aucun décalage actif</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(offsets).map(([serverId, offset]) => (
                <div key={serverId} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{serverId}:</span>
                  <span className={`text-sm ${offset > 0 ? 'text-red-600' : offset < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                    {offset > 0 ? '+' : ''}{offset}s
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scénarios prédéfinis */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Scénarios prédéfinis</h3>
        <div className="space-y-2">
          {Object.entries(scenarios).map(([scenarioName, scenario]) => (
            <div key={scenarioName} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{scenario.name}</h4>
                <button
                  onClick={() => applyScenario(scenarioName)}
                  disabled={loading}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Appliquer
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
              <div className="text-xs text-gray-500">
                Serveurs: {Object.entries(scenario.servers).map(([srv, offset]) => 
                  `${srv}(${offset > 0 ? '+' : ''}${offset}s)`
                ).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions globales */}
      <div className="flex space-x-3">
        <button
          onClick={startDemo}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Chargement...' : 'Démo automatique'}
        </button>
        <button
          onClick={stopSimulation}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Arrêter simulation
        </button>
      </div>
    </div>
  );
}
