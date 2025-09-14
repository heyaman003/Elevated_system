import { Injectable } from '@nestjs/common';
import {
  Elevator,
  ElevatorDirection,
  ElevatorDoorState,
  ElevatorRequest,
  RequestType,
  RequestDirection,
  Floor,
  SimulationConfig,
  PerformanceMetrics,
  ElevatorSystemState,
} from '../types/elevator.types';
import { SchedulerService } from './scheduler.service';

@Injectable()
export class ElevatorService {
  private elevators: Elevator[] = [];
  private floors: Floor[] = [];
  private requests: ElevatorRequest[] = [];
  private config: SimulationConfig;
  private metrics: PerformanceMetrics;
  private isRunning = false;
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor(private schedulerService: SchedulerService) {
    this.initializeSystem();
  }

  private initializeSystem(): void {
    this.config = {
      numberOfElevators: 3,
      numberOfFloors: 10,
      requestFrequency: 0.5,
      simulationSpeed: 1,
      isRunning: false,
      peakTrafficMode: false,
      morningRushHour: false,
    };

    this.metrics = {
      averageWaitTime: 0,
      maxWaitTime: 0,
      averageTravelTime: 0,
      elevatorUtilization: [],
      totalRequests: 0,
      completedRequests: 0,
      pendingRequests: 0,
      timestamp: Date.now(),
    };

    this.resetSystem();
  }

  resetSystem(): void {
    this.elevators = [];
    this.floors = [];
    this.requests = [];
    this.isRunning = false;

    // Initialize elevators
    for (let i = 0; i < this.config.numberOfElevators; i++) {
      this.elevators.push({
        id: `elevator-${i}`,
        currentFloor: 0,
        targetFloor: null,
        direction: ElevatorDirection.IDLE,
        doorState: ElevatorDoorState.CLOSED,
        passengerCount: 0,
        maxCapacity: 8,
        isMoving: false,
        requests: [],
        lastUpdateTime: Date.now(),
      });
    }

    // Initialize floors
    for (let i = 0; i < this.config.numberOfFloors; i++) {
      this.floors.push({
        number: i,
        upRequest: false,
        downRequest: false,
        waitingPassengers: 0,
      });
    }

    // Initialize elevator utilization array
    this.metrics.elevatorUtilization = new Array(
      this.config.numberOfElevators,
    ).fill(0) as number[];
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  updateConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // If number of elevators or floors changed, reset system
    if (newConfig.numberOfElevators || newConfig.numberOfFloors) {
      this.resetSystem();
    }
  }

  startSimulation(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.config.isRunning = true;
    // Main simulation loop
    this.simulationInterval = setInterval(() => {
      this.updateSimulation();
    }, 1000 / this.config.simulationSpeed);
  }

