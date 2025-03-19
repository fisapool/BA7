const cron = require('node-cron');
const { exec } = require('child_process');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'lazada_products',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create log table if it doesn't exist
const createLogTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS data_refresh_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status VARCHAR(20) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Log table created or already exists');
  } catch (error) {
    console.error('Error creating log table:', error);
  }
};

// Schedule job to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running data refresh job...');
  
  try {
    // Run your import script
    exec('python import_data_docker.py', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Data import successful: ${stdout}`);
    });
    
    // Log the refresh operation
    await pool.query(`
      INSERT INTO data_refresh_logs (status, message) 
      VALUES ('success', 'Scheduled data refresh completed')
    `);
    
  } catch (error) {
    console.error('Data refresh job failed:', error);
    
    // Log the failure
    await pool.query(`
      INSERT INTO data_refresh_logs (status, message) 
      VALUES ('error', ?)
    `, [error.message]);
  }
});

// Initialize
createLogTable().then(() => {
  console.log('Cron job scheduled for data refresh');
}); 