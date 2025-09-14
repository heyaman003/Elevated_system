import { ApiService } from "./services/api.service";
import { ControlPanel } from "./components/ControlPanel";
import { ElevatorShaft } from "./components/ElevatorShaft";
import { MetricsPanel } from "./components/MetricsPanel";
import type { ElevatorSystemState, SimulationConfig } from "./types/elevator.types";

export class ElevatorSimulationApp {
  private apiService: ApiService;
  private controlPanel: ControlPanel;
  private elevatorShaft: ElevatorShaft;
  private metricsPanel: MetricsPanel;
  private appElement: HTMLElement;
  private updateInterval: number | null = null;
  private currentState: ElevatorSystemState | null = null;

  constructor() {
    this.apiService = new ApiService();
    this.appElement = document.getElementById("app")!;

    this.controlPanel = new ControlPanel(
      (config) => this.handleConfigChange(config),
      () => this.handleStart(),
      () => this.handleStop(),
      () => this.handleReset(),
    );

    this.elevatorShaft = new ElevatorShaft((floor) =>
      this.handleFloorButtonClick(floor),
    );

    this.metricsPanel = new MetricsPanel();

    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    try {
      // Create the main layout
      this.appElement.innerHTML = "";
      this.appElement.className = "min-h-screen bg-gray-900 p-4";

      // Add header
      const header = document.createElement("header");
      header.className = "text-center mb-8";
      header.innerHTML = `
        <h1 class="text-4xl font-bold text-white mb-2">Elevator System Simulation</h1>
        <p class="text-gray-400">Intelligent scheduling algorithm with real-time optimization</p>
      `;
      this.appElement.appendChild(header);

      // Add control panel
      this.appElement.appendChild(this.controlPanel.getElement());

      // Add main content area
      const mainContent = document.createElement("div");
      mainContent.className = "grid grid-cols-1 lg:grid-cols-3 gap-6";

      // Add elevator shaft (takes 2 columns on large screens)
      const elevatorContainer = document.createElement("div");
      elevatorContainer.className = "lg:col-span-2";
      elevatorContainer.appendChild(this.elevatorShaft.getElement());
      mainContent.appendChild(elevatorContainer);

      // Add metrics panel (takes 1 column on large screens)
      const metricsContainer = document.createElement("div");
      metricsContainer.className = "lg:col-span-1";
      metricsContainer.appendChild(this.metricsPanel.getElement());
      mainContent.appendChild(metricsContainer);

      this.appElement.appendChild(mainContent);

      // Load initial state
      await this.loadSystemState();

      // Start periodic updates
      this.startPeriodicUpdates();
    } catch (error) {
      console.error("Failed to initialize app:", error);
      this.showError(
        "Failed to connect to the elevator system. Please make sure the backend is running.",
      );
    }
  }

  private async loadSystemState(): Promise<void> {
    try {
      this.currentState = await this.apiService.getSystemState();
      this.updateUI();
    } catch (error) {
      console.error("Failed to load system state:", error);
    }
  }

  private startPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = window.setInterval(async () => {
      await this.loadSystemState();
    }, 1000); // Update every second
  }

  private updateUI(): void {
    if (!this.currentState) return;

    // Update control panel
    this.controlPanel.updateState(this.currentState.isRunning);

    // Update elevator shaft
    this.elevatorShaft.updateState(
      this.currentState.elevators,
      this.currentState.floors,
    );

    // Update metrics panel
    this.metricsPanel.updateMetrics(
      this.currentState.metrics,
      this.currentState.isRunning,
    );
  }

  private async handleConfigChange(
    config: Partial<SimulationConfig>,
  ): Promise<void> {
    try {
      await this.apiService.updateConfig(config);
      console.log("Configuration updated:", config);
    } catch (error) {
      console.error("Failed to update configuration:", error);
      this.showError("Failed to update configuration");
    }
  }

  private async handleStart(): Promise<void> {
    try {
      await this.apiService.startSimulation();
      console.log("Simulation started");
    } catch (error) {
      console.error("Failed to start simulation:", error);
      this.showError("Failed to start simulation");
    }
  }

  private async handleStop(): Promise<void> {
    try {
      await this.apiService.stopSimulation();
      console.log("Simulation stopped");
    } catch (error) {
      console.error("Failed to stop simulation:", error);
      this.showError("Failed to stop simulation");
    }
  }

  private async handleReset(): Promise<void> {
    try {
      await this.apiService.resetSystem();
      console.log("System reset");
    } catch (error) {
      console.error("Failed to reset system:", error);
      this.showError("Failed to reset system");
    }
  }

  private async handleFloorButtonClick(
    floor: number,
    // direction: "up" | "down",
  ): Promise<void> {
    try {
      // For now, we'll create a request to a random destination floor
      // In a real implementation, this would be handled by the user interface
      const destinationFloor = Math.floor(
        Math.random() * (this.currentState?.config.numberOfFloors || 10),
      );

      if (destinationFloor !== floor) {
        await this.apiService.addRequest(floor, destinationFloor);
        console.log(
          `Added request from floor ${floor} to floor ${destinationFloor}`,
        );
      }
    } catch (error) {
      console.error("Failed to add request:", error);
      this.showError("Failed to add request");
    }
  }

  private showError(message: string): void {
    // Create or update error message
    let errorElement = document.getElementById("error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.id = "error-message";
      errorElement.className =
        "fixed top-4 right-4 bg-red-600 text-white p-4 rounded shadow-lg z-50";
      document.body.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = "block";

    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}
