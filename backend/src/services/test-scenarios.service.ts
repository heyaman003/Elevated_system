import { Injectable } from '@nestjs/common';
import { ElevatorService } from './elevator.service';
import { ElevatorRequest, SimulationConfig } from '../types/elevator.types';

export interface TestScenario {
  name: string;
  description: string;
  config: Partial<SimulationConfig>;
  requests: Array<{
    originFloor: number;
    destinationFloor: number;
    delay: number; // milliseconds after start
  }>;
  duration: number; // milliseconds
}

@Injectable()
export class TestScenariosService {
  constructor(private elevatorService: ElevatorService) {}

  /**
   * Scenario 1: Normal Traffic
   * Simulates typical office building traffic with random requests
   */
  getNormalTrafficScenario(): TestScenario {
    return {
      name: 'Normal Traffic',
      description:
        'Simulates typical office building traffic with random requests',
      config: {
        numberOfElevators: 3,
        numberOfFloors: 10,
        requestFrequency: 0.5,
        simulationSpeed: 1,
        peakTrafficMode: false,
        morningRushHour: false,
      },
      requests: this.generateRandomRequests(20, 10),
      duration: 60000, // 1 minute
    };
  }

  /**
   * Scenario 2: Morning Rush Hour
   * Simulates heavy traffic from lobby to upper floors
   */
  getMorningRushHourScenario(): TestScenario {
    const requests: Array<{
      originFloor: number;
      destinationFloor: number;
      delay: number;
    }> = [];

    // Generate 30 requests with 70% from lobby (floor 0)
    for (let i = 0; i < 30; i++) {
      const isFromLobby = Math.random() < 0.7;
      const originFloor = isFromLobby ? 0 : Math.floor(Math.random() * 10);
      const destinationFloor = isFromLobby
        ? Math.floor(Math.random() * 9) + 1 // 1-9
        : Math.floor(Math.random() * 10);

      if (originFloor !== destinationFloor) {
        requests.push({
          originFloor,
          destinationFloor,
          delay: Math.random() * 30000, // Within 30 seconds
        });
      }
    }

    return {
      name: 'Morning Rush Hour',
      description:
        'Simulates heavy traffic from lobby to upper floors during morning rush',
      config: {
        numberOfElevators: 4,
        numberOfFloors: 10,
        requestFrequency: 1.5,
        simulationSpeed: 1,
        peakTrafficMode: true,
        morningRushHour: true,
      },
      requests,
      duration: 60000, // 1 minute
    };
  }

  /**
   * Scenario 3: Peak Traffic Stress Test
   * Simulates maximum load with 100+ simultaneous requests
   */
  getPeakTrafficStressTest(): TestScenario {
    const requests: Array<{
      originFloor: number;
      destinationFloor: number;
      delay: number;
    }> = [];

    // Generate 100 requests within first 10 seconds
    for (let i = 0; i < 100; i++) {
      const originFloor = Math.floor(Math.random() * 10);
      let destinationFloor = Math.floor(Math.random() * 10);

      // Ensure different floors
      while (destinationFloor === originFloor) {
        destinationFloor = Math.floor(Math.random() * 10);
      }

      requests.push({
        originFloor,
        destinationFloor,
        delay: Math.random() * 10000, // Within 10 seconds
      });
    }

    return {
      name: 'Peak Traffic Stress Test',
      description: 'Stress test with 100+ simultaneous requests',
      config: {
        numberOfElevators: 5,
        numberOfFloors: 10,
        requestFrequency: 2.0,
        simulationSpeed: 2,
        peakTrafficMode: true,
        morningRushHour: false,
      },
      requests,
      duration: 120000, // 2 minutes
    };
  }

  /**
   * Scenario 4: Evening Rush Hour
   * Simulates traffic from upper floors to lobby
   */
  getEveningRushHourScenario(): TestScenario {
    const requests: Array<{
      originFloor: number;
      destinationFloor: number;
      delay: number;
    }> = [];

    // Generate 25 requests with 80% going to lobby
    for (let i = 0; i < 25; i++) {
      const isToLobby = Math.random() < 0.8;
      const originFloor = isToLobby
        ? Math.floor(Math.random() * 9) + 1 // 1-9
        : Math.floor(Math.random() * 10);
      const destinationFloor = isToLobby ? 0 : Math.floor(Math.random() * 10);

      if (originFloor !== destinationFloor) {
        requests.push({
          originFloor,
          destinationFloor,
          delay: Math.random() * 45000, // Within 45 seconds
        });
      }
    }

    return {
      name: 'Evening Rush Hour',
      description:
        'Simulates traffic from upper floors to lobby during evening rush',
      config: {
        numberOfElevators: 4,
        numberOfFloors: 10,
        requestFrequency: 1.2,
        simulationSpeed: 1,
        peakTrafficMode: true,
        morningRushHour: false,
      },
      requests,
      duration: 90000, // 1.5 minutes
    };
  }

