const mysql = require('mysql');
require('dotenv').config();

// Create a connection POOL (best practice)
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'platforme',
});

// Test connection ONCE when server starts
db.getConnection((err, connection) => {
  if (err) {
    console.error(' MySQL connection failed:', err);
  } else {
    console.log(' MySQL pool connected successfully');
    connection.release();
  }
});

module.exports = db;
