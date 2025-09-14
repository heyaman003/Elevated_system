export declare enum ElevatorDirection {
    UP = "up",
    DOWN = "down",
    IDLE = "idle"
}
export declare enum ElevatorDoorState {
    OPEN = "open",
    CLOSED = "closed",
    OPENING = "opening",
    CLOSING = "closing"
}
export declare enum RequestType {
    EXTERNAL = "external",
    INTERNAL = "internal"
}
export declare enum RequestDirection {
    UP = "up",
    DOWN = "down"
}
export interface Elevator {
    id: string;
    currentFloor: number;
    targetFloor: number | null;
    direction: ElevatorDirection;
    doorState: ElevatorDoorState;
    passengerCount: number;
    maxCapacity: number;
    isMoving: boolean;
    requests: ElevatorRequest[];
    lastUpdateTime: number;
}
export interface ElevatorRequest {
    id: string;
    type: RequestType;
    originFloor: number;
    destinationFloor: number;
    direction: RequestDirection | null;
    timestamp: number;
    priority: number;
    assignedElevatorId: string | null;
    status: 'pending' | 'assigned' | 'picked_up' | 'completed';
    waitTime: number;
    travelTime: number;
}
export interface Floor {
    number: number;
    upRequest: boolean;
    downRequest: boolean;
    waitingPassengers: number;
}
export interface SimulationConfig {
    numberOfElevators: number;
    numberOfFloors: number;
    requestFrequency: number;
    simulationSpeed: number;
    isRunning: boolean;
    peakTrafficMode: boolean;
    morningRushHour: boolean;
}
export interface PerformanceMetrics {
    averageWaitTime: number;
    maxWaitTime: number;
    averageTravelTime: number;
    elevatorUtilization: number[];
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    timestamp: number;
}
export interface ElevatorSystemState {
    elevators: Elevator[];
    floors: Floor[];
    requests: ElevatorRequest[];
    config: SimulationConfig;
    metrics: PerformanceMetrics;
    isRunning: boolean;
}
