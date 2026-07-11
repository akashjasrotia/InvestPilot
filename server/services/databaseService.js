const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool instead of a single connection
// This handles reconnects and multiple requests efficiently.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'investpilot',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Saves a completed analysis to the search_history table
 */
async function saveSearch(query, symbol, companyName, recommendation, confidence, summary, resultJson) {
  try {
    const sql = `
      INSERT INTO search_history 
      (query, symbol, company_name, recommendation, confidence, summary, result_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      query, 
      symbol, 
      companyName, 
      recommendation, 
      confidence, 
      summary,
      JSON.stringify(resultJson)
    ]);
    return result.insertId;
  } catch (error) {
    console.error('Error saving search to database:', error);
    // Don't throw so the API can still return the result even if DB fails
  }
}

/**
 * Retrieves past searches for the History page
 */
async function getHistory() {
  try {
    const sql = `SELECT * FROM search_history ORDER BY created_at DESC LIMIT 50`;
    const [rows] = await pool.execute(sql);
    return rows;
  } catch (error) {
    console.error('Error fetching history from database:', error);
    return [];
  }
}

module.exports = {
  saveSearch,
  getHistory
};
