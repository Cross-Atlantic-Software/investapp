-- Create stock_price_data table for storing historical price data
CREATE TABLE IF NOT EXISTS stock_price_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stock_id INT NOT NULL,
  date DATE NOT NULL,
  open_price DECIMAL(10,2) NOT NULL,
  high_price DECIMAL(10,2) NOT NULL,
  low_price DECIMAL(10,2) NOT NULL,
  close_price DECIMAL(10,2) NOT NULL,
  volume BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (stock_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_stock_date (stock_id, date),
  INDEX idx_stock_date (stock_id, date),
  INDEX idx_date (date)
);
