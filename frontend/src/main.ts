import "./style.css";
import { ElevatorSimulationApp } from "./app";

// Initialize the elevator simulation app
const app = new ElevatorSimulationApp();

// Handle page unload
window.addEventListener("beforeunload", () => {
  app.destroy();
});
