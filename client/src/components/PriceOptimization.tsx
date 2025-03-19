import * as React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Button, Slider, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Paper } from '@mui/material';
import type { OptimizationResult as ApiOptimizationResult, Product } from '../../../shared/schema';

interface PriceOptimizationProps {
  productId: number;
}

interface OptimizationParams {
  competitor_price: number;
  season: string;
}

interface OptimizationResult {
  optimal_price: number;
  expected_sales: number;
  expected_revenue: number;
  expected_profit: number;
  current_price: number;
}

interface ProductData {
  id: number;
  name: string;
  sku: string;
  price: number;
  cost: number;
  competitor_price?: number;
}

const PriceOptimization = ({ productId }: PriceOptimizationProps) => {
  const [product, setProduct] = useState(null);
  const [pricingResult, setPricingResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizationParams, setOptimizationParams] = useState({
    competitor_price: 0,
    season: 'regular',
  });

  useEffect(() => {
    // Fetch product data
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
        setOptimizationParams({
          ...optimizationParams,
          competitor_price: response.data.competitor_price || 0,
        });
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const optimizePrice = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/optimize-price', {
        productId,
        parameters: optimizationParams,
      });
      setPricingResult(response.data);
    } catch (error) {
      console.error('Error optimizing price:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParamChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    
    setOptimizationParams({
      ...optimizationParams,
      [name]: name === 'competitor_price' ? parseFloat(value as string) : value,
    });
  };

  if (loading && !product) {
    return <div>Loading product data...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="pricing-dashboard">
      <h2>Price Optimization for {product.name}</h2>
      
      <div className="product-info">
        <p><strong>SKU:</strong> {product.sku}</p>
        <p><strong>Current Price:</strong> ${product.price}</p>
        <p><strong>Cost:</strong> ${product.cost}</p>
        <p><strong>Current Margin:</strong> {((product.price - product.cost) / product.price * 100).toFixed(2)}%</p>
      </div>
      
      <div className="optimization-controls">
        <h3>Optimization Parameters</h3>
        <div className="form-group">
          <label>Competitor Price ($):</label>
          <TextField
            type="number"
            name="competitor_price"
            value={optimizationParams.competitor_price}
            onChange={handleParamChange}
            inputProps={{ step: "0.01" }}
          />
        </div>
        <div className="form-group">
          <FormControl fullWidth>
            <InputLabel id="season-label">Season</InputLabel>
            <Select
              labelId="season-label"
              name="season"
              value={optimizationParams.season}
              onChange={handleParamChange}
            >
              <MenuItem value="regular">Regular</MenuItem>
              <MenuItem value="high">High Season</MenuItem>
              <MenuItem value="low">Low Season</MenuItem>
              <MenuItem value="promotion">Promotion</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={optimizePrice} 
          disabled={loading}
        >
          {loading ? 'Optimizing...' : 'Optimize Price'}
        </Button>
      </div>
      
      {pricingResult && (
        <div className="optimization-results">
          <h3>Optimization Results</h3>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper className="result-card">
                <div className="result-item">
                  <Typography variant="h6">Optimal Price</Typography>
                  <Typography variant="h4" className="highlight">
                    ${pricingResult.optimal_price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" className="change">
                    {((pricingResult.optimal_price - product.price) / product.price * 100).toFixed(2)}% 
                    from current price
                  </Typography>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className="result-card">
                <div className="result-item">
                  <Typography variant="h6">Expected Sales</Typography>
                  <Typography variant="h4">
                    {pricingResult.expected_sales.toFixed(0)} units
                  </Typography>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className="result-card">
                <div className="result-item">
                  <Typography variant="h6">Expected Revenue</Typography>
                  <Typography variant="h4">
                    ${pricingResult.expected_revenue.toFixed(2)}
                  </Typography>
                </div>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className="result-card">
                <div className="result-item">
                  <Typography variant="h6">Expected Profit</Typography>
                  <Typography variant="h4">
                    ${pricingResult.expected_profit.toFixed(2)}
                  </Typography>
                </div>
              </Paper>
            </Grid>
          </Grid>
        </div>
      )}
    </div>
  );
};

export default PriceOptimization; 