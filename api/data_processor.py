#!/usr/bin/env python
import pandas as pd
import os
from sqlalchemy import create_engine
import logging
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def connect_to_database():
    """Connect to the database."""
    db_host = os.environ.get('DB_HOST', 'db')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'postgres')
    db_name = os.environ.get('DB_NAME', 'lazada_products')
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}/{db_name}"
    return create_engine(connection_string)

def process_lazada_data():
    """Process Lazada data for price optimization."""
    try:
        engine = connect_to_database()
        
        # Get raw Lazada product data
        query = """
        SELECT * FROM products
        WHERE source = 'lazada'
        """
        lazada_df = pd.read_sql(query, engine)
        
        if lazada_df.empty:
            logger.warning("No Lazada products found in database")
            return False
        
        # Calculate metrics needed for price optimization
        for index, row in lazada_df.iterrows():
            if pd.isna(row['cost']):
                # Estimate cost if missing (example: 60% of price)
                cost = row['price'] * 0.6
                
                # Update cost in database
                update_query = f"""
                UPDATE products
                SET cost = {cost}
                WHERE id = {row['id']}
                """
                engine.execute(update_query)
                
        logger.info(f"Processed {len(lazada_df)} Lazada products")
        return True
    
    except Exception as e:
        logger.error(f"Error processing Lazada data: {str(e)}")
        return False

if __name__ == "__main__":
    process_lazada_data() 