import { Request, Response } from "express";
import { connectionManager } from "../../utils/pooling";

export class HealthCheckService {
  
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
}
