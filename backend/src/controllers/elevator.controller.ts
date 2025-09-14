import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ElevatorService } from '../services/elevator.service';
import { TestScenariosService } from '../services/test-scenarios.service';
import type {
  SimulationConfig,
  ElevatorSystemState,
  ElevatorRequest,
} from '../types/elevator.types';

@Controller('api/elevator')
export class ElevatorController {
  constructor(
    private readonly elevatorService: ElevatorService,
    private readonly testScenariosService: TestScenariosService,
  ) {}

  @Get('state')
  getSystemState(): ElevatorSystemState {
    return this.elevatorService.getSystemState();
  }

  @Post('start')
  startSimulation(): { message: string } {
    this.elevatorService.startSimulation();
    return { message: 'Simulation started' };
  }

  @Post('stop')
  stopSimulation(): { message: string } {
    this.elevatorService.stopSimulation();
    return { message: 'Simulation stopped' };
  }

  @Post('reset')
  resetSystem(): { message: string } {
    this.elevatorService.resetSystem();
    return { message: 'System reset' };
  }

  @Put('config')
  updateConfig(@Body() config: Partial<SimulationConfig>): { message: string } {
    this.elevatorService.updateConfig(config);
    return { message: 'Configuration updated' };
  }

  @Post('request')
  addRequest(
    @Body() body: { originFloor: number; destinationFloor: number },
  ): ElevatorRequest {
    return this.elevatorService.addRequest(
      body.originFloor,
      body.destinationFloor,
    );
  }

  @Get('metrics')
  getMetrics() {
    const state = this.elevatorService.getSystemState();
    return state.metrics;
  }

  @Get('elevators')
  getElevators() {
    const state = this.elevatorService.getSystemState();
    return state.elevators;
  }

  @Get('floors')
  getFloors() {
    const state = this.elevatorService.getSystemState();
    return state.floors;
  }

  @Get('requests')
  getRequests() {
    const state = this.elevatorService.getSystemState();
    return state.requests;
  }

  @Get('scenarios')
  getTestScenarios() {
    return this.testScenariosService.getAllScenarios();
  }

  @Post('scenarios/:name/run')
  async runTestScenario(@Param('name') name: string) {
    const scenarios = this.testScenariosService.getAllScenarios();
    const scenario = scenarios.find(
      (s) => s.name.toLowerCase().replace(/\s+/g, '-') === name,
    );

    if (!scenario) {
      throw new Error(`Scenario '${name}' not found`);
    }

    await this.testScenariosService.runScenario(scenario);
    return { message: `Scenario '${scenario.name}' started` };
  }
}
