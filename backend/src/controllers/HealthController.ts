import { Request, Response } from "express";
import { connectionManager, poolMonitor } from "../utils/pooling";

export default class HealthController {
  
  // Health check endpoint logic
  healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
      const isReady = connectionManager.isReady();
      const poolStats = connectionManager.getConnectionStats();
      
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          connected: isReady,
          pool: poolStats
        }
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Pool status endpoint logic
  getPoolStatus = (req: Request, res: Response): void => {
    try {
      const poolStatus = poolMonitor.getPoolStatus();
      res.json({
        status: 'ok',
        data: poolStatus,
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

  // Pool monitoring control logic
  controlPoolMonitoring = (req: Request, res: Response): void => {
    try {
      const { action } = req.params;
      const { interval } = req.body;

      if (action === 'start') {
        poolMonitor.startMonitoring(interval || 30000);
        res.json({
          status: 'ok',
          message: 'Pool monitoring started',
          interval: interval || 30000
        });
      } else if (action === 'stop') {
        poolMonitor.stopMonitoring();
        res.json({
          status: 'ok',
          message: 'Pool monitoring stopped'
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Invalid action. Use "start" or "stop"'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  };

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
