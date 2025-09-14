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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestScenariosService = void 0;
const common_1 = require("@nestjs/common");
const elevator_service_1 = require("./elevator.service");
let TestScenariosService = class TestScenariosService {
    elevatorService;
    constructor(elevatorService) {
        this.elevatorService = elevatorService;
    }
    getNormalTrafficScenario() {
        return {
            name: 'Normal Traffic',
            description: 'Simulates typical office building traffic with random requests',
            config: {
                numberOfElevators: 3,
                numberOfFloors: 10,
                requestFrequency: 0.5,
                simulationSpeed: 1,
                peakTrafficMode: false,
                morningRushHour: false,
            },
            requests: this.generateRandomRequests(20, 10),
            duration: 60000,
        };
    }
    getMorningRushHourScenario() {
        const requests = [];
        for (let i = 0; i < 30; i++) {
            const isFromLobby = Math.random() < 0.7;
            const originFloor = isFromLobby ? 0 : Math.floor(Math.random() * 10);
            const destinationFloor = isFromLobby
                ? Math.floor(Math.random() * 9) + 1
                : Math.floor(Math.random() * 10);
            if (originFloor !== destinationFloor) {
                requests.push({
                    originFloor,
                    destinationFloor,
                    delay: Math.random() * 30000,
                });
            }
        }
        return {
            name: 'Morning Rush Hour',
            description: 'Simulates heavy traffic from lobby to upper floors during morning rush',
            config: {
                numberOfElevators: 4,
                numberOfFloors: 10,
                requestFrequency: 1.5,
                simulationSpeed: 1,
                peakTrafficMode: true,
                morningRushHour: true,
            },
            requests,
            duration: 60000,
        };
    }
    getPeakTrafficStressTest() {
        const requests = [];
        for (let i = 0; i < 100; i++) {
            const originFloor = Math.floor(Math.random() * 10);
            let destinationFloor = Math.floor(Math.random() * 10);
            while (destinationFloor === originFloor) {
                destinationFloor = Math.floor(Math.random() * 10);
            }
            requests.push({
                originFloor,
                destinationFloor,
                delay: Math.random() * 10000,
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
            duration: 120000,
        };
    }
    getEveningRushHourScenario() {
        const requests = [];
        for (let i = 0; i < 25; i++) {
            const isToLobby = Math.random() < 0.8;
            const originFloor = isToLobby
                ? Math.floor(Math.random() * 9) + 1
                : Math.floor(Math.random() * 10);
            const destinationFloor = isToLobby ? 0 : Math.floor(Math.random() * 10);
            if (originFloor !== destinationFloor) {
                requests.push({
                    originFloor,
                    destinationFloor,
                    delay: Math.random() * 45000,
                });
            }
        }
        return {
            name: 'Evening Rush Hour',
            description: 'Simulates traffic from upper floors to lobby during evening rush',
            config: {
                numberOfElevators: 4,
                numberOfFloors: 10,
                requestFrequency: 1.2,
                simulationSpeed: 1,
                peakTrafficMode: true,
                morningRushHour: false,
            },
            requests,
            duration: 90000,
        };
    }
    getLunchHourScenario() {
        const requests = [];
        for (let i = 0; i < 40; i++) {
            const originFloor = Math.floor(Math.random() * 10);
            let destinationFloor = Math.floor(Math.random() * 10);
            while (destinationFloor === originFloor) {
                destinationFloor = Math.floor(Math.random() * 10);
            }
            requests.push({
                originFloor,
                destinationFloor,
                delay: Math.random() * 60000,
            });
        }
        return {
            name: 'Lunch Hour Traffic',
            description: 'Simulates bidirectional traffic between floors during lunch hour',
            config: {
                numberOfElevators: 3,
                numberOfFloors: 10,
                requestFrequency: 0.8,
                simulationSpeed: 1,
                peakTrafficMode: false,
                morningRushHour: false,
            },
            requests,
            duration: 90000,
        };
    }
    generateRandomRequests(count, maxFloor) {
        const requests = [];
        for (let i = 0; i < count; i++) {
            const originFloor = Math.floor(Math.random() * maxFloor);
            let destinationFloor = Math.floor(Math.random() * maxFloor);
            while (destinationFloor === originFloor) {
                destinationFloor = Math.floor(Math.random() * maxFloor);
            }
            requests.push({
                originFloor,
                destinationFloor,
                delay: Math.random() * 60000,
            });
        }
        return requests;
    }
    async runScenario(scenario) {
        console.log(`Starting scenario: ${scenario.name}`);
        console.log(`Description: ${scenario.description}`);
        this.elevatorService.resetSystem();
        this.elevatorService.updateConfig(scenario.config);
        this.elevatorService.startSimulation();
        scenario.requests.forEach((request, index) => {
            setTimeout(() => {
                this.elevatorService.addRequest(request.originFloor, request.destinationFloor);
                console.log(`Added request ${index + 1}: Floor ${request.originFloor} → Floor ${request.destinationFloor}`);
            }, request.delay);
        });
        setTimeout(() => {
            this.elevatorService.stopSimulation();
            console.log(`Scenario ${scenario.name} completed`);
        }, scenario.duration);
    }
    getAllScenarios() {
        return [
            this.getNormalTrafficScenario(),
            this.getMorningRushHourScenario(),
            this.getPeakTrafficStressTest(),
            this.getEveningRushHourScenario(),
            this.getLunchHourScenario(),
        ];
    }
    async runPerformanceComparison(scenario1, scenario2) {
        console.log('Starting performance comparison...');
        await this.runScenario(scenario1);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const metrics1 = this.elevatorService.getSystemState().metrics;
        await this.runScenario(scenario2);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const metrics2 = this.elevatorService.getSystemState().metrics;
        return {
            scenario1: { name: scenario1.name, metrics: metrics1 },
            scenario2: { name: scenario2.name, metrics: metrics2 },
        };
    }
};
exports.TestScenariosService = TestScenariosService;
exports.TestScenariosService = TestScenariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elevator_service_1.ElevatorService])
], TestScenariosService);
//# sourceMappingURL=test-scenarios.service.js.map