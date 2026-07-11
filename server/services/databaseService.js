const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'investpilot',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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
  }
}

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
