import { ElevatorService } from './elevator.service';
import { SimulationConfig } from '../types/elevator.types';
export interface TestScenario {
    name: string;
    description: string;
    config: Partial<SimulationConfig>;
    requests: Array<{
        originFloor: number;
        destinationFloor: number;
        delay: number;
    }>;
    duration: number;
}
export declare class TestScenariosService {
    private elevatorService;
    constructor(elevatorService: ElevatorService);
    getNormalTrafficScenario(): TestScenario;
    getMorningRushHourScenario(): TestScenario;
    getPeakTrafficStressTest(): TestScenario;
    getEveningRushHourScenario(): TestScenario;
    getLunchHourScenario(): TestScenario;
    private generateRandomRequests;
    runScenario(scenario: TestScenario): Promise<void>;
    getAllScenarios(): TestScenario[];
    runPerformanceComparison(scenario1: TestScenario, scenario2: TestScenario): Promise<{
        scenario1: {
            name: string;
            metrics: any;
        };
        scenario2: {
            name: string;
            metrics: any;
        };
    }>;
}
