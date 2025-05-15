const mysql = require('mysql2/promise');
const initializeDatabase = require('./init-db');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coffee_shop_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);
async function setupDatabase() {
  try {
    try {
      await pool.query('SELECT 1');
      console.log('Connected to existing database');
    } catch (error) {
      console.log('Database connection failed, attempting to initialize...');
      const initialized = await initializeDatabase();
      
      if (!initialized) {
        throw new Error('Failed to initialize database');
      }
    }

    await pool.query('SELECT 1');
    console.log('Database connection successful after initialization');
    
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    return false;
  }
}

async function columnExists(tableName, columnName) {
  try {
    const [check] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
    `, [dbConfig.database, tableName, columnName]);
    return check.length > 0;
  } catch (error) {
    console.error(`Error checking if column ${columnName} exists:`, error);
    return false;
  }
}

module.exports = {
  pool,
  setupDatabase,
  columnExists
};