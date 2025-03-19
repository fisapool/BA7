# BP4 - Lazada Products API

## Project Overview
BP4 is a Node.js-based API service for managing and accessing Lazada product data, specifically focused on popular electronic accessories from the Lazada marketplace. The project uses Express for the backend API and MySQL for database storage. It provides a comprehensive interface for querying and managing e-commerce product information including product images, names, categories, and price ranges.

## Available Dataset
The project includes a dataset (`Lazada_Popular Items_Top Product - sellercenter.csv`) containing popular electronic accessories from Lazada with the following information:
- Product image URLs
- Product names
- Item categories (primarily in Electronics Accessories)
- Price ranges

## Current Status
- ✅ Docker configuration established (port conflicts resolved)
- ✅ Basic Express server structure implemented
- ✅ MySQL database service configured (running without external port exposure)
- ✅ Database connection script (connect-db.ps1) created
- ✅ Initial product dataset available in CSV format
- ❌ Data import process not yet implemented
- ❌ API endpoints not yet implemented
- ❌ Database schema needs to align with CSV data structure

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed
- Node.js (for local development)
- PowerShell (for Windows users running connect-db.ps1)

### Running with Docker
1. Clone the repository
```bash
git clone <repository-url>
cd bp4
```

2. Start the Docker containers
```bash
docker-compose up -d
```

3. Verify containers are running
```bash
docker-compose ps
```

### Accessing the Database
Use the included PowerShell script to connect to the database:
```bash
./connect-db.ps1
```

### Troubleshooting
If you encounter port conflicts with MySQL (3306):
- The docker-compose.yml has been modified to avoid exposing the MySQL port externally
- Internal container communication still works via the Docker network

## Project Structure
```
bp4/
├── Dockerfile                                      # Node.js application container configuration
├── docker-compose.yml                              # Multi-container Docker setup
├── app.js                                          # Main application entry point
├── package.json                                    # Node.js dependencies
├── connect-db.ps1                                  # Database connection helper script
├── db_schema.sql                                   # Database schema definition
├── requirements.txt                                # Python dependencies (if any Python scripts are used)
├── Lazada_Popular Items_Top Product - sellercenter.csv  # Product dataset
└── README.md                                       # Project documentation
```

## Data Model
Based on the available CSV data, the primary data model includes:
- Products
  - Image URL
  - Product Name
  - Category (with hierarchical structure)
  - Price Range (min-max values)

## Development Roadmap

### Immediate Tasks
- [ ] Create database schema aligned with CSV data structure
- [ ] Implement data import script for the CSV file
- [ ] Test database connectivity from the Express application
- [ ] Implement basic root endpoint (GET /)

### Short-term Goals
- [ ] Implement core API endpoints:
  - GET /products - List all products with pagination
  - GET /products/:id - Get specific product details
  - GET /products/categories - List unique product categories
  - GET /products/search - Search products by name or category
- [ ] Add filtering by price range
- [ ] Add sorting options (price, alphabetical)
- [ ] Implement basic image handling for product images

### Medium-term Goals
- [ ] Add category hierarchy navigation
- [ ] Implement price range aggregations
- [ ] Add comprehensive error handling
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Add caching for product listings

### Long-term Vision
- [ ] Add analytics for most viewed products
- [ ] Implement recommendation engine
- [ ] Create admin dashboard for product management
- [ ] Set up CI/CD pipeline
- [ ] Add automated testing (unit, integration, performance)

## License
[Your License Here]
