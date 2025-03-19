declare module 'react';
declare module 'react-dom';
declare module 'axios';
declare module 'recharts';
declare module '@mui/material';
declare module '@emotion/react';
declare module '@emotion/styled';

// Make the shared schema imports work
declare module '../../../shared/schema' {
  export interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    cost: number;
    category?: string;
    historical_sales?: number;
    historical_price?: number;
    sales_velocity?: number;
    competitor_price?: number;
    source?: string;
  }

  export interface OptimizationResult {
    optimal_price: number;
    expected_sales: number;
    expected_revenue: number;
    expected_profit: number;
    current_price: number;
  }

  export interface OptimizationParams {
    competitor_price: number;
    season: string;
  }
} 