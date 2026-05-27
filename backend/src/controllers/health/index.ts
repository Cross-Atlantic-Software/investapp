import { HealthCheckService } from './healthCheck';
import { PoolStatusService } from './poolStatus';
import { SystemInfoService } from './systemInfo';

// Create instances of all services
const healthCheckService = new HealthCheckService();
const poolStatusService = new PoolStatusService();
const systemInfoService = new SystemInfoService();

// Export the main HealthController class that combines all services
export default class HealthController {
  // Health check related methods
  healthCheck = healthCheckService.healthCheck;
  
  // Pool status related methods
  getPoolStatus = poolStatusService.getPoolStatus;
  controlPoolMonitoring = poolStatusService.controlPoolMonitoring;
  
  // System info related methods
  getSystemInfo = systemInfoService.getSystemInfo;
  testDatabaseConnection = systemInfoService.testDatabaseConnection;
}

// Also export individual services for direct use if needed
export {
  HealthCheckService,
  PoolStatusService,
  SystemInfoService,
  healthCheckService,
  poolStatusService,
  systemInfoService
};
