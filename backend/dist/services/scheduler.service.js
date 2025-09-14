"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const elevator_types_1 = require("../types/elevator.types");
let SchedulerService = class SchedulerService {
    assignRequestToElevator(request, elevators, allRequests, config) {
        const availableElevators = elevators.filter((e) => e.doorState === 'closed' && e.passengerCount < e.maxCapacity);
        if (availableElevators.length === 0) {
            return null;
        }
        const scores = availableElevators.map((elevator) => {
            return this.calculateElevatorScore(request, elevator, allRequests, config);
        });
        scores.sort((a, b) => a.score - b.score);
        const bestElevator = scores[0];
        console.log(`Assigning request ${request.id} to ${bestElevator.elevatorId}: ${bestElevator.reasoning}`);
        return bestElevator.elevatorId;
    }
    calculateElevatorScore(request, elevator, allRequests, config) {
        let score = 0;
        let estimatedWaitTime = 0;
        let estimatedTravelTime = 0;
        const reasoning = [];
        const distanceScore = this.calculateDistanceScore(request, elevator);
        score += distanceScore * 0.4;
        reasoning.push(`Distance: ${distanceScore.toFixed(2)}`);
        const directionScore = this.calculateDirectionScore(request, elevator);
        score += directionScore * 0.25;
        reasoning.push(`Direction: ${directionScore.toFixed(2)}`);
        const priorityScore = this.calculatePriorityScore(request, elevator, config);
        score += priorityScore * 0.2;
        reasoning.push(`Priority: ${priorityScore.toFixed(2)}`);
        const loadScore = this.calculateLoadScore(elevator);
        score += loadScore * 0.1;
        reasoning.push(`Load: ${loadScore.toFixed(2)}`);
        const trafficScore = this.calculateTrafficScore(request, elevator, config);
        score += trafficScore * 0.05;
        reasoning.push(`Traffic: ${trafficScore.toFixed(2)}`);
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
    calculateDistanceScore(request, elevator) {
        const distance = Math.abs(elevator.currentFloor - request.originFloor);
        if (elevator.direction === elevator_types_1.ElevatorDirection.IDLE) {
            return distance;
        }
        if (this.isMovingTowards(elevator, request.originFloor)) {
            return distance * 0.5;
        }
        return distance * 1.5;
    }
    calculateDirectionScore(request, elevator) {
        if (elevator.direction === elevator_types_1.ElevatorDirection.IDLE) {
            return 0;
        }
        if (elevator.direction === elevator_types_1.ElevatorDirection.UP &&
            request.direction === elevator_types_1.RequestDirection.UP) {
            return 0;
        }
        if (elevator.direction === elevator_types_1.ElevatorDirection.DOWN &&
            request.direction === elevator_types_1.RequestDirection.DOWN) {
            return 0;
        }
        return 10;
    }
    calculatePriorityScore(request, elevator, config) {
        let score = 0;
        score += (10 - request.priority) * 2;
        const waitTime = Date.now() - request.timestamp;
        if (waitTime > 30000) {
            score -= 5;
        }
        if (config.morningRushHour &&
            request.originFloor === 0 &&
            request.destinationFloor > 0) {
            score -= 3;
        }
        if (config.peakTrafficMode) {
            score -= 2;
        }
        return Math.max(0, score);
    }
    calculateLoadScore(elevator) {
        const utilization = elevator.passengerCount / elevator.maxCapacity;
        return utilization * 5;
    }
    calculateTrafficScore(request, elevator, config) {
        let score = 0;
        if (config.morningRushHour) {
            const distanceFromLobby = Math.abs(elevator.currentFloor - 0);
            score += distanceFromLobby * 0.5;
        }
        const similarRequests = elevator.requests.filter((r) => r.originFloor === request.originFloor ||
            r.destinationFloor === request.destinationFloor);
        if (similarRequests.length > 0) {
            score -= 2;
        }
        return score;
    }
    isMovingTowards(elevator, targetFloor) {
        if (elevator.direction === elevator_types_1.ElevatorDirection.IDLE) {
            return false;
        }
        if (elevator.direction === elevator_types_1.ElevatorDirection.UP) {
            return elevator.currentFloor < targetFloor;
        }
        else {
            return elevator.currentFloor > targetFloor;
        }
    }
    estimateWaitTime(request, elevator) {
        const distance = Math.abs(elevator.currentFloor - request.originFloor);
        const floorTravelTime = 2000;
        const doorTime = 3000;
        let estimatedTime = distance * floorTravelTime + doorTime;
        if (!this.isMovingTowards(elevator, request.originFloor) &&
            elevator.direction !== elevator_types_1.ElevatorDirection.IDLE) {
            estimatedTime += 5000;
        }
        return estimatedTime;
    }
    estimateTravelTime(request, elevator) {
        const distance = Math.abs(request.originFloor - request.destinationFloor);
        const floorTravelTime = 2000;
        const doorTime = 3000;
        return distance * floorTravelTime + doorTime;
    }
    optimizeElevatorRoute(elevator, requests) {
        const assignedRequests = requests.filter((r) => r.assignedElevatorId === elevator.id);
        if (assignedRequests.length === 0) {
            return [];
        }
        const pickupFloors = assignedRequests.map((r) => r.originFloor);
        const dropoffFloors = assignedRequests.map((r) => r.destinationFloor);
        const allFloors = [...new Set([...pickupFloors, ...dropoffFloors])];
        return this.scanAlgorithm(elevator.currentFloor, allFloors, elevator.direction);
    }
    scanAlgorithm(currentFloor, floors, direction) {
        const sortedFloors = [...floors].sort((a, b) => a - b);
        const route = [];
        if (direction === elevator_types_1.ElevatorDirection.UP ||
            direction === elevator_types_1.ElevatorDirection.IDLE) {
            const floorsAbove = sortedFloors.filter((f) => f >= currentFloor);
            const floorsBelow = sortedFloors
                .filter((f) => f < currentFloor)
                .reverse();
            route.push(...floorsAbove, ...floorsBelow);
        }
        else {
            const floorsBelow = sortedFloors
                .filter((f) => f <= currentFloor)
                .reverse();
            const floorsAbove = sortedFloors.filter((f) => f > currentFloor);
            route.push(...floorsBelow, ...floorsAbove);
        }
        return route;
    }
    prePositionElevators(elevators, config) {
        if (!config.morningRushHour && !config.peakTrafficMode) {
            return;
        }
        const idleElevators = elevators.filter((e) => e.direction === elevator_types_1.ElevatorDirection.IDLE && e.doorState === 'closed');
        idleElevators.forEach((elevator, index) => {
            if (config.morningRushHour) {
                if (elevator.currentFloor > 2) {
                    elevator.targetFloor = 0;
                }
            }
            else if (config.peakTrafficMode) {
                const targetFloor = Math.floor((index / idleElevators.length) * (config.numberOfFloors - 1));
                if (Math.abs(elevator.currentFloor - targetFloor) > 1) {
                    elevator.targetFloor = targetFloor;
                }
            }
        });
    }
};
exports.SchedulerService = SchedulerService;
exports.SchedulerService = SchedulerService = __decorate([
    (0, common_1.Injectable)()
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map