import type { PerformanceMetrics } from "../types/elevator.types";

export class MetricsPanel {
  private element: HTMLElement;

  constructor() {
    this.element = this.createElement();
  }

  private createElement(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = "metrics-panel bg-gray-800 p-6 rounded-lg shadow-lg";
    panel.innerHTML = `
      <h2 class="text-2xl font-bold text-white mb-4">Performance Metrics</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="metric-card bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Average Wait Time</h3>
          <div id="avgWaitTime" class="text-2xl font-bold text-green-400">0.0s</div>
        </div>
        
        <div class="metric-card bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Max Wait Time</h3>
          <div id="maxWaitTime" class="text-2xl font-bold text-red-400">0.0s</div>
        </div>
        
        <div class="metric-card bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Average Travel Time</h3>
          <div id="avgTravelTime" class="text-2xl font-bold text-blue-400">0.0s</div>
        </div>
        
        <div class="metric-card bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Total Requests</h3>
          <div id="totalRequests" class="text-2xl font-bold text-yellow-400">0</div>
        </div>
        
        <div class="metric-card bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Completed Requests</h3>
          <div id="completedRequests" class="text-2xl font-bold text-green-400">0</div>
        </div>
        
        <div class="metric-card bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Pending Requests</h3>
          <div id="pendingRequests" class="text-2xl font-bold text-orange-400">0</div>
        </div>
        
        <div class="metric-card bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Success Rate</h3>
          <div id="successRate" class="text-2xl font-bold text-purple-400">0%</div>
        </div>
        
        <div class="metric-card bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">System Status</h3>
          <div id="systemStatus" class="text-lg font-bold text-gray-400">Stopped</div>
        </div>
      </div>
      
      <div class="mt-6">
        <h3 class="text-lg font-semibold text-white mb-3">Elevator Utilization</h3>
        <div id="elevatorUtilization" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <!-- Elevator utilization bars will be populated here -->
        </div>
      </div>
    `;

    return panel;
  }

  updateMetrics(metrics: PerformanceMetrics, isRunning: boolean): void {
    // Update basic metrics
    const avgWaitTimeElement = this.element.querySelector(
      "#avgWaitTime",
    ) as HTMLElement;
    const maxWaitTimeElement = this.element.querySelector(
      "#maxWaitTime",
    ) as HTMLElement;
    const avgTravelTimeElement = this.element.querySelector(
      "#avgTravelTime",
    ) as HTMLElement;
    const totalRequestsElement = this.element.querySelector(
      "#totalRequests",
    ) as HTMLElement;
    const completedRequestsElement = this.element.querySelector(
      "#completedRequests",
    ) as HTMLElement;
    const pendingRequestsElement = this.element.querySelector(
      "#pendingRequests",
    ) as HTMLElement;
    const successRateElement = this.element.querySelector(
      "#successRate",
    ) as HTMLElement;
    const systemStatusElement = this.element.querySelector(
      "#systemStatus",
    ) as HTMLElement;

    avgWaitTimeElement.textContent = `${(metrics.averageWaitTime / 1000).toFixed(1)}s`;
    maxWaitTimeElement.textContent = `${(metrics.maxWaitTime / 1000).toFixed(1)}s`;
    avgTravelTimeElement.textContent = `${(metrics.averageTravelTime / 1000).toFixed(1)}s`;
    totalRequestsElement.textContent = metrics.totalRequests.toString();
    completedRequestsElement.textContent = metrics.completedRequests.toString();
    pendingRequestsElement.textContent = metrics.pendingRequests.toString();

    // Calculate success rate
    const successRate =
      metrics.totalRequests > 0
        ? (metrics.completedRequests / metrics.totalRequests) * 100
        : 0;
    successRateElement.textContent = `${successRate.toFixed(1)}%`;

    // Update system status
    systemStatusElement.textContent = isRunning ? "Running" : "Stopped";
    systemStatusElement.className = `text-lg font-bold ${isRunning ? "text-green-400" : "text-gray-400"}`;

    // Update elevator utilization
    this.updateElevatorUtilization(metrics.elevatorUtilization);
  }

  private updateElevatorUtilization(utilization: number[]): void {
    const container = this.element.querySelector(
      "#elevatorUtilization",
    ) as HTMLElement;
    container.innerHTML = "";

    utilization.forEach((util, index) => {
      const elevatorCard = document.createElement("div");
      elevatorCard.className = "elevator-utilization bg-gray-700 p-3 rounded";

      const utilizationPercent = (util * 100).toFixed(1);
      const barColor =
        util > 0.8
          ? "bg-red-500"
          : util > 0.5
            ? "bg-yellow-500"
            : "bg-green-500";

      elevatorCard.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-300">Elevator ${index + 1}</span>
          <span class="text-sm font-bold text-white">${utilizationPercent}%</span>
        </div>
        <div class="w-full bg-gray-600 rounded-full h-2">
          <div class="h-2 rounded-full transition-all duration-300 ${barColor}" style="width: ${utilizationPercent}%"></div>
        </div>
      `;

      container.appendChild(elevatorCard);
    });
  }

  getElement(): HTMLElement {
    return this.element;
  }
}
