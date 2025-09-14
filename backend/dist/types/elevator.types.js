"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestDirection = exports.RequestType = exports.ElevatorDoorState = exports.ElevatorDirection = void 0;
var ElevatorDirection;
(function (ElevatorDirection) {
    ElevatorDirection["UP"] = "up";
    ElevatorDirection["DOWN"] = "down";
    ElevatorDirection["IDLE"] = "idle";
})(ElevatorDirection || (exports.ElevatorDirection = ElevatorDirection = {}));
var ElevatorDoorState;
(function (ElevatorDoorState) {
    ElevatorDoorState["OPEN"] = "open";
    ElevatorDoorState["CLOSED"] = "closed";
    ElevatorDoorState["OPENING"] = "opening";
    ElevatorDoorState["CLOSING"] = "closing";
})(ElevatorDoorState || (exports.ElevatorDoorState = ElevatorDoorState = {}));
var RequestType;
(function (RequestType) {
    RequestType["EXTERNAL"] = "external";
    RequestType["INTERNAL"] = "internal";
})(RequestType || (exports.RequestType = RequestType = {}));
var RequestDirection;
(function (RequestDirection) {
    RequestDirection["UP"] = "up";
    RequestDirection["DOWN"] = "down";
})(RequestDirection || (exports.RequestDirection = RequestDirection = {}));
//# sourceMappingURL=elevator.types.js.map