  /**
   * Scenario 5: Lunch Hour Traffic
   * Simulates bidirectional traffic between floors
   */
  getLunchHourScenario(): TestScenario {
    const requests: Array<{
      originFloor: number;
      destinationFloor: number;
      delay: number;
    }> = [];

    // Generate 40 requests with mixed patterns
    for (let i = 0; i < 40; i++) {
      const originFloor = Math.floor(Math.random() * 10);
      let destinationFloor = Math.floor(Math.random() * 10);

      // Ensure different floors
      while (destinationFloor === originFloor) {
        destinationFloor = Math.floor(Math.random() * 10);
      }

      requests.push({
        originFloor,
        destinationFloor,
        delay: Math.random() * 60000, // Within 1 minute
      });
    }

    return {
      name: 'Lunch Hour Traffic',
      description:
        'Simulates bidirectional traffic between floors during lunch hour',
      config: {
        numberOfElevators: 3,
        numberOfFloors: 10,
        requestFrequency: 0.8,
        simulationSpeed: 1,
        peakTrafficMode: false,
        morningRushHour: false,
      },
      requests,
      duration: 90000, // 1.5 minutes
    };
  }

  private generateRandomRequests(
    count: number,
    maxFloor: number,
  ): Array<{ originFloor: number; destinationFloor: number; delay: number }> {
    const requests: Array<{
      originFloor: number;
      destinationFloor: number;
      delay: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      const originFloor = Math.floor(Math.random() * maxFloor);
      let destinationFloor = Math.floor(Math.random() * maxFloor);

      // Ensure different floors
      while (destinationFloor === originFloor) {
        destinationFloor = Math.floor(Math.random() * maxFloor);
      }

      requests.push({
        originFloor,
        destinationFloor,
        delay: Math.random() * 60000, // Within 1 minute
      });
    }

    return requests;
  }

  /**
   * Run a test scenario
   */
  async runScenario(scenario: TestScenario): Promise<void> {
    console.log(`Starting scenario: ${scenario.name}`);
    console.log(`Description: ${scenario.description}`);

    // Reset system
    this.elevatorService.resetSystem();

    // Update configuration
    this.elevatorService.updateConfig(scenario.config);

    // Start simulation
    this.elevatorService.startSimulation();

    // Schedule requests
    scenario.requests.forEach((request, index) => {
      setTimeout(() => {
        this.elevatorService.addRequest(
          request.originFloor,
          request.destinationFloor,
        );
        console.log(
          `Added request ${index + 1}: Floor ${request.originFloor} → Floor ${request.destinationFloor}`,
        );
      }, request.delay);
    });

    // Stop simulation after duration
    setTimeout(() => {
      this.elevatorService.stopSimulation();
      console.log(`Scenario ${scenario.name} completed`);
    }, scenario.duration);
  }

  /**
   * Get all available test scenarios
   */
  getAllScenarios(): TestScenario[] {
    return [
      this.getNormalTrafficScenario(),
      this.getMorningRushHourScenario(),
      this.getPeakTrafficStressTest(),
      this.getEveningRushHourScenario(),
      this.getLunchHourScenario(),
    ];
  }

  /**
   * Run performance comparison between two scenarios
   */
  async runPerformanceComparison(
    scenario1: TestScenario,
    scenario2: TestScenario,
  ): Promise<{
    scenario1: { name: string; metrics: any };
    scenario2: { name: string; metrics: any };
  }> {
    console.log('Starting performance comparison...');

    // Run first scenario
    await this.runScenario(scenario1);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for completion
    const metrics1 = this.elevatorService.getSystemState().metrics;

    // Run second scenario
    await this.runScenario(scenario2);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for completion
    const metrics2 = this.elevatorService.getSystemState().metrics;

    return {
      scenario1: { name: scenario1.name, metrics: metrics1 },
      scenario2: { name: scenario2.name, metrics: metrics2 },
    };
  }
}
