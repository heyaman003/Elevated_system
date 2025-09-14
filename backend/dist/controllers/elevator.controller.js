"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevatorController = void 0;
const common_1 = require("@nestjs/common");
const elevator_service_1 = require("../services/elevator.service");
const test_scenarios_service_1 = require("../services/test-scenarios.service");
let ElevatorController = class ElevatorController {
    elevatorService;
    testScenariosService;
    constructor(elevatorService, testScenariosService) {
        this.elevatorService = elevatorService;
        this.testScenariosService = testScenariosService;
    }
    getSystemState() {
        return this.elevatorService.getSystemState();
    }
    startSimulation() {
        this.elevatorService.startSimulation();
        return { message: 'Simulation started' };
    }
    stopSimulation() {
        this.elevatorService.stopSimulation();
        return { message: 'Simulation stopped' };
    }
    resetSystem() {
        this.elevatorService.resetSystem();
        return { message: 'System reset' };
    }
    updateConfig(config) {
        this.elevatorService.updateConfig(config);
        return { message: 'Configuration updated' };
    }
    addRequest(body) {
        return this.elevatorService.addRequest(body.originFloor, body.destinationFloor);
    }
    getMetrics() {
        const state = this.elevatorService.getSystemState();
        return state.metrics;
    }
    getElevators() {
        const state = this.elevatorService.getSystemState();
        return state.elevators;
    }
    getFloors() {
        const state = this.elevatorService.getSystemState();
        return state.floors;
    }
    getRequests() {
        const state = this.elevatorService.getSystemState();
        return state.requests;
    }
    getTestScenarios() {
        return this.testScenariosService.getAllScenarios();
    }
    async runTestScenario(name) {
        const scenarios = this.testScenariosService.getAllScenarios();
        const scenario = scenarios.find((s) => s.name.toLowerCase().replace(/\s+/g, '-') === name);
        if (!scenario) {
            throw new Error(`Scenario '${name}' not found`);
        }
        await this.testScenariosService.runScenario(scenario);
        return { message: `Scenario '${scenario.name}' started` };
    }
};
exports.ElevatorController = ElevatorController;
__decorate([
    (0, common_1.Get)('state'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ElevatorController.prototype, "getSystemState", null);
__decorate([
    (0, common_1.Post)('start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ElevatorController.prototype, "startSimulation", null);
__decorate([
    (0, common_1.Post)('stop'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ElevatorController.prototype, "stopSimulation", null);
__decorate([
    (0, common_1.Post)('reset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], ElevatorController.prototype, "resetSystem", null);
__decorate([
    (0, common_1.Put)('config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ElevatorController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ElevatorController.prototype, "addRequest", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ElevatorController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('elevators'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ElevatorController.prototype, "getElevators", null);
__decorate([
    (0, common_1.Get)('floors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ElevatorController.prototype, "getFloors", null);
__decorate([
    (0, common_1.Get)('requests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ElevatorController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Get)('scenarios'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ElevatorController.prototype, "getTestScenarios", null);
__decorate([
    (0, common_1.Post)('scenarios/:name/run'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ElevatorController.prototype, "runTestScenario", null);
exports.ElevatorController = ElevatorController = __decorate([
    (0, common_1.Controller)('api/elevator'),
    __metadata("design:paramtypes", [elevator_service_1.ElevatorService,
        test_scenarios_service_1.TestScenariosService])
], ElevatorController);
//# sourceMappingURL=elevator.controller.js.map