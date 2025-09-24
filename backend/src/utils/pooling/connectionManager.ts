import { Sequelize } from "sequelize";
import { 
  createSequelizeWithPool, 
  createMySQLPool, 
  checkConnectionHealth, 
  getPoolStats
} from "./connectionPool";

// Connection Manager Class
export class ConnectionManager {
  private static instance: ConnectionManager;
  private sequelize: Sequelize | null = null;
  private mysqlPool: any = null;
  private isInitialized: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  // Singleton pattern
  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  // Initialize connections
  public async initialize(dbConfig: any): Promise<void> {
    if (this.isInitialized) {
      console.log('Connection manager already initialized');
      return;
    }

    try {
      console.log(`Initializing connection manager for ${dbConfig.environment} environment`);

      // Create MySQL pool for database creation
      this.mysqlPool = createMySQLPool(dbConfig);
      
      // Create database if not exists
      await this.createDatabaseIfNotExists(dbConfig);
      
      // Create Sequelize instance with pooling
      this.sequelize = createSequelizeWithPool(dbConfig);
      
      // Test connection with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await this.sequelize.authenticate();
          console.log('✅ Database connection established successfully');
          break;
        } catch (authError) {
          retryCount++;
          console.warn(`⚠️ Authentication attempt ${retryCount} failed:`, authError);
          
          if (retryCount >= maxRetries) {
            throw authError;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        }
      }
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      console.log('✅ Connection manager initialized successfully');
      
    } catch (error) {
      console.error('❌ Connection manager initialization failed:', error);
      // Clean up on failure
      await this.cleanup();
      throw error;
    }
  }

  // Create database if not exists
  private async createDatabaseIfNotExists(dbConfig: any): Promise<void> {
    let connection;
    try {
      connection = await this.mysqlPool.getConnection();
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
      console.log(`Database '${dbConfig.database}' ready`);
    } catch (error) {
      console.error('Error creating database:', error);
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  // Get Sequelize instance
  public getSequelize(): Sequelize {
    if (!this.sequelize) {
      throw new Error('Connection manager not initialized. Call initialize() first.');
    }
    return this.sequelize;
  }

  // Get MySQL pool
  public getMySQLPool(): any {
    if (!this.mysqlPool) {
      throw new Error('MySQL pool not initialized. Call initialize() first.');
    }
    return this.mysqlPool;
  }

  // Health monitoring
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const isHealthy = await checkConnectionHealth(this.sequelize!);
        if (!isHealthy) {
          console.warn('⚠️ Database health check failed, attempting reconnection...');
          await this.reconnect();
        }
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  // Reconnect to database
  private async reconnect(): Promise<void> {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
      }
      
      // For reconnection, we'll need to store the config or get it from environment
      // For now, we'll create a minimal config for reconnection
      const reconnectConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'invest_app',
        environment: process.env.NODE_ENV || 'development'
      };
      
      this.sequelize = createSequelizeWithPool(reconnectConfig);
      await this.sequelize.authenticate();
      console.log('✅ Database reconnected successfully');
    } catch (error) {
      console.error('❌ Database reconnection failed:', error);
    }
  }

  // Get connection statistics
  public getConnectionStats(): any {
    if (!this.sequelize) {
      return { error: 'Connection manager not initialized' };
    }

    const poolStats = getPoolStats(this.sequelize);
    return {
      isInitialized: this.isInitialized,
      pool: poolStats,
      timestamp: new Date().toISOString()
    };
  }

  // Cleanup method for error handling
  private async cleanup(): Promise<void> {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        this.sequelize = null;
      }
    } catch (error) {
      console.error('Error closing Sequelize:', error);
    }

    try {
      if (this.mysqlPool) {
        await this.mysqlPool.end();
        this.mysqlPool = null;
      }
    } catch (error) {
      console.error('Error closing MySQL pool:', error);
    }

    this.isInitialized = false;
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    console.log('Shutting down connection manager...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    await this.cleanup();
    console.log('✅ Connection manager shutdown complete');
  }

  // Check if initialized
  public isReady(): boolean {
    return this.isInitialized && this.sequelize !== null;
  }
}

// Export singleton instance
export const connectionManager = ConnectionManager.getInstance();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await connectionManager.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await connectionManager.shutdown();
  process.exit(0);
});

export default connectionManager;
