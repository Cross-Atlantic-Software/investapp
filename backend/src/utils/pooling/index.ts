// Pooling module exports
export { 
  createSequelizeWithPool, 
  createMySQLPool, 
  checkConnectionHealth, 
  getPoolStats,
  POOL_CONFIGS,
  DEFAULT_POOL_CONFIG,
  type PoolConfig,
  type DatabaseConfig
} from './connectionPool';

export { 
  ConnectionManager, 
  connectionManager 
} from './connectionManager';

export { 
  PoolMonitor, 
  poolMonitor 
} from './poolMonitor';

// Default export for easy importing
export default {
  connectionManager: require('./connectionManager').connectionManager,
  poolMonitor: require('./poolMonitor').poolMonitor,
  createSequelizeWithPool: require('./connectionPool').createSequelizeWithPool,
  createMySQLPool: require('./connectionPool').createMySQLPool,
  checkConnectionHealth: require('./connectionPool').checkConnectionHealth,
  getPoolStats: require('./connectionPool').getPoolStats,
  POOL_CONFIGS: require('./connectionPool').POOL_CONFIGS,
  DEFAULT_POOL_CONFIG: require('./connectionPool').DEFAULT_POOL_CONFIG
};
