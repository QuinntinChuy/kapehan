const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { setupDatabase } = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..')));

const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('Coffee Shop API is running!');
});

async function startServer() {
  try {
    const dbInitialized = await setupDatabase();
    
    if (!dbInitialized) {
      console.error('Failed to initialize database. Check your database configuration.');
      process.exit(1);
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };