import connectionManager from "./connectionManager";

// Pool monitoring utility
export class PoolMonitor {
  private static instance: PoolMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;

  private constructor() {}

  public static getInstance(): PoolMonitor {
    if (!PoolMonitor.instance) {
      PoolMonitor.instance = new PoolMonitor();
    }
    return PoolMonitor.instance;
  }

  // Start monitoring
  public startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.log('Pool monitoring already active');
      return;
    }

    this.monitoringInterval = setInterval(() => {
      this.logPoolStats();
    }, intervalMs);

    this.isMonitoring = true;
    console.log(`📊 Pool monitoring started (interval: ${intervalMs}ms)`);
  }

  // Stop monitoring
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('📊 Pool monitoring stopped');
  }

  // Log pool statistics
  private logPoolStats(): void {
    try {
      const stats = connectionManager.getConnectionStats();
      const { pool } = stats;
      
      console.log('📊 Pool Stats:', {
        size: pool.size,
        used: pool.used,
        pending: pool.pending,
        available: pool.available,
        utilization: `${Math.round((pool.used / pool.size) * 100)}%`
      });

      // Warn if pool is getting full
      if (pool.used / pool.size > 0.8) {
        console.warn('⚠️ Connection pool utilization is high:', `${Math.round((pool.used / pool.size) * 100)}%`);
      }

    } catch (error) {
      console.error('Error getting pool stats:', error);
    }
  }

  // Get current pool status
  public getPoolStatus(): any {
    try {
      return connectionManager.getConnectionStats();
    } catch (error) {
      return { error: 'Failed to get pool status', details: error };
    }
  }

  // Check if monitoring is active
  public isActive(): boolean {
    return this.isMonitoring;
  }
}

// Export singleton instance
export const poolMonitor = PoolMonitor.getInstance();

export default poolMonitor;
