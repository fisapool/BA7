const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'lazada_products'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'healthy', message: 'Database connection successful' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', message: error.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Lazada Products API',
    endpoints: [
      { method: 'GET', path: '/api/products', description: 'Get all products' },
      { method: 'GET', path: '/api/products/:id', description: 'Get product by ID' },
      { method: 'GET', path: '/api/products/categories', description: 'Get all categories' },
      { method: 'GET', path: '/api/products/search', description: 'Search products' }
    ]
  });
});

// Get all products with pagination
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const [products] = await pool.query(
      'SELECT * FROM products LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM products');
    const total = countResult[0].total;
    
    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const [product] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );
    
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product categories
app.get('/api/products/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM products'
    );
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search products
app.get('/api/products/search', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const category = req.query.category || '';
    const minPrice = req.query.minPrice || 0;
    const maxPrice = req.query.maxPrice || 999999;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (searchTerm) {
      query += ' AND product_name LIKE ?';
      params.push(`%${searchTerm}%`);
    }
    
    if (category) {
      query += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }
    
    query += ' AND (min_price >= ? OR min_price IS NULL)';
    params.push(minPrice);
    
    query += ' AND (max_price <= ? OR max_price IS NULL)';
    params.push(maxPrice);
    
    const [products] = await pool.query(query, params);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RapidAPI authentication middleware
const authenticateRapidAPI = (req, res, next) => {
  const rapidAPIKey = req.get('X-RapidAPI-Key');
  const rapidAPIProxy = req.get('X-RapidAPI-Proxy-Secret');
  
  if (!rapidAPIKey) {
    return res.status(401).json({ error: 'Missing RapidAPI Key' });
  }
  
  // For additional security, you can validate the key against allowed keys
  // You can also check the X-RapidAPI-Proxy-Secret for additional validation
  
  next();
};

// API request logging middleware
app.use(async (req, res, next) => {
  const start = Date.now();
  const apiKey = req.get('X-RapidAPI-Key') || req.query.api_key;
  
  // Store the original end function
  const originalEnd = res.end;
  
  // Override the end function
  res.end = async function(...args) {
    const responseTime = Date.now() - start;
    const statusCode = res.statusCode;
    
    try {
      if (apiKey) {
        await pool.query(`
          INSERT INTO api_logs 
          (api_key, endpoint, status_code, response_time_ms, request_ip) 
          VALUES (?, ?, ?, ?, ?)
        `, [
          apiKey, 
          req.originalUrl, 
          statusCode, 
          responseTime,
          req.ip || req.connection.remoteAddress
        ]);
        
        // Also update last access time for the user
        await pool.query(`
          UPDATE api_users 
          SET last_access = CURRENT_TIMESTAMP 
          WHERE api_key = ?
        `, [apiKey]);
      }
    } catch (error) {
      console.error('Error logging API request:', error);
    }
    
    // Call the original end function
    return originalEnd.apply(this, args);
  };
  
  next();
});

// Routes
app.get('/api/products/category/:category', authenticateRapidAPI, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE category LIKE ?', [`%${req.params.category}%`]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

app.get('/api/products/price/:min/:max', authenticateRapidAPI, async (req, res) => {
  try {
    // Note: This is a simplified version. Actual implementation would need to parse price ranges
    const [rows] = await pool.query('SELECT * FROM products WHERE price_range LIKE ? OR price_range LIKE ?', 
      [`%${req.params.min}%`, `%${req.params.max}%`]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products by price:', error);
    res.status(500).json({ error: 'Failed to fetch products by price' });
  }
});

// Add this endpoint for real-time updates
app.get('/api/products/latest', authenticateRapidAPI, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY updated_at DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching latest products:', error);
    res.status(500).json({ error: 'Failed to fetch latest products' });
  }
});

// Add pricing analysis endpoint
app.get('/api/analytics/pricing', authenticateRapidAPI, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        MIN(SUBSTRING_INDEX(price_range, '-', 1)) AS min_price,
        MAX(CASE 
          WHEN price_range LIKE '%-%' 
          THEN SUBSTRING_INDEX(price_range, '-', -1) 
          ELSE price_range 
        END) AS max_price,
        AVG(CASE 
          WHEN price_range LIKE '%-%' 
          THEN (SUBSTRING_INDEX(price_range, '-', 1) + SUBSTRING_INDEX(price_range, '-', -1))/2 
          ELSE price_range 
        END) AS avg_price,
        category
      FROM products
      GROUP BY category
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error analyzing pricing:', error);
    res.status(500).json({ error: 'Failed to analyze pricing' });
  }
});

// Top trending products
app.get('/api/analytics/trending', authenticateRapidAPI, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, 
        (SELECT COUNT(*) FROM api_logs l WHERE l.endpoint LIKE CONCAT('%/products/', p.id, '%')) as view_count
      FROM products p
      ORDER BY view_count DESC
      LIMIT 20
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error getting trending products:', error);
    res.status(500).json({ error: 'Failed to get trending products' });
  }
});

// Category insights
app.get('/api/analytics/categories', authenticateRapidAPI, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM category_analytics
      ORDER BY product_count DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error getting category insights:', error);
    res.status(500).json({ error: 'Failed to get category insights' });
  }
});

// Price ranges in a category
app.get('/api/analytics/price-ranges/:category', authenticateRapidAPI, async (req, res) => {
  try {
    const category = req.params.category;
    const [rows] = await pool.query(`
      SELECT 
        CASE
          WHEN min_price < 10 THEN 'Under $10'
          WHEN min_price >= 10 AND min_price < 50 THEN '$10-$50'
          WHEN min_price >= 50 AND min_price < 100 THEN '$50-$100'
          WHEN min_price >= 100 AND min_price < 500 THEN '$100-$500'
          ELSE 'Over $500'
        END as price_bracket,
        COUNT(*) as product_count,
        AVG((min_price + max_price) / 2) as avg_price
      FROM products
      WHERE category LIKE ?
      GROUP BY price_bracket
      ORDER BY MIN(min_price)
    `, [`%${category}%`]);
    res.json(rows);
  } catch (error) {
    console.error('Error analyzing price ranges:', error);
    res.status(500).json({ error: 'Failed to analyze price ranges' });
  }
});

// Product search with relevance ranking
app.get('/api/products/search/:query', authenticateRapidAPI, async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const [rows] = await pool.query(`
      SELECT *, MATCH(product_name, category) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM products
      WHERE MATCH(product_name, category) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC
      LIMIT 50
    `, [searchQuery, searchQuery]);
    res.json(rows);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// API usage statistics (admin endpoint)
app.get('/api/admin/usage', authenticateRapidAPI, async (req, res) => {
  try {
    // Check if admin key
    const apiKey = req.get('X-RapidAPI-Key');
    const [adminCheck] = await pool.query(`
      SELECT * FROM api_users WHERE api_key = ? AND username = 'admin'
    `, [apiKey]);
    
    if (adminCheck.length === 0) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as request_count,
        COUNT(DISTINCT api_key) as unique_users,
        AVG(response_time_ms) as avg_response_time,
        MAX(response_time_ms) as max_response_time
      FROM api_logs
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching API usage statistics:', error);
    res.status(500).json({ error: 'Failed to fetch API usage statistics' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 