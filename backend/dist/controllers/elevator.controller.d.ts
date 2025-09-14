import { ElevatorService } from '../services/elevator.service';
import { TestScenariosService } from '../services/test-scenarios.service';
import type { SimulationConfig, ElevatorSystemState, ElevatorRequest } from '../types/elevator.types';
export declare class ElevatorController {
    private readonly elevatorService;
    private readonly testScenariosService;
    constructor(elevatorService: ElevatorService, testScenariosService: TestScenariosService);
    getSystemState(): ElevatorSystemState;
    startSimulation(): {
        message: string;
    };
    stopSimulation(): {
        message: string;
    };
    resetSystem(): {
        message: string;
    };
    updateConfig(config: Partial<SimulationConfig>): {
        message: string;
    };
    addRequest(body: {
        originFloor: number;
        destinationFloor: number;
    }): ElevatorRequest;
    getMetrics(): import("../types/elevator.types").PerformanceMetrics;
    getElevators(): import("../types/elevator.types").Elevator[];
    getFloors(): import("../types/elevator.types").Floor[];
    getRequests(): ElevatorRequest[];
    getTestScenarios(): import("../services/test-scenarios.service").TestScenario[];
    runTestScenario(name: string): Promise<{
        message: string;
    }>;
}
