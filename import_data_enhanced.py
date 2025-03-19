import pandas as pd
import re
import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define database connection parameters
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'rootpassword'),
    'database': os.getenv('DB_NAME', 'lazada_products')
}

def extract_price_values(price_range):
    """Extract minimum and maximum price values from a price range string."""
    try:
        # Handle different formats: single price or range
        if isinstance(price_range, str):
            if '-' in price_range:
                # Range format: "min-max"
                min_price, max_price = price_range.split('-')
                return float(min_price.strip().replace(',', '')), float(max_price.strip().replace(',', ''))
            else:
                # Single price format
                price = float(price_range.strip().replace(',', ''))
                return price, price
        else:
            # Handle non-string values
            return None, None
    except Exception as e:
        print(f"Error parsing price range '{price_range}': {e}")
        return None, None

def import_lazada_products(csv_file):
    """Import Lazada products from CSV file to MySQL database."""
    try:
        # Read the CSV file
        print(f"Reading data from {csv_file}...")
        df = pd.read_csv(csv_file)
        
        # Connect to the database
        print("Connecting to database...")
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Process each product
        products_added = 0
        categories_added = set()
        
        # First, insert categories
        unique_categories = df['Item Category'].dropna().unique()
        
        for category in unique_categories:
            # Parse hierarchy: main category > subcategory > sub-subcategory
            category_parts = category.split('>')
            parent_id = None
            
            for i, cat_part in enumerate(category_parts):
                cat_name = cat_part.strip()
                
                # Check if this category level already exists with this parent
                if parent_id is None:
                    cursor.execute(
                        "SELECT id FROM categories WHERE category_name = %s AND parent_category_id IS NULL",
                        (cat_name,)
                    )
                else:
                    cursor.execute(
                        "SELECT id FROM categories WHERE category_name = %s AND parent_category_id = %s",
                        (cat_name, parent_id)
                    )
                
                result = cursor.fetchone()
                
                if result:
                    # Category exists, use its ID as parent for next level
                    parent_id = result[0]
                else:
                    # Insert new category
                    cursor.execute(
                        "INSERT INTO categories (category_name, parent_category_id, level) VALUES (%s, %s, %s)",
                        (cat_name, parent_id, i+1)
                    )
                    parent_id = cursor.lastrowid
                    categories_added.add(cat_name)
        
        # Then insert products
        for _, row in df.iterrows():
            product_name = row['Product Name']
            product_image = row['Product Image']
            category = row['Item Category']
            price_range = row['Price Range']
            
            # Extract min and max prices
            min_price, max_price = extract_price_values(price_range)
            
            # Insert product
            cursor.execute(
                """
                INSERT INTO products 
                (product_name, product_image_url, category, price_range, min_price, max_price) 
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (product_name, product_image, category, price_range, min_price, max_price)
            )
            products_added += 1
        
        # Commit the transaction
        conn.commit()
        
        print(f"Import completed: {products_added} products and {len(categories_added)} categories added.")
        
    except Exception as e:
        print(f"Error during import: {e}")
        if 'conn' in locals() and conn.is_connected():
            conn.rollback()
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()

if __name__ == "__main__":
    import_lazada_products("Lazada_Popular Items_Top Product - sellercenter.csv.csv")
    print("Lazada product import process completed.") 