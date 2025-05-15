const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coffee_shop_db'
};

async function initializeDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`Database "${dbConfig.database}" created or already exists`);

    await connection.query(`USE ${dbConfig.database}`);

    // Load and execute schema.sql for table creation
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const statements = schemaSql.split(';').filter(statement => statement.trim() !== '');

    console.log('Setting up database schema...');
    for (const statement of statements) {
      await connection.query(statement + ';');
    }
    console.log('Database schema setup complete');

    // Seed initial data into the database
    console.log('Seeding initial data...');
    const seedData = [
      `INSERT INTO menu_items (name, description, price, category, image_url) VALUES
      ('Espresso', 'Strong concentrated coffee, served in small shots', 39.00, 'hot', '../images/Coffee Espresso.jpeg'),
      ('Americano', 'Espresso diluted with hot water for a smoother taste', 39.00, 'hot', '../images/Americano Coffee.jpeg'),
      ('Cappuccino', 'Espresso with steamed milk and silky foam', 39.00, 'hot', '../images/Cappuccin.jpeg'),
      ('Iced Latte', 'Espresso chilled with milk and ice', 39.00, 'cold', '../images/Iced Coffee latte.jpeg'),
      ('Iced Americano', 'Refreshing diluted espresso over ice', 39.00, 'cold', '../images/Iced Americano.jpeg'),
      ('Nitro Cold Brew', 'Creamy cold brew infused with nitrogen', 39.00, 'cold', '../images/Nitro coldbrew.jpeg');`
    ];

    for (const seed of seedData) {
      await connection.query(seed);
    }
    console.log('Initial data seeding complete');

    // Verify seeded data
    const [menuItems] = await connection.query('SELECT COUNT(*) as count FROM menu_items');
    console.log(`Menu items in database: ${menuItems[0].count}`);

    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(success => {
      if (success) {
        console.log('Database initialization completed successfully');
      } else {
        console.error('Database initialization failed');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Uncaught error during database initialization:', err);
      process.exit(1);
    });
}

module.exports = initializeDatabase;