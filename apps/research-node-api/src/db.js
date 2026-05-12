/**
 * db.js - Database connection and initialization
 */

import pg from 'pg';
const { Pool } = pg;

// TODO: PostgreSQL connection configuration for production
// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

let pool = null;

/**
 * Check if DB is available (Mock check for now)
 */
export async function isDbConnected() {
  if (!pool) return false;
  try {
    // const res = await pool.query('SELECT NOW()');
    // return !!res;
    return false; // Force fallback while in mock/dev phase
  } catch (err) {
    console.error('DB Connection error:', err);
    return false;
  }
}

/**
 * Execute query with fallback mechanism
 */
export async function query(text, params) {
  if (await isDbConnected()) {
    return pool.query(text, params);
  }
  throw new Error('DB_NOT_CONNECTED');
}

export default {
  query,
  isDbConnected
};
