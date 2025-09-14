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
exports.ElevatorService = void 0;
const common_1 = require("@nestjs/common");
const elevator_types_1 = require("../types/elevator.types");
const scheduler_service_1 = require("./scheduler.service");
let ElevatorService = class ElevatorService {
    schedulerService;
    elevators = [];
    floors = [];
    requests = [];
    config;
    metrics;
    isRunning = false;
    simulationInterval = null;
    constructor(schedulerService) {
        this.schedulerService = schedulerService;
        this.initializeSystem();
    }
    initializeSystem() {
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
    resetSystem() {
        this.elevators = [];
        this.floors = [];
        this.requests = [];
        this.isRunning = false;
        for (let i = 0; i < this.config.numberOfElevators; i++) {
            this.elevators.push({
                id: `elevator-${i}`,
                currentFloor: 0,
                targetFloor: null,
                direction: elevator_types_1.ElevatorDirection.IDLE,
                doorState: elevator_types_1.ElevatorDoorState.CLOSED,
                passengerCount: 0,
                maxCapacity: 8,
                isMoving: false,
                requests: [],
                lastUpdateTime: Date.now(),
            });
        }
        for (let i = 0; i < this.config.numberOfFloors; i++) {
            this.floors.push({
                number: i,
                upRequest: false,
                downRequest: false,
                waitingPassengers: 0,
            });
        }
        this.metrics.elevatorUtilization = new Array(this.config.numberOfElevators).fill(0);
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (newConfig.numberOfElevators || newConfig.numberOfFloors) {
            this.resetSystem();
        }
    }
    startSimulation() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.config.isRunning = true;
        this.simulationInterval = setInterval(() => {
            this.updateSimulation();
        }, 1000 / this.config.simulationSpeed);
    }
    stopSimulation() {
        this.isRunning = false;
        this.config.isRunning = false;
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }
    updateSimulation() {
        this.generateRandomRequests();
        this.updateElevators();
        this.updateMetrics();
    }
    generateRandomRequests() {
        const shouldGenerateRequest = Math.random() < this.config.requestFrequency;
        if (shouldGenerateRequest) {
            this.generateRandomRequest();
        }
    }
    generateRandomRequest() {
        const originFloor = Math.floor(Math.random() * this.config.numberOfFloors);
        let destinationFloor;
        do {
            destinationFloor = Math.floor(Math.random() * this.config.numberOfFloors);
        } while (destinationFloor === originFloor);
        const request = {
            id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: elevator_types_1.RequestType.EXTERNAL,
            originFloor,
            destinationFloor,
            direction: destinationFloor > originFloor
                ? elevator_types_1.RequestDirection.UP
                : elevator_types_1.RequestDirection.DOWN,
            timestamp: Date.now(),
            priority: this.calculateRequestPriority(originFloor, destinationFloor),
            assignedElevatorId: null,
            status: 'pending',
            waitTime: 0,
            travelTime: 0,
        };
        this.requests.push(request);
        this.metrics.totalRequests++;
        if (request.direction === elevator_types_1.RequestDirection.UP) {
            this.floors[originFloor].upRequest = true;
        }
        else {
            this.floors[originFloor].downRequest = true;
        }
        this.floors[originFloor].waitingPassengers++;
    }
    calculateRequestPriority(originFloor, destinationFloor) {
        let priority = 1;
        if (this.config.morningRushHour &&
            originFloor === 0 &&
            destinationFloor > 0) {
            priority += 2;
        }
        if (this.config.peakTrafficMode) {
            priority += 1;
        }
        return priority;
    }
    updateElevators() {
        this.elevators.forEach((elevator) => {
            this.updateElevatorState(elevator);
        });
    }
    updateElevatorState(elevator) {
        const now = Date.now();
        elevator.lastUpdateTime = now;
        this.updateDoorState(elevator);
        if (elevator.doorState === elevator_types_1.ElevatorDoorState.CLOSED &&
            elevator.targetFloor !== null) {
            this.moveElevator(elevator);
        }
        this.assignRequestsToElevator(elevator);
    }
    updateDoorState(elevator) {
        const doorOpenTime = 3000;
        switch (elevator.doorState) {
            case elevator_types_1.ElevatorDoorState.OPENING:
                elevator.doorState = elevator_types_1.ElevatorDoorState.OPEN;
                setTimeout(() => {
                    if (elevator.doorState === elevator_types_1.ElevatorDoorState.OPEN) {
                        elevator.doorState = elevator_types_1.ElevatorDoorState.CLOSING;
                    }
                }, doorOpenTime);
                break;
            case elevator_types_1.ElevatorDoorState.CLOSING:
                elevator.doorState = elevator_types_1.ElevatorDoorState.CLOSED;
                break;
        }
    }
    moveElevator(elevator) {
        if (elevator.targetFloor === null)
            return;
        if (elevator.currentFloor < elevator.targetFloor) {
            elevator.direction = elevator_types_1.ElevatorDirection.UP;
            elevator.isMoving = true;
            if (Math.random() < 0.1) {
                elevator.currentFloor++;
                if (elevator.currentFloor >= elevator.targetFloor) {
                    elevator.currentFloor = elevator.targetFloor;
                    elevator.targetFloor = null;
                    elevator.direction = elevator_types_1.ElevatorDirection.IDLE;
                    elevator.isMoving = false;
                    elevator.doorState = elevator_types_1.ElevatorDoorState.OPENING;
                    this.handleElevatorArrival(elevator);
                }
            }
        }
        else if (elevator.currentFloor > elevator.targetFloor) {
            elevator.direction = elevator_types_1.ElevatorDirection.DOWN;
            elevator.isMoving = true;
            if (Math.random() < 0.1) {
                elevator.currentFloor--;
                if (elevator.currentFloor <= elevator.targetFloor) {
                    elevator.currentFloor = elevator.targetFloor;
                    elevator.targetFloor = null;
                    elevator.direction = elevator_types_1.ElevatorDirection.IDLE;
                    elevator.isMoving = false;
                    elevator.doorState = elevator_types_1.ElevatorDoorState.OPENING;
                    this.handleElevatorArrival(elevator);
                }
            }
        }
    }
    handleElevatorArrival(elevator) {
        const floor = this.floors[elevator.currentFloor];
        floor.upRequest = false;
        floor.downRequest = false;
        floor.waitingPassengers = 0;
        this.requests.forEach((request) => {
            if (request.assignedElevatorId === elevator.id &&
                request.originFloor === elevator.currentFloor) {
                request.status = 'picked_up';
                elevator.passengerCount++;
            }
            if (request.assignedElevatorId === elevator.id &&
                request.destinationFloor === elevator.currentFloor &&
                request.status === 'picked_up') {
                request.status = 'completed';
                request.travelTime = Date.now() - request.timestamp - request.waitTime;
                elevator.passengerCount--;
                this.metrics.completedRequests++;
            }
        });
    }
    assignRequestsToElevator(elevator) {
        if (elevator.targetFloor !== null ||
            elevator.doorState !== elevator_types_1.ElevatorDoorState.CLOSED) {
            return;
        }
        const pendingRequests = this.requests.filter((r) => r.status === 'pending' && r.assignedElevatorId === null);
        if (pendingRequests.length === 0)
            return;
        let bestRequest = null;
        let bestScore = Infinity;
        for (const request of pendingRequests) {
            const assignedElevatorId = this.schedulerService.assignRequestToElevator(request, [elevator], this.requests, this.config);
            if (assignedElevatorId === elevator.id) {
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
    updateMetrics() {
        const now = Date.now();
        this.requests.forEach((request) => {
            if (request.status === 'pending' || request.status === 'assigned') {
                request.waitTime = now - request.timestamp;
            }
        });
        const pendingRequests = this.requests.filter((r) => r.status === 'pending' || r.status === 'assigned');
        if (pendingRequests.length > 0) {
            this.metrics.averageWaitTime =
                pendingRequests.reduce((sum, r) => sum + r.waitTime, 0) /
                    pendingRequests.length;
            this.metrics.maxWaitTime = Math.max(...pendingRequests.map((r) => r.waitTime));
        }
        const completedRequests = this.requests.filter((r) => r.status === 'completed');
        if (completedRequests.length > 0) {
            this.metrics.averageTravelTime =
                completedRequests.reduce((sum, r) => sum + r.travelTime, 0) /
                    completedRequests.length;
        }
        this.metrics.pendingRequests = pendingRequests.length;
        this.metrics.timestamp = now;
        this.elevators.forEach((elevator, index) => {
            this.metrics.elevatorUtilization[index] = elevator.isMoving ? 1 : 0;
        });
    }
    getSystemState() {
        return {
            elevators: [...this.elevators],
            floors: [...this.floors],
            requests: [...this.requests],
            config: { ...this.config },
            metrics: { ...this.metrics },
            isRunning: this.isRunning,
        };
    }
    addRequest(originFloor, destinationFloor) {
        const request = {
            id: `request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: elevator_types_1.RequestType.EXTERNAL,
            originFloor,
            destinationFloor,
            direction: destinationFloor > originFloor
                ? elevator_types_1.RequestDirection.UP
                : elevator_types_1.RequestDirection.DOWN,
            timestamp: Date.now(),
            priority: this.calculateRequestPriority(originFloor, destinationFloor),
            assignedElevatorId: null,
            status: 'pending',
            waitTime: 0,
            travelTime: 0,
        };
        this.requests.push(request);
        this.metrics.totalRequests++;
        if (request.direction === elevator_types_1.RequestDirection.UP) {
            this.floors[originFloor].upRequest = true;
        }
        else {
            this.floors[originFloor].downRequest = true;
        }
        this.floors[originFloor].waitingPassengers++;
        return request;
    }
};
exports.ElevatorService = ElevatorService;
exports.ElevatorService = ElevatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scheduler_service_1.SchedulerService])
], ElevatorService);
//# sourceMappingURL=elevator.service.js.map