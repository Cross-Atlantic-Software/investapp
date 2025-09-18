import { Request, Response } from "express";
import { connectionManager, poolMonitor } from "../../utils/pooling";

export class SystemInfoService {

  // Get detailed system information
  getSystemInfo = (req: Request, res: Response): void => {
    try {
      const poolStats = connectionManager.getConnectionStats();
      const isMonitoring = poolMonitor.isActive();
      
      res.json({
        status: 'ok',
        data: {
          database: {
            connected: connectionManager.isReady(),
            pool: poolStats
          },
          monitoring: {
            active: isMonitoring
          },
          server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Database connection test
  testDatabaseConnection = async (req: Request, res: Response): Promise<void> => {
    try {
      const isReady = connectionManager.isReady();
      
      if (isReady) {
        res.json({
          status: 'ok',
          message: 'Database connection is healthy',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'error',
          message: 'Database connection is not ready',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
}
