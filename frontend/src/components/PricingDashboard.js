import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const PricingDashboard = ({ productId }) => {
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

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setOptimizationParams({
      ...optimizationParams,
      [name]: name === 'competitor_price' ? parseFloat(value) : value,
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
          <input
            type="number"
            name="competitor_price"
            value={optimizationParams.competitor_price}
            onChange={handleParamChange}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Season:</label>
          <select
            name="season"
            value={optimizationParams.season}
            onChange={handleParamChange}
          >
            <option value="regular">Regular</option>
            <option value="high">High Season</option>
            <option value="low">Low Season</option>
            <option value="promotion">Promotion</option>
          </select>
        </div>
        <button onClick={optimizePrice} disabled={loading}>
          {loading ? 'Optimizing...' : 'Optimize Price'}
        </button>
      </div>
      
      {pricingResult && (
        <div className="optimization-results">
          <h3>Optimization Results</h3>
          <div className="result-card">
            <div className="result-item">
              <h4>Optimal Price</h4>
              <p className="highlight">${pricingResult.optimal_price.toFixed(2)}</p>
              <p className="change">
                {((pricingResult.optimal_price - product.price) / product.price * 100).toFixed(2)}% 
                from current price
              </p>
            </div>
            <div className="result-item">
              <h4>Expected Sales</h4>
              <p>{pricingResult.expected_sales.toFixed(0)} units</p>
            </div>
            <div className="result-item">
              <h4>Expected Revenue</h4>
              <p>${pricingResult.expected_revenue.toFixed(2)}</p>
            </div>
            <div className="result-item">
              <h4>Expected Profit</h4>
              <p>${pricingResult.expected_profit.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Add chart visualizations here */}
        </div>
      )}
    </div>
  );
};

export default PricingDashboard; 