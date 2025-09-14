import { Elevator, ElevatorRequest, SimulationConfig } from '../types/elevator.types';
export declare class SchedulerService {
    assignRequestToElevator(request: ElevatorRequest, elevators: Elevator[], allRequests: ElevatorRequest[], config: SimulationConfig): string | null;
    private calculateElevatorScore;
    private calculateDistanceScore;
    private calculateDirectionScore;
    private calculatePriorityScore;
    private calculateLoadScore;
    private calculateTrafficScore;
    private isMovingTowards;
    private estimateWaitTime;
    private estimateTravelTime;
    optimizeElevatorRoute(elevator: Elevator, requests: ElevatorRequest[]): number[];
    private scanAlgorithm;
    prePositionElevators(elevators: Elevator[], config: SimulationConfig): void;
}
