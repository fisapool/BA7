import pandas as pd
import re
import mysql.connector
import os
import time

# Define database connection parameters
db_config = {
    'host': os.getenv('DB_HOST', 'db'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'rootpassword'),
    'database': os.getenv('DB_NAME', 'lazada_products')
}

def wait_for_db():
    """Wait for database to be ready."""
    max_retries = 30
    retries = 0
    
    while retries < max_retries:
        try:
            conn = mysql.connector.connect(**db_config)
            conn.close()
            return True
        except:
            print(f"Database not ready yet. Retry {retries+1}/{max_retries}...")
            retries += 1
            time.sleep(2)
    
    return False

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
        if not wait_for_db():
            print("Failed to connect to database after multiple retries.")
            return
            
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Check if tables exist, if not create them
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category_name VARCHAR(255) NOT NULL,
            parent_category_id INT,
            level INT DEFAULT 1,
            FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE SET NULL
        )
        """)
        
        cursor.execute("""
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
        )
        """)
        
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
    # Wait for the database to be ready
    time.sleep(10)  # Give MySQL container time to initialize
    import_lazada_products("/app/Lazada_Popular Items_Top Product - sellercenter.csv.csv")
    print("Lazada product import process completed.") 