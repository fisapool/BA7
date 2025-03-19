import csv
import mysql.connector
from mysql.connector import Error
import re

def clean_price(price_text):
    # Handle cases like '2.8', '3.7-23.7', etc.
    if not price_text:
        return '0'
    return price_text.replace(',', '')

def import_data():
    try:
        # Connect to MySQL database - adjust password if needed
        connection = mysql.connector.connect(
            host='localhost',
            database='lazada_products',
            user='root',
            password='YOUR_MYSQL_PASSWORD'  # Replace with your actual MySQL root password
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Clear existing data
            cursor.execute("TRUNCATE TABLE products")
            print("Existing products data cleared.")
            
            # Read CSV file
            csv_file_path = 'Lazada_Popular Items_Top Product - sellercenter.csv.csv'
            print(f"Attempting to open file: {csv_file_path}")
            
            with open(csv_file_path, 'r', encoding='utf-8') as file:
                csv_reader = csv.reader(file)
                next(csv_reader)  # Skip header row
                
                # Prepare SQL query
                insert_query = """
                INSERT INTO products (image_url, product_name, category, price_range)
                VALUES (%s, %s, %s, %s)
                """
                
                # Insert data
                count = 0
                for row in csv_reader:
                    if len(row) >= 4:  # Ensure row has enough columns
                        # Clean and prepare the data
                        image_url = row[0]
                        product_name = row[1]
                        category = row[2]
                        price_range = clean_price(row[3])
                        
                        cursor.execute(insert_query, (image_url, product_name, category, price_range))
                        count += 1
                
                connection.commit()
                print(f"Product data imported successfully. {count} products added.")
                
                # Update category analytics table
                try:
                    update_analytics_query = """
                    INSERT INTO category_analytics (category, product_count, avg_price, min_price, max_price)
                    SELECT 
                        category,
                        COUNT(*) as product_count,
                        AVG((min_price + max_price) / 2) as avg_price,
                        MIN(min_price) as min_price,
                        MAX(max_price) as max_price
                    FROM products
                    GROUP BY category
                    ON DUPLICATE KEY UPDATE
                        product_count = VALUES(product_count),
                        avg_price = VALUES(avg_price),
                        min_price = VALUES(min_price),
                        max_price = VALUES(max_price),
                        last_updated = CURRENT_TIMESTAMP
                    """
                    cursor.execute(update_analytics_query)
                    connection.commit()
                    print(f"Category analytics updated successfully.")
                except Error as e:
                    print(f"Error updating category analytics: {e}")
    
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
    
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")

if __name__ == "__main__":
    import_data()