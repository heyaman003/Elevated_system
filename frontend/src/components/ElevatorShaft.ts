import type {
  Elevator,
  Floor,

} from "../types/elevator.types";
import {
  ElevatorDirection,
  ElevatorDoorState,

} from "../types/elevator.types";

export class ElevatorShaft {
  private element: HTMLElement;
  private elevators: Elevator[] = [];
  private floors: Floor[] = [];
  private onFloorButtonClick: (floor: number, direction: "up" | "down") => void;

  constructor(
    onFloorButtonClick: (floor: number, direction: "up" | "down") => void,
  ) {
    this.onFloorButtonClick = onFloorButtonClick;
    this.element = this.createElement();
  }

  private createElement(): HTMLElement {
    const shaft = document.createElement("div");
    shaft.className = "elevator-shaft flex gap-4 p-4 rounded-lg";
    return shaft;
  }

  updateState(elevators: Elevator[], floors: Floor[]): void {
    this.elevators = elevators;
    this.floors = floors;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = "";

    // Create floor buttons column
    const floorButtonsColumn = this.createFloorButtonsColumn();
    this.element.appendChild(floorButtonsColumn);

    // Create elevator shafts
    this.elevators.forEach((elevator, index) => {
      const elevatorShaft = this.createElevatorShaft(elevator, index);
      this.element.appendChild(elevatorShaft);
    });
  }

  private createFloorButtonsColumn(): HTMLElement {
    const column = document.createElement("div");
    column.className = "floor-buttons flex flex-col-reverse gap-1";

    for (let i = this.floors.length - 1; i >= 0; i--) {
      const floor = this.floors[i];
      const floorElement = this.createFloorButton(floor);
      column.appendChild(floorElement);
    }

    return column;
  }

  private createFloorButton(floor: Floor): HTMLElement {
    const floorElement = document.createElement("div");
    floorElement.className =
      "floor-button-container flex flex-col items-center gap-1 p-2 bg-gray-800 rounded";
    floorElement.innerHTML = `
      <div class="text-sm text-white font-bold">F${floor.number}</div>
      <div class="flex gap-1">
        <button 
          class="floor-button w-8 h-8 rounded text-xs font-bold transition-all ${floor.upRequest
        ? "active bg-blue-600 text-white"
        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
      }"
          data-floor="${floor.number}"
          data-direction="up"
        >
          ↑
        </button>
        <button 
          class="floor-button w-8 h-8 rounded text-xs font-bold transition-all ${floor.downRequest
        ? "active bg-blue-600 text-white"
        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
      }"
          data-floor="${floor.number}"
          data-direction="down"
        >
          ↓
        </button>
      </div>
      <div class="text-xs text-gray-400">${floor.waitingPassengers} waiting</div>
    `;

    // Add click listeners
    const upButton = floorElement.querySelector(
      '[data-direction="up"]',
    ) as HTMLButtonElement;
    const downButton = floorElement.querySelector(
      '[data-direction="down"]',
    ) as HTMLButtonElement;

    upButton.addEventListener("click", () => {
      this.onFloorButtonClick(floor.number, "up");
    });

    downButton.addEventListener("click", () => {
      this.onFloorButtonClick(floor.number, "down");
    });

    return floorElement;
  }

  private createElevatorShaft(elevator: Elevator, index: number): HTMLElement {
    const shaft = document.createElement("div");
    shaft.className = "elevator-shaft-column flex flex-col-reverse relative";
    shaft.style.width = "80px";
    shaft.style.height = `${this.floors.length * 60}px`;
    shaft.style.backgroundColor = "#374151";
    shaft.style.border = "2px solid #4b5563";
    shaft.style.borderRadius = "8px";

    // Create floors in shaft
    for (let i = 0; i < this.floors.length; i++) {
      const floorLine = document.createElement("div");
      floorLine.className =
        "floor-line absolute w-full border-t border-gray-500";
      floorLine.style.top = `${(this.floors.length - 1 - i) * 60}px`;
      floorLine.style.height = "1px";
      shaft.appendChild(floorLine);
    }

    // Create elevator car
    const elevatorCar = this.createElevatorCar(elevator);
    shaft.appendChild(elevatorCar);

    // Add elevator info
    const info = document.createElement("div");
    info.className = "elevator-info absolute -top-8 left-0 text-xs text-white";
    info.innerHTML = `
      <div>E${index + 1}</div>
      <div>${elevator.passengerCount}/${elevator.maxCapacity}</div>
    `;
    shaft.appendChild(info);

    return shaft;
  }

  private createElevatorCar(elevator: Elevator): HTMLElement {
    const car = document.createElement("div");
    car.className =
      "elevator-car absolute w-16 h-12 rounded border-2 transition-all duration-500";

    // Position the elevator
    const floorHeight = 60;
    const bottomPosition =
      (this.floors.length - 1 - elevator.currentFloor) * floorHeight;
    car.style.bottom = `${bottomPosition}px`;
    car.style.left = "8px";

    // Set elevator color based on direction
    let backgroundColor = "#6b7280"; // idle
    if (elevator.direction === ElevatorDirection.UP) {
      backgroundColor = "#10b981"; // green for up
    } else if (elevator.direction === ElevatorDirection.DOWN) {
      backgroundColor = "#ef4444"; // red for down
    }

    car.style.backgroundColor = backgroundColor;
    car.style.borderColor = "#374151";

    // Add door animation
    if (
      elevator.doorState === ElevatorDoorState.OPEN ||
      elevator.doorState === ElevatorDoorState.OPENING
    ) {
      car.style.backgroundColor = "#fbbf24"; // yellow for doors open
    }

    // Add direction indicator
    const directionIndicator = document.createElement("div");
    directionIndicator.className =
      "elevator-indicator absolute top-1 right-1 text-xs font-bold text-white";

    if (elevator.direction === ElevatorDirection.UP) {
      directionIndicator.textContent = "↑";
    } else if (elevator.direction === ElevatorDirection.DOWN) {
      directionIndicator.textContent = "↓";
    } else {
      directionIndicator.textContent = "●";
    }

    car.appendChild(directionIndicator);

    // Add passenger count
    const passengerCount = document.createElement("div");
    passengerCount.className =
      "passenger-count absolute bottom-1 left-1 text-xs font-bold text-white";
    passengerCount.textContent = elevator.passengerCount.toString();
    car.appendChild(passengerCount);

    // Add target floor indicator
    if (elevator.targetFloor !== null) {
      const targetIndicator = document.createElement("div");
      targetIndicator.className =
        "target-indicator absolute top-1 left-1 text-xs font-bold text-white bg-black bg-opacity-50 rounded px-1";
      targetIndicator.textContent = elevator.targetFloor.toString();
      car.appendChild(targetIndicator);
    }

    return car;
  }

  getElement(): HTMLElement {
    return this.element;
  }
}
