import { Request, Response } from "express";
import { poolMonitor } from "../../utils/pooling";

export class PoolStatusService {

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
}
