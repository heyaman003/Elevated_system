import type {
  ElevatorSystemState,
  SimulationConfig,
  ElevatorRequest,
} from "../types/elevator.types";

const API_BASE_URL = "/api/elevator";

export class ApiService {
  async getSystemState(): Promise<ElevatorSystemState> {
    const response = await fetch(`${API_BASE_URL}/state`);
    if (!response.ok) {
      throw new Error("Failed to fetch system state");
    }
    return response.json();
  }

  async startSimulation(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/start`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to start simulation");
    }
  }

  async stopSimulation(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/stop`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to stop simulation");
    }
  }

  async resetSystem(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to reset system");
    }
  }

  async updateConfig(config: Partial<SimulationConfig>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error("Failed to update configuration");
    }
  }

  async addRequest(
    originFloor: number,
    destinationFloor: number,
  ): Promise<ElevatorRequest> {
    const response = await fetch(`${API_BASE_URL}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ originFloor, destinationFloor }),
    });
    if (!response.ok) {
      throw new Error("Failed to add request");
    }
    return response.json();
  }

  async getMetrics() {
    const response = await fetch(`${API_BASE_URL}/metrics`);
    if (!response.ok) {
      throw new Error("Failed to fetch metrics");
    }
    return response.json();
  }
}
