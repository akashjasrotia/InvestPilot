const pool = require('../config/db');

async function saveSearch(query, symbol, companyName, recommendation, confidence, summary, resultJson, userId) {
  try {
    const sql = `
      INSERT INTO search_history 
      (query, symbol, company_name, recommendation, confidence, summary, result_json, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      query, 
      symbol, 
      companyName, 
      recommendation, 
      confidence, 
      summary,
      JSON.stringify(resultJson),
      userId || null
    ]);
    return result.insertId;
  } catch (error) {
    console.error('Error saving search to database:', error);
  }
}

async function getHistory(userId) {
  try {
    const sql = `SELECT * FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`;
    const [rows] = await pool.execute(sql, [userId]);
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
