const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Database connection
const getConnection = async () => {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'lazada_products'
  });
};

const optimizeDatabase = async () => {
  let connection;
  try {
    connection = await getConnection();
    
    // Run optimization queries
    console.log('Running database optimization...');
    
    // Analyze tables
    await connection.query('ANALYZE TABLE products, category_analytics, api_logs');
    
    // Optimize tables
    await connection.query('OPTIMIZE TABLE products, category_analytics, api_logs');
    
    console.log('Database optimization completed.');
    
  } catch (error) {
    console.error('Error optimizing database:', error);
  } finally {
    if (connection) connection.end();
  }
};

const generateApiKey = async (username, email, rateLimit = 100) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Generate a random API key
    const apiKey = require('crypto').randomBytes(32).toString('hex');
    
    // Insert into database
    await connection.query(`
      INSERT INTO api_users (username, api_key, email, rate_limit)
      VALUES (?, ?, ?, ?)
    `, [username, apiKey, email, rateLimit]);
    
    console.log(`API key generated for ${username}: ${apiKey}`);
    return apiKey;
    
  } catch (error) {
    console.error('Error generating API key:', error);
    return null;
  } finally {
    if (connection) connection.end();
  }
};

const purgeOldLogs = async (daysToKeep = 90) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Delete old logs
    const [result] = await connection.query(`
      DELETE FROM api_logs
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [daysToKeep]);
    
    console.log(`Purged ${result.affectedRows} old log entries.`);
    
  } catch (error) {
    console.error('Error purging old logs:', error);
  } finally {
    if (connection) connection.end();
  }
};

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Available commands:');
    console.log('  optimize - Optimize database tables');
    console.log('  generate-key <username> <email> [rate_limit] - Generate a new API key');
    console.log('  purge-logs [days] - Purge old logs (default: 90 days)');
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'optimize':
      optimizeDatabase();
      break;
      
    case 'generate-key':
      if (args.length < 3) {
        console.log('Usage: generate-key <username> <email> [rate_limit]');
        process.exit(1);
      }
      generateApiKey(args[1], args[2], args[3] ? parseInt(args[3]) : 100);
      break;
      
    case 'purge-logs':
      purgeOldLogs(args[1] ? parseInt(args[1]) : 90);
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      process.exit(1);
  }
}

module.exports = {
  getConnection,
  optimizeDatabase,
  generateApiKey,
  purgeOldLogs
}; 