  stopSimulation(): void {
    this.isRunning = false;
    this.config.isRunning = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private updateSimulation(): void {
    // Generate random requests
    this.generateRandomRequests();

    // Update elevator states
    this.updateElevators();

    // Update metrics
    this.updateMetrics();
  }

  private generateRandomRequests(): void {
    const shouldGenerateRequest = Math.random() < this.config.requestFrequency;

    if (shouldGenerateRequest) {
      this.generateRandomRequest();
    }
  }

  private generateRandomRequest(): void {
    const originFloor = Math.floor(Math.random() * this.config.numberOfFloors);
    let destinationFloor: number;

    do {
      destinationFloor = Math.floor(Math.random() * this.config.numberOfFloors);
    } while (destinationFloor === originFloor);

    const request: ElevatorRequest = {
      id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: RequestType.EXTERNAL,
      originFloor,
      destinationFloor,
      direction:
        destinationFloor > originFloor
          ? RequestDirection.UP
          : RequestDirection.DOWN,
      timestamp: Date.now(),
      priority: this.calculateRequestPriority(originFloor, destinationFloor),
      assignedElevatorId: null,
      status: 'pending',
      waitTime: 0,
      travelTime: 0,
    };

    this.requests.push(request);
    this.metrics.totalRequests++;

    // Update floor requests
    if (request.direction === RequestDirection.UP) {
      this.floors[originFloor].upRequest = true;
    } else {
      this.floors[originFloor].downRequest = true;
    }
    this.floors[originFloor].waitingPassengers++;
  }

  private calculateRequestPriority(
    originFloor: number,
    destinationFloor: number,
  ): number {
    let priority = 1;

    // Morning rush hour bias: prioritize lobby-to-upper-floor requests
    if (
      this.config.morningRushHour &&
      originFloor === 0 &&
      destinationFloor > 0
    ) {
      priority += 2;
    }

    // Peak traffic mode bias
    if (this.config.peakTrafficMode) {
      priority += 1;
    }

    return priority;
  }

  private updateElevators(): void {
    this.elevators.forEach((elevator) => {
      this.updateElevatorState(elevator);
    });
  }

  private updateElevatorState(elevator: Elevator): void {
    const now = Date.now();
    // const timeDelta = now - elevator.lastUpdateTime;
    elevator.lastUpdateTime = now;

    // Update door state
    this.updateDoorState(elevator);

    // If doors are closed and elevator has a target, move towards it
    if (
      elevator.doorState === ElevatorDoorState.CLOSED &&
      elevator.targetFloor !== null
    ) {
      this.moveElevator(elevator);
    }

    // Assign new requests to this elevator
    this.assignRequestsToElevator(elevator);
  }

  private updateDoorState(elevator: Elevator): void {
    const doorOpenTime = 3000; // 3 seconds

    switch (elevator.doorState) {
      case ElevatorDoorState.OPENING:
        elevator.doorState = ElevatorDoorState.OPEN;
        // Schedule door closing
        setTimeout(() => {
          if (elevator.doorState === ElevatorDoorState.OPEN) {
            elevator.doorState = ElevatorDoorState.CLOSING;
          }
        }, doorOpenTime);
        break;

      case ElevatorDoorState.CLOSING:
        elevator.doorState = ElevatorDoorState.CLOSED;
        break;
    }
  }

  private moveElevator(elevator: Elevator): void {
    if (elevator.targetFloor === null) return;

    // const floorHeight = 100; // pixels or units
    // const speed = 50; // units per second
    // const moveDistance = (speed * timeDelta) / 1000;

    if (elevator.currentFloor < elevator.targetFloor) {
      elevator.direction = ElevatorDirection.UP;
      elevator.isMoving = true;
      // Simulate movement - in real implementation, this would update position
      if (Math.random() < 0.1) {
        // 10% chance to reach next floor each update
        elevator.currentFloor++;
        if (elevator.currentFloor >= elevator.targetFloor) {
          elevator.currentFloor = elevator.targetFloor;
          elevator.targetFloor = null;
          elevator.direction = ElevatorDirection.IDLE;
          elevator.isMoving = false;
          elevator.doorState = ElevatorDoorState.OPENING;
          this.handleElevatorArrival(elevator);
        }
      }
    } else if (elevator.currentFloor > elevator.targetFloor) {
      elevator.direction = ElevatorDirection.DOWN;
      elevator.isMoving = true;
      if (Math.random() < 0.1) {
        // 10% chance to reach next floor each update
        elevator.currentFloor--;
        if (elevator.currentFloor <= elevator.targetFloor) {
          elevator.currentFloor = elevator.targetFloor;
          elevator.targetFloor = null;
          elevator.direction = ElevatorDirection.IDLE;
          elevator.isMoving = false;
          elevator.doorState = ElevatorDoorState.OPENING;
          this.handleElevatorArrival(elevator);
        }
      }
    }
  }

  private handleElevatorArrival(elevator: Elevator): void {
    // Handle passenger pickup and dropoff
    const floor = this.floors[elevator.currentFloor];

    // Clear floor requests
    floor.upRequest = false;
    floor.downRequest = false;
    floor.waitingPassengers = 0;

    // Update requests
    this.requests.forEach((request) => {
      if (
        request.assignedElevatorId === elevator.id &&
        request.originFloor === elevator.currentFloor
      ) {
        request.status = 'picked_up';
        elevator.passengerCount++;
      }

      if (
        request.assignedElevatorId === elevator.id &&
        request.destinationFloor === elevator.currentFloor &&
        request.status === 'picked_up'
      ) {
        request.status = 'completed';
        request.travelTime = Date.now() - request.timestamp - request.waitTime;
        elevator.passengerCount--;
        this.metrics.completedRequests++;
      }
    });
  }

  private assignRequestsToElevator(elevator: Elevator): void {
    if (
      elevator.targetFloor !== null ||
      elevator.doorState !== ElevatorDoorState.CLOSED
    ) {
      return; // Elevator is busy
    }

    // Find best request for this elevator using intelligent scheduling
    const pendingRequests = this.requests.filter(
      (r) => r.status === 'pending' && r.assignedElevatorId === null,
    );

    if (pendingRequests.length === 0) return;

    // Use the scheduler service to find the best request for this elevator
    let bestRequest: ElevatorRequest | null = null;
    let bestScore = Infinity;

    for (const request of pendingRequests) {
      const assignedElevatorId = this.schedulerService.assignRequestToElevator(
        request,
        [elevator],
        this.requests,
        this.config,
      );

      if (assignedElevatorId === elevator.id) {
        // Calculate a simple score for this request
        const distance = Math.abs(elevator.currentFloor - request.originFloor);
        const priorityScore = 10 - request.priority;
        const score = distance + priorityScore;

        if (score < bestScore) {
          bestScore = score;
          bestRequest = request;
        }
      }
    }

    if (bestRequest) {
      bestRequest.assignedElevatorId = elevator.id;
      bestRequest.status = 'assigned';
      elevator.targetFloor = bestRequest.originFloor;
    }
  }

  private updateMetrics(): void {
    const now = Date.now();

    // Update wait times for pending requests
    this.requests.forEach((request) => {
      if (request.status === 'pending' || request.status === 'assigned') {
        request.waitTime = now - request.timestamp;
      }
    });

    // Calculate average wait time
    const pendingRequests = this.requests.filter(
      (r) => r.status === 'pending' || r.status === 'assigned',
    );
    if (pendingRequests.length > 0) {
      this.metrics.averageWaitTime =
        pendingRequests.reduce((sum, r) => sum + r.waitTime, 0) /
        pendingRequests.length;
      this.metrics.maxWaitTime = Math.max(
        ...pendingRequests.map((r) => r.waitTime),
      );
    }

    // Calculate average travel time
    const completedRequests = this.requests.filter(
      (r) => r.status === 'completed',
    );
    if (completedRequests.length > 0) {
      this.metrics.averageTravelTime =
        completedRequests.reduce((sum, r) => sum + r.travelTime, 0) /
        completedRequests.length;
    }

    this.metrics.pendingRequests = pendingRequests.length;
    this.metrics.timestamp = now;

    // Update elevator utilization
    this.elevators.forEach((elevator, index) => {
      this.metrics.elevatorUtilization[index] = elevator.isMoving ? 1 : 0;
    });
  }

  getSystemState(): ElevatorSystemState {
    return {
      elevators: [...this.elevators],
      floors: [...this.floors],
      requests: [...this.requests],
      config: { ...this.config },
      metrics: { ...this.metrics },
      isRunning: this.isRunning,
    };
  }

  addRequest(originFloor: number, destinationFloor: number): ElevatorRequest {
    const request: ElevatorRequest = {
      id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: RequestType.EXTERNAL,
      originFloor,
      destinationFloor,
      direction:
        destinationFloor > originFloor
          ? RequestDirection.UP
          : RequestDirection.DOWN,
      timestamp: Date.now(),
      priority: this.calculateRequestPriority(originFloor, destinationFloor),
      assignedElevatorId: null,
      status: 'pending',
      waitTime: 0,
      travelTime: 0,
    };

    this.requests.push(request);
    this.metrics.totalRequests++;

    // Update floor requests
    if (request.direction === RequestDirection.UP) {
      this.floors[originFloor].upRequest = true;
    } else {
      this.floors[originFloor].downRequest = true;
    }
    this.floors[originFloor].waitingPassengers++;

    return request;
  }
}
