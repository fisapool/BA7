import csv
import mysql.connector
from mysql.connector import Error

def import_data():
    try:
        # Connect to MySQL database
        connection = mysql.connector.connect(
            host='localhost',
            database='lazada_products',
            user='your_username',
            password='your_password'
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Read CSV file
            with open('Lazada_Popular Items_Top Product - sellercenter.csv.csv', 'r', encoding='utf-8') as file:
                csv_reader = csv.reader(file)
                next(csv_reader)  # Skip header row
                
                # Prepare SQL query
                insert_query = """
                INSERT INTO products (image_url, product_name, category, price_range)
                VALUES (%s, %s, %s, %s)
                """
                
                # Insert data
                for row in csv_reader:
                    if len(row) >= 4:  # Ensure row has enough columns
                        cursor.execute(insert_query, (row[0], row[1], row[2], row[3]))
                
                connection.commit()
                print(f"Data imported successfully.")
    
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
    
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")

if __name__ == "__main__":
    import_data() 