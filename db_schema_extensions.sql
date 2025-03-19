-- Extensions to the existing database schema to support price optimization

-- Add price optimization related columns to products table
ALTER TABLE products
ADD COLUMN cost DECIMAL(10, 2),
ADD COLUMN historical_sales INTEGER,
ADD COLUMN historical_price DECIMAL(10, 2),
ADD COLUMN sales_velocity FLOAT,
ADD COLUMN competitor_price DECIMAL(10, 2);

-- Create price optimization history table
CREATE TABLE price_optimization_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    optimization_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_price DECIMAL(10, 2),
    optimal_price DECIMAL(10, 2),
    expected_sales FLOAT,
    expected_revenue DECIMAL(10, 2),
    expected_profit DECIMAL(10, 2),
    parameters JSONB,
    is_applied BOOLEAN DEFAULT FALSE
);

-- Create price test results table
CREATE TABLE price_test_results (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    test_start_date TIMESTAMP,
    test_end_date TIMESTAMP,
    control_price DECIMAL(10, 2),
    test_price DECIMAL(10, 2),
    control_sales INTEGER,
    test_sales INTEGER,
    control_revenue DECIMAL(10, 2),
    test_revenue DECIMAL(10, 2),
    statistical_significance FLOAT,
    notes TEXT
); 