import express from "express";
import HealthController from "../controllers/health";

const healthRouter = express.Router();
const healthController = new HealthController();

// Health check endpoint
healthRouter.get('/health', healthController.healthCheck);

// Pool status endpoint
healthRouter.get('/pool-status', healthController.getPoolStatus);

// Start/stop pool monitoring
healthRouter.post('/pool-monitoring/:action', healthController.controlPoolMonitoring);

// System information endpoint
healthRouter.get('/system-info', healthController.getSystemInfo);

// Database connection test
healthRouter.get('/test-db', healthController.testDatabaseConnection);

export default healthRouter;
