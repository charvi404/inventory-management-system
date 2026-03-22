const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema creation
    await pool.query(schemaSql);
    console.log('Database tables created/verified.');

    // Seed admin user
    const adminCheck = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
        ['admin', hashedPassword, 'Admin']
      );
      console.log('Admin user seeded (admin / admin123).');
    }

    // Seed manager user
    const managerCheck = await pool.query("SELECT * FROM users WHERE username = 'manager'");
    if (managerCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('manager123', 10);
      await pool.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
        ['manager', hashedPassword, 'Manager']
      );
      console.log('Manager user seeded (manager / manager123).');
    }

    // Seed staff user
    const staffCheck = await pool.query("SELECT * FROM users WHERE username = 'staff'");
    if (staffCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('staff123', 10);
      await pool.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
        ['staff', hashedPassword, 'Staff']
      );
      console.log('Staff user seeded (staff / staff123).');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

module.exports = {
  pool,
  initDb,
  query: (text, params) => pool.query(text, params)
};
