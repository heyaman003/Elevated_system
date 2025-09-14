import { Injectable } from '@nestjs/common';
import {
  Elevator,
  ElevatorRequest,
  ElevatorDirection,
  RequestDirection,
  RequestType,
  SimulationConfig,
} from '../types/elevator.types';

interface SchedulingScore {
  elevatorId: string;
  score: number;
  estimatedWaitTime: number;
  estimatedTravelTime: number;
  reasoning: string;
}

@Injectable()
export class SchedulerService {
  /**
   * Advanced elevator scheduling algorithm with multiple optimization strategies
   */
  assignRequestToElevator(
    request: ElevatorRequest,
    elevators: Elevator[],
    allRequests: ElevatorRequest[],
    config: SimulationConfig,
  ): string | null {
    const availableElevators = elevators.filter(
      (e) => e.doorState === 'closed' && e.passengerCount < e.maxCapacity,
    );

    if (availableElevators.length === 0) {
      return null;
    }

    // Calculate scores for each elevator
    const scores: SchedulingScore[] = availableElevators.map((elevator) => {
      return this.calculateElevatorScore(
        request,
        elevator,
        allRequests,
        config,
      );
    });

    // Sort by score (lower is better)
    scores.sort((a, b) => a.score - b.score);

    const bestElevator = scores[0];
    console.log(
      `Assigning request ${request.id} to ${bestElevator.elevatorId}: ${bestElevator.reasoning}`,
    );

    return bestElevator.elevatorId;
  }

  private calculateElevatorScore(
    request: ElevatorRequest,
    elevator: Elevator,
    allRequests: ElevatorRequest[],
    config: SimulationConfig,
  ): SchedulingScore {
    let score = 0;
    let estimatedWaitTime = 0;
    let estimatedTravelTime = 0;
    const reasoning: string[] = [];

    // 1. Distance-based scoring (40% weight)
    const distanceScore = this.calculateDistanceScore(request, elevator);
    score += distanceScore * 0.4;
    reasoning.push(`Distance: ${distanceScore.toFixed(2)}`);

    // 2. Direction compatibility (25% weight)
    const directionScore = this.calculateDirectionScore(request, elevator);
    score += directionScore * 0.25;
    reasoning.push(`Direction: ${directionScore.toFixed(2)}`);

    // 3. Priority-based scoring (20% weight)
    const priorityScore = this.calculatePriorityScore(
      request,
      elevator,
      config,
    );
    score += priorityScore * 0.2;
    reasoning.push(`Priority: ${priorityScore.toFixed(2)}`);

    // 4. Load balancing (10% weight)
    const loadScore = this.calculateLoadScore(elevator);
    score += loadScore * 0.1;
    reasoning.push(`Load: ${loadScore.toFixed(2)}`);

    // 5. Traffic pattern optimization (5% weight)
    const trafficScore = this.calculateTrafficScore(request, elevator, config);
    score += trafficScore * 0.05;
    reasoning.push(`Traffic: ${trafficScore.toFixed(2)}`);

    // Calculate estimated times
    estimatedWaitTime = this.estimateWaitTime(request, elevator);
    estimatedTravelTime = this.estimateTravelTime(request, elevator);

    return {
      elevatorId: elevator.id,
      score,
      estimatedWaitTime,
      estimatedTravelTime,
      reasoning: reasoning.join(', '),
    };
  }

  private calculateDistanceScore(
    request: ElevatorRequest,
    elevator: Elevator,
  ): number {
    const distance = Math.abs(elevator.currentFloor - request.originFloor);

    // If elevator is idle, distance is the only factor
    if (elevator.direction === ElevatorDirection.IDLE) {
      return distance;
    }

    // If elevator is moving towards the request origin, reduce score
    if (this.isMovingTowards(elevator, request.originFloor)) {
      return distance * 0.5;
    }

    // If elevator is moving away, increase score
    return distance * 1.5;
  }

  private calculateDirectionScore(
    request: ElevatorRequest,
    elevator: Elevator,
  ): number {
    // If elevator is idle, it can serve any direction
    if (elevator.direction === ElevatorDirection.IDLE) {
      return 0;
    }

    // Check if elevator's current direction matches request direction
    if (
      elevator.direction === ElevatorDirection.UP &&
      request.direction === RequestDirection.UP
    ) {
      return 0; // Perfect match
    }

    if (
      elevator.direction === ElevatorDirection.DOWN &&
      request.direction === RequestDirection.DOWN
    ) {
      return 0; // Perfect match
    }

    // Direction mismatch - penalize heavily
    return 10;
  }

  private calculatePriorityScore(
    request: ElevatorRequest,
    elevator: Elevator,
    config: SimulationConfig,
  ): number {
    let score = 0;

    // Base priority from request
    score += (10 - request.priority) * 2;

    // Escalate priority for requests waiting > 30 seconds
    const waitTime = Date.now() - request.timestamp;
    if (waitTime > 30000) {
      score -= 5; // Reduce score (higher priority)
    }

    // Morning rush hour bias: prioritize lobby-to-upper-floor requests
    if (
      config.morningRushHour &&
      request.originFloor === 0 &&
      request.destinationFloor > 0
    ) {
      score -= 3;
    }

    // Peak traffic mode bias
    if (config.peakTrafficMode) {
      score -= 2;
    }

    return Math.max(0, score);
  }

  private calculateLoadScore(elevator: Elevator): number {
    const utilization = elevator.passengerCount / elevator.maxCapacity;
    return utilization * 5; // Penalize heavily loaded elevators
  }

  private calculateTrafficScore(
    request: ElevatorRequest,
    elevator: Elevator,
    config: SimulationConfig,
  ): number {
    let score = 0;

    // Keep elevators near high-traffic floors during predictable peaks
    if (config.morningRushHour) {
      // Prefer elevators closer to lobby (floor 0) for morning rush
      const distanceFromLobby = Math.abs(elevator.currentFloor - 0);
      score += distanceFromLobby * 0.5;
    }

    // Prefer elevators that are already serving similar routes
    const similarRequests = elevator.requests.filter(
      (r) =>
        r.originFloor === request.originFloor ||
        r.destinationFloor === request.destinationFloor,
    );

    if (similarRequests.length > 0) {
      score -= 2; // Reduce score for route efficiency
    }

    return score;
  }

  private isMovingTowards(elevator: Elevator, targetFloor: number): boolean {
    if (elevator.direction === ElevatorDirection.IDLE) {
      return false;
    }

    if (elevator.direction === ElevatorDirection.UP) {
      return elevator.currentFloor < targetFloor;
    } else {
      return elevator.currentFloor > targetFloor;
    }
  }

  private estimateWaitTime(
    request: ElevatorRequest,
    elevator: Elevator,
  ): number {
    const distance = Math.abs(elevator.currentFloor - request.originFloor);
    const floorTravelTime = 2000; // 2 seconds per floor
    const doorTime = 3000; // 3 seconds for doors

    let estimatedTime = distance * floorTravelTime + doorTime;

    // If elevator is moving away, add time to reverse direction
    if (
      !this.isMovingTowards(elevator, request.originFloor) &&
      elevator.direction !== ElevatorDirection.IDLE
    ) {
      estimatedTime += 5000; // 5 seconds penalty
    }

    return estimatedTime;
  }

  private estimateTravelTime(
    request: ElevatorRequest,
    elevator: Elevator,
  ): number {
    const distance = Math.abs(request.originFloor - request.destinationFloor);
    const floorTravelTime = 2000; // 2 seconds per floor
    const doorTime = 3000; // 3 seconds for doors

    return distance * floorTravelTime + doorTime;
  }

  /**
   * Optimize elevator routes using SCAN algorithm for multiple requests
   */
  optimizeElevatorRoute(
    elevator: Elevator,
    requests: ElevatorRequest[],
  ): number[] {
    const assignedRequests = requests.filter(
      (r) => r.assignedElevatorId === elevator.id,
    );

    if (assignedRequests.length === 0) {
      return [];
    }

    // Separate pickup and dropoff floors
    const pickupFloors = assignedRequests.map((r) => r.originFloor);
    const dropoffFloors = assignedRequests.map((r) => r.destinationFloor);
    const allFloors = [...new Set([...pickupFloors, ...dropoffFloors])];

    // Use SCAN algorithm to optimize route
    return this.scanAlgorithm(
      elevator.currentFloor,
      allFloors,
      elevator.direction,
    );
  }

  private scanAlgorithm(
    currentFloor: number,
    floors: number[],
    direction: ElevatorDirection,
  ): number[] {
    const sortedFloors = [...floors].sort((a, b) => a - b);
    const route: number[] = [];

    if (
      direction === ElevatorDirection.UP ||
      direction === ElevatorDirection.IDLE
    ) {
      // Go up first
      const floorsAbove = sortedFloors.filter((f) => f >= currentFloor);
      const floorsBelow = sortedFloors
        .filter((f) => f < currentFloor)
        .reverse();

      route.push(...floorsAbove, ...floorsBelow);
    } else {
      // Go down first
      const floorsBelow = sortedFloors
        .filter((f) => f <= currentFloor)
        .reverse();
      const floorsAbove = sortedFloors.filter((f) => f > currentFloor);

      route.push(...floorsBelow, ...floorsAbove);
    }

    return route;
  }

  /**
   * Predict demand and pre-position idle elevators
   */
  prePositionElevators(elevators: Elevator[], config: SimulationConfig): void {
    if (!config.morningRushHour && !config.peakTrafficMode) {
      return;
    }

    const idleElevators = elevators.filter(
      (e) => e.direction === ElevatorDirection.IDLE && e.doorState === 'closed',
    );

    idleElevators.forEach((elevator, index) => {
      if (config.morningRushHour) {
        // Pre-position elevators near lobby during morning rush
        if (elevator.currentFloor > 2) {
          elevator.targetFloor = 0;
        }
      } else if (config.peakTrafficMode) {
        // Distribute elevators across floors during peak traffic
        const targetFloor = Math.floor(
          (index / idleElevators.length) * (config.numberOfFloors - 1),
        );
        if (Math.abs(elevator.currentFloor - targetFloor) > 1) {
          elevator.targetFloor = targetFloor;
        }
      }
    });
  }
}
