import React, { useState, useEffect } from 'react';
import PriceOptimization from '../components/PriceOptimization';
import axios from 'axios';

const Dashboard: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch available products
    const fetchProductData = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
        if (response.data.length > 0) {
          setSelectedProduct(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProductData();
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(Number(e.target.value));
  };

  return (
    <div className="dashboard-container">
      <h1>Price Optimization Dashboard</h1>
      
      <div className="product-selector">
        <label htmlFor="product-select">Select Product:</label>
        <select 
          id="product-select" 
          value={selectedProduct || ''} 
          onChange={handleProductChange}
        >
          <option value="" disabled>Select a product</option>
          {products.map((product: any) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>
      
      {selectedProduct && (
        <PriceOptimization productId={selectedProduct} />
      )}
    </div>
  );
};

export default Dashboard; 