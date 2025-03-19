CREATE DATABASE IF NOT EXISTS lazada_products;
USE lazada_products;

-- Products table to store Lazada product data
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_image_url VARCHAR(512) NOT NULL,
    category VARCHAR(255) NOT NULL,
    price_range VARCHAR(50) NOT NULL,
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table to manage product categories
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    parent_category_id INT,
    level INT DEFAULT 1,
    FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Index for faster category lookups
CREATE INDEX idx_product_category ON products(category);
CREATE INDEX idx_product_price_min ON products(min_price);
CREATE INDEX idx_product_price_max ON products(max_price);

-- Category analytics table (populated via triggers or scheduled jobs)
CREATE TABLE IF NOT EXISTS category_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    product_count INT NOT NULL,
    avg_price DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2) NOT NULL,
    max_price DECIMAL(10,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category (category)
);

-- Search index for faster text searches
CREATE FULLTEXT INDEX product_search_idx ON products(product_name, category);

-- Data refresh logs table
CREATE TABLE IF NOT EXISTS data_refresh_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User API key management
CREATE TABLE IF NOT EXISTS api_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    api_key VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    rate_limit INT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_access TIMESTAMP NULL,
    UNIQUE KEY unique_api_key (api_key),
    UNIQUE KEY unique_username (username)
);

-- API request logs
CREATE TABLE IF NOT EXISTS api_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    api_key VARCHAR(64) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status_code INT NOT NULL,
    response_time_ms INT NOT NULL,
    request_ip VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_api_key (api_key),
    INDEX idx_created_at (created_at)
); 