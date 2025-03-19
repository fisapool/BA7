import express from 'express';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool } from './db';
import * as fs from 'fs';
import { OptimizationResult, Product } from '../shared/schema';

// Use path.resolve() instead of import.meta
const __dirname = path.resolve();

// Create a router - this is what was causing most of your issues
const router = express.Router();

// Get all products
router.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, sku, price, cost, competitor_price, source
      FROM products
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product by ID
router.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT id, name, sku, price, cost, competitor_price, historical_sales, historical_price, sales_velocity, source
      FROM products
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get optimization history for a product
router.get('/products/:id/optimization-history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await pool.query(
      'SELECT * FROM optimization_results WHERE product_id = ? ORDER BY created_at DESC',
      [id]
    );
    res.json(history);
  } catch (error) {
    console.error('Error fetching optimization history:', error);
    res.status(500).json({ error: 'Failed to fetch optimization history' });
  }
});

// Optimize price for a product
router.post('/api/optimize-price', async (req, res) => {
  try {
    const { productId, parameters } = req.body;
    
    // Create temporary file for parameters
    const paramFileName = path.join(__dirname, '..', 'temp', `params_${uuidv4()}.json`);
    const resultFileName = path.join(__dirname, '..', 'temp', `result_${uuidv4()}.json`);
    
    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, '..', 'temp'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'temp'), { recursive: true });
    }
    
    // Write parameters to file
    fs.writeFileSync(paramFileName, JSON.stringify({
      productId,
      parameters
    }));
    
    // Set up Python options
    const options = {
      mode: 'text',
      pythonPath: process.env.PYTHON_PATH || 'python',
      scriptPath: path.join(__dirname, '..', 'ml'),
      args: [paramFileName, resultFileName]
    };
    
    // Run price optimization
    PythonShell.run('price_optimizer.py', options, (err: Error | null) => {
      if (err) {
        console.error('Error running price optimization:', err);
        return res.status(500).json({ error: 'Price optimization failed' });
      }
      
      // Read results
      if (!fs.existsSync(resultFileName)) {
        return res.status(500).json({ error: 'No optimization results found' });
      }
      
      const resultData = fs.readFileSync(resultFileName, 'utf8');
      const result = JSON.parse(resultData);
      
      // Clean up temporary files
      fs.unlinkSync(paramFileName);
      fs.unlinkSync(resultFileName);
      
      // Store optimization history in database
      pool.query(`
        INSERT INTO price_optimization_history (
          product_id, current_price, optimal_price, expected_sales,
          expected_revenue, expected_profit, parameters
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        productId,
        result.current_price,
        result.optimal_price,
        result.expected_sales,
        result.expected_revenue,
        result.expected_profit,
        parameters
      ]).catch((error: Error) => {
        console.error('Error saving optimization history:', error);
      });
      
      res.json(result);
    });
  } catch (error) {
    console.error('Error in price optimization:', error);
    res.status(500).json({ error: 'Price optimization failed' });
  }
});

// Apply optimization result
router.post('/products/:id/apply-optimization/:resultId', async (req, res) => {
  try {
    const { id, resultId } = req.params;
    
    // Get optimization result
    const [result] = await pool.query(
      'SELECT * FROM optimization_results WHERE id = ? AND product_id = ?',
      [resultId, id]
    );

    if (!result) {
      return res.status(404).json({ error: 'Optimization result not found' });
    }

    // Update product price
    await pool.query(
      'UPDATE products SET price = ? WHERE id = ?',
      [result.recommended_price, id]
    );

    // Record in price history
    await pool.query(
      `INSERT INTO price_history (id, product_id, price, source)
       VALUES (?, ?, ?, 'OPTIMIZATION')`,
      [uuidv4(), id, result.recommended_price]
    );

    // Mark optimization as applied
    await pool.query(
      'UPDATE optimization_results SET applied_at = NOW() WHERE id = ?',
      [resultId]
    );

    res.json({ message: 'Optimization applied successfully' });
  } catch (error) {
    console.error('Error applying optimization:', error);
    res.status(500).json({ error: 'Failed to apply optimization' });
  }
});

export default router; 