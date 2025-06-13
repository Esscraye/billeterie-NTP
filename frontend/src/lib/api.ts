const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Seat {
  id: number;
  number: number;
  is_available: boolean;
  created_at: string;
}

export interface Reservation {
  id: number;
  seat_id: number;
  customer_name: string;
  reserved_at: string;
  server_id: string;
  ntp_synced: boolean;
  seat?: Seat;
}

export interface Conflict {
  id: number;
  seat_id: number;
  reservation_ids: string;
  detected_at: string;
  time_difference_seconds: number;
  resolved: boolean;
}

export interface TimeStatus {
  server_id: string;
  current_time: string;
  ntp_synced: boolean;
  offset_seconds: number;
  last_sync: string | null;
}

export interface SimulationRequest {
  server_id: string;
  offset_seconds: number;
}

export interface SimulationScenario {
  name: string;
  description: string;
  servers: Record<string, number>;
}

export interface SimulationScenarios {
  [key: string]: SimulationScenario;
}

class ApiService {
  // Seats
  async getSeats(): Promise<Seat[]> {
    const response = await fetch(`${API_BASE_URL}/api/seats`);
    return response.json();
  }

  async initializeSeats(totalSeats: number = 100): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/seats/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_seats: totalSeats }),
    });
    return response.json();
  }

  // Reservations
  async reserveSeat(seatId: number, customerName: string, serverId: string = 'server-1'): Promise<Reservation> {
    const response = await fetch(`${API_BASE_URL}/api/reservations/reserve?server_id=${serverId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seat_id: seatId,
        customer_name: customerName,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Reservation failed');
    }
    
    return response.json();
  }

  async getReservations(): Promise<Reservation[]> {
    const response = await fetch(`${API_BASE_URL}/api/reservations`);
    return response.json();
  }

  async getConflicts(): Promise<Conflict[]> {
    const response = await fetch(`${API_BASE_URL}/api/reservations/conflicts`);
    return response.json();
  }

  async cancelReservation(reservationId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/reservations/${reservationId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // Time management
  async getTimeStatus(serverId: string = 'server-1'): Promise<TimeStatus> {
    const response = await fetch(`${API_BASE_URL}/api/time/status?server_id=${serverId}`);
    return response.json();
  }

  async syncTime(serverId: string = 'server-1'): Promise<{ success: boolean; offset_seconds: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/time/sync?server_id=${serverId}`, {
      method: 'POST',
    });
    return response.json();
  }

  // Simulation
  async setTimeOffset(serverId: string, offsetSeconds: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/simulation/set-offset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        server_id: serverId,
        offset_seconds: offsetSeconds,
      }),
    });
    return response.json();
  }

  async removeTimeOffset(serverId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/simulation/offset/${serverId}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  async getAllOffsets(): Promise<{ offsets: Record<string, number>; total_servers: number }> {
    const response = await fetch(`${API_BASE_URL}/api/simulation/offsets`);
    return response.json();
  }

  async startDemoSimulation(): Promise<{ message: string; servers_configured: Record<string, number> }> {
    const response = await fetch(`${API_BASE_URL}/api/simulation/start-demo`, {
      method: 'POST',
    });
    return response.json();
  }

  async stopSimulation(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/simulation/stop-simulation`, {
      method: 'POST',
    });
    return response.json();
  }

  async getSimulationScenarios(): Promise<SimulationScenarios> {
    const response = await fetch(`${API_BASE_URL}/api/simulation/scenarios`);
    return response.json();
  }

  async applyScenario(scenarioName: string): Promise<{ message: string; servers_configured: Record<string, number> }> {
    const response = await fetch(`${API_BASE_URL}/api/simulation/apply-scenario/${scenarioName}`, {
      method: 'POST',
    });
    return response.json();
  }
}

export const apiService = new ApiService();
