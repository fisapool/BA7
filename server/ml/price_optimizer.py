#!/usr/bin/env python
import sys
import json
import os
import pandas as pd
import pickle
from sqlalchemy import create_engine

def connect_to_database():
    """Connect to the database."""
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', '')
    db_name = os.environ.get('DB_NAME', 'lazada_products')
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}/{db_name}"
    return create_engine(connection_string)

def get_product_data(engine, product_id):
    """Retrieve product data from database."""
    query = f"SELECT * FROM products WHERE id = {product_id}"
    return pd.read_sql(query, engine)

def optimize_price(product_data, parameters):
    """Optimize price based on product data and parameters."""
    # Load trained model or use a simple calculation if model doesn't exist
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'price_optimizer.pkl')
    
    try:
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        # Feature engineering
        features = prepare_features(product_data, parameters)
        
        # Predict optimal price
        optimal_price = model.predict(features)[0]
    except (FileNotFoundError, IOError):
        # Fallback if model doesn't exist: simple demand-based calculation
        current_price = product_data['price'].iloc[0]
        cost = product_data['cost'].iloc[0]
        competitor_price = parameters.get('competitor_price', current_price)
        
        # Simple formula: position between cost and competitor price with markup
        markup_factor = 1.2  # 20% markup
        optimal_price = cost * markup_factor
        
        # Adjust based on competitor price if available
        if competitor_price > 0:
            # Position our price slightly below competitor
            optimal_price = min(optimal_price, competitor_price * 0.95)
        
        # Ensure price is above cost with minimum margin
        min_markup = cost * 1.1  # at least 10% above cost
        optimal_price = max(optimal_price, min_markup)
    
    # Calculate expected metrics
    expected_sales = calculate_expected_sales(optimal_price, product_data)
    expected_revenue = optimal_price * expected_sales
    expected_profit = calculate_expected_profit(optimal_price, expected_sales, product_data)
    
    return {
        'optimal_price': float(optimal_price),
        'expected_sales': float(expected_sales),
        'expected_revenue': float(expected_revenue),
        'expected_profit': float(expected_profit),
        'current_price': float(product_data['price'].iloc[0])
    }

def prepare_features(product_data, parameters):
    """Prepare features for the model."""
    # Implementation depends on your specific model requirements
    # This is a placeholder
    return pd.DataFrame({
        'category': [product_data['category'].iloc[0] if 'category' in product_data.columns else 'unknown'],
        'cost': [product_data['cost'].iloc[0]],
        'competitor_price': [parameters.get('competitor_price', 0)],
        'sales_velocity': [product_data['sales_velocity'].iloc[0] if 'sales_velocity' in product_data.columns else 0],
        'season': [parameters.get('season', 'regular')]
    })

def calculate_expected_sales(price, product_data):
    """Calculate expected sales at the given price."""
    # Simple price elasticity model as a placeholder
    if 'historical_sales' in product_data.columns and 'historical_price' in product_data.columns:
        base_sales = product_data['historical_sales'].iloc[0]
        base_price = product_data['historical_price'].iloc[0]
    else:
        # Fallback values if historical data is not available
        base_sales = 100  # Arbitrary baseline sales
        base_price = product_data['price'].iloc[0]
    
    elasticity = -1.2  # Example elasticity coefficient (negative means lower price = more sales)
    
    if base_price == 0:  # Avoid division by zero
        return base_sales
        
    return base_sales * (price / base_price) ** elasticity

def calculate_expected_profit(price, sales, product_data):
    """Calculate expected profit."""
    cost = product_data['cost'].iloc[0]
    return (price - cost) * sales

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: price_optimizer.py [input_file] [output_file]")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    with open(input_file, 'r') as f:
        input_data = json.load(f)
    
    product_id = input_data['productId']
    parameters = input_data['parameters']
    
    engine = connect_to_database()
    product_data = get_product_data(engine, product_id)
    
    if product_data.empty:
        with open(output_file, 'w') as f:
            json.dump({'error': 'Product not found'}, f)
        sys.exit(1)
    
    result = optimize_price(product_data, parameters)
    
    with open(output_file, 'w') as f:
        json.dump(result, f) 