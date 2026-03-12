require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const requestRoutes = require('./routes/requests');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDb();
});
