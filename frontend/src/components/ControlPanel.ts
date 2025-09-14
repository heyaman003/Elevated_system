import type { SimulationConfig } from "../types/elevator.types";

export class ControlPanel {
  private element: HTMLElement;
  private onConfigChange: (config: Partial<SimulationConfig>) => void;
  private onStart: () => void;
  private onStop: () => void;
  private onReset: () => void;

  constructor(
    onConfigChange: (config: Partial<SimulationConfig>) => void,
    onStart: () => void,
    onStop: () => void,
    onReset: () => void,
  ) {
    this.onConfigChange = onConfigChange;
    this.onStart = onStart;
    this.onStop = onStop;
    this.onReset = onReset;
    this.element = this.createElement();
  }

  private createElement(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = "control-panel p-6 rounded-lg shadow-lg mb-6";
    panel.innerHTML = `
      <h2 class="text-2xl font-bold text-white mb-4">Control Panel</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Number of Elevators</label>
          <input 
            type="number" 
            id="elevatorCount" 
            min="1" 
            max="10" 
            value="3"
            class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Number of Floors</label>
          <input 
            type="number" 
            id="floorCount" 
            min="2" 
            max="50" 
            value="10"
            class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Request Frequency</label>
          <input 
            type="range" 
            id="requestFrequency" 
            min="0.1" 
            max="2" 
            step="0.1" 
            value="0.5"
            class="w-full"
          />
          <span id="frequencyValue" class="text-sm text-gray-300">0.5 req/s</span>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Simulation Speed</label>
          <select 
            id="simulationSpeed" 
            class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
          >
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="5">5x</option>
          </select>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-4 mb-6">
        <label class="flex items-center">
          <input 
            type="checkbox" 
            id="peakTrafficMode" 
            class="mr-2"
          />
          <span class="text-gray-300">Peak Traffic Mode</span>
        </label>
        
        <label class="flex items-center">
          <input 
            type="checkbox" 
            id="morningRushHour" 
            class="mr-2"
          />
          <span class="text-gray-300">Morning Rush Hour</span>
        </label>
      </div>
      
      <div class="flex gap-4">
        <button 
          id="startBtn" 
          class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Start
        </button>
        <button 
          id="stopBtn" 
          class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Stop
        </button>
        <button 
          id="resetBtn" 
          class="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
        >
          Reset
        </button>
      </div>
    `;

    this.attachEventListeners(panel);
    return panel;
  }

  private attachEventListeners(panel: HTMLElement): void {
    // Configuration change listeners
    const elevatorCount = panel.querySelector(
      "#elevatorCount",
    ) as HTMLInputElement;
    const floorCount = panel.querySelector("#floorCount") as HTMLInputElement;
    const requestFrequency = panel.querySelector(
      "#requestFrequency",
    ) as HTMLInputElement;
    const frequencyValue = panel.querySelector(
      "#frequencyValue",
    ) as HTMLElement;
    const simulationSpeed = panel.querySelector(
      "#simulationSpeed",
    ) as HTMLSelectElement;
    const peakTrafficMode = panel.querySelector(
      "#peakTrafficMode",
    ) as HTMLInputElement;
    const morningRushHour = panel.querySelector(
      "#morningRushHour",
    ) as HTMLInputElement;

    // Update frequency display
    requestFrequency.addEventListener("input", () => {
      frequencyValue.textContent = `${requestFrequency.value} req/s`;
    });

    // Configuration change handler
    const updateConfig = () => {
      this.onConfigChange({
        numberOfElevators: parseInt(elevatorCount.value),
        numberOfFloors: parseInt(floorCount.value),
        requestFrequency: parseFloat(requestFrequency.value),
        simulationSpeed: parseInt(simulationSpeed.value),
        peakTrafficMode: peakTrafficMode.checked,
        morningRushHour: morningRushHour.checked,
      });
    };

    elevatorCount.addEventListener("change", updateConfig);
    floorCount.addEventListener("change", updateConfig);
    requestFrequency.addEventListener("change", updateConfig);
    simulationSpeed.addEventListener("change", updateConfig);
    peakTrafficMode.addEventListener("change", updateConfig);
    morningRushHour.addEventListener("change", updateConfig);

    // Control button listeners
    const startBtn = panel.querySelector("#startBtn") as HTMLButtonElement;
    const stopBtn = panel.querySelector("#stopBtn") as HTMLButtonElement;
    const resetBtn = panel.querySelector("#resetBtn") as HTMLButtonElement;

    startBtn.addEventListener("click", this.onStart);
    stopBtn.addEventListener("click", this.onStop);
    resetBtn.addEventListener("click", this.onReset);
  }

  updateState(isRunning: boolean): void {
    const startBtn = this.element.querySelector(
      "#startBtn",
    ) as HTMLButtonElement;
    const stopBtn = this.element.querySelector("#stopBtn") as HTMLButtonElement;

    startBtn.disabled = isRunning;
    stopBtn.disabled = !isRunning;

    if (isRunning) {
      startBtn.classList.add("opacity-50", "cursor-not-allowed");
      stopBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else {
      startBtn.classList.remove("opacity-50", "cursor-not-allowed");
      stopBtn.classList.add("opacity-50", "cursor-not-allowed");
    }
  }

  getElement(): HTMLElement {
    return this.element;
  }
}
