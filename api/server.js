const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// BA6 product data endpoints
app.get('/api/products', (req, res) => {
  // Retrieve product data from database
});

// Price optimization endpoint
app.post('/api/optimize-price', (req, res) => {
  const { productId, parameters } = req.body;
  
  // Call Python pricing engine
  const pythonProcess = spawn('python', [
    '/app/pricing_engine/optimize.py',
    '--product_id', productId,
    '--parameters', JSON.stringify(parameters)
  ]);
  
  let resultData = '';
  
  pythonProcess.stdout.on('data', (data) => {
    resultData += data.toString();
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: 'Price optimization failed' });
    }
    
    try {
      const optimizationResult = JSON.parse(resultData);
      res.json(optimizationResult);
    } catch (error) {
      res.status(500).json({ error: 'Failed to parse optimization result' });
    }
  });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
}); 