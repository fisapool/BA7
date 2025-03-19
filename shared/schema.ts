export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  cost: number;
  category?: string;
  historical_sales?: number;
  historical_price?: number;
  sales_velocity?: number;
  competitor_price?: number;
  source?: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  timestamp: Date;
  source: 'MANUAL' | 'OPTIMIZATION' | 'IMPORT';
}

export interface OptimizationResult {
  optimal_price: number;
  expected_sales: number;
  expected_revenue: number;
  expected_profit: number;
  current_price: number;
}

export interface OptimizationParams {
  competitor_price: number;
  season: string;
}

export interface MarketAnalysis {
  id: string;
  categoryId: string;
  averagePrice: number;
  medianPrice: number;
  priceVolatility: number;
  competitorCount: number;
  timestamp: Date;
}

// SQL schema for the tables
export const schema = `
  CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source ENUM('MANUAL', 'OPTIMIZATION', 'IMPORT') NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS optimization_results (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    recommended_price DECIMAL(10,2) NOT NULL,
    confidence_score DECIMAL(4,3) NOT NULL,
    price_elasticity DECIMAL(5,3) NOT NULL,
    market_position VARCHAR(50) NOT NULL,
    profit_impact DECIMAL(6,4) NOT NULL,
    trend_direction ENUM('up', 'down', 'stable') NOT NULL,
    trend_strength DECIMAL(4,3) NOT NULL,
    applied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS market_analysis (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(100) NOT NULL,
    average_price DECIMAL(10,2) NOT NULL,
    median_price DECIMAL(10,2) NOT NULL,
    price_volatility DECIMAL(5,4) NOT NULL,
    competitor_count INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`; 