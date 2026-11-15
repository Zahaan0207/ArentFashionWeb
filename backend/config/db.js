const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arent_fashion_db',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_HOST.includes('tidbcloud.com') ? { rejectUnauthorized: true } : null
});

module.exports = pool;