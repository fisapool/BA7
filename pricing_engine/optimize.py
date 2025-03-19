#!/usr/bin/env python
import argparse
import json
import pandas as pd
import pickle
import os
from sqlalchemy import create_engine

def connect_to_database():
    """Connect to the database."""
    db_host = os.environ.get('DB_HOST', 'db')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'postgres')
    db_name = os.environ.get('DB_NAME', 'lazada_products')
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}/{db_name}"
    return create_engine(connection_string)

def get_product_data(engine, product_id):
    """Retrieve product data from database."""
    query = f"SELECT * FROM products WHERE id = {product_id}"
    return pd.read_sql(query, engine)

def optimize_price(product_data, parameters):
    """Optimize price based on product data and parameters."""
    # Load trained model
    model_path = os.path.join('/app/pricing_engine/models', 'price_optimizer.pkl')
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    # Feature engineering
    features = prepare_features(product_data, parameters)
    
    # Predict optimal price
    optimal_price = model.predict(features)[0]
    
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
        'category': [product_data['category'].iloc[0]],
        'cost': [product_data['cost'].iloc[0]],
        'competitor_price': [parameters.get('competitor_price', 0)],
        'sales_velocity': [product_data['sales_velocity'].iloc[0]],
        'season': [parameters.get('season', 'regular')]
    })

def calculate_expected_sales(price, product_data):
    """Calculate expected sales at the given price."""
    # Simple price elasticity model as a placeholder
    base_sales = product_data['historical_sales'].iloc[0]
    base_price = product_data['historical_price'].iloc[0]
    elasticity = -1.2  # Example elasticity coefficient
    
    return base_sales * (price / base_price) ** elasticity

def calculate_expected_profit(price, sales, product_data):
    """Calculate expected profit."""
    cost = product_data['cost'].iloc[0]
    return (price - cost) * sales

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Optimize product price')
    parser.add_argument('--product_id', type=int, required=True, help='Product ID')
    parser.add_argument('--parameters', type=str, required=True, help='Optimization parameters as JSON')
    
    args = parser.parse_args()
    parameters = json.loads(args.parameters)
    
    engine = connect_to_database()
    product_data = get_product_data(engine, args.product_id)
    
    if product_data.empty:
        print(json.dumps({'error': 'Product not found'}))
        exit(1)
    
    result = optimize_price(product_data, parameters)
    print(json.dumps(result)) 