import express, { Router, Request, Response } from 'express';
import { PythonShell } from 'python-shell';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool } from './db';
import * as fs from 'fs';
import { OptimizationResult, Product } from '../shared/schema';

// Use __dirname alternative for ESM
const __dirname = path.resolve();

const router: Router = express.Router();

// Fix route handlers with explicit type annotations
router.get('/api/products', async (req: Request, res: Response) => {
  // code remains the same
});

// Add proper error typing
PythonShell.run('price_optimizer.py', options, (err: Error | null) => {
  if (err) {
    console.error('Error running price optimization:', err);
    return res.status(500).json({ error: 'Price optimization failed' });
  }
  
  // rest of the code
});

// Fix the error callback type
pool.query(`
  INSERT INTO price_optimization_history (/* ... */)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
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

export default router; 