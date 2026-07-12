const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // load env
const express = require('express');
const cors = require('cors');
require("dotenv").config();
const databaseService = require('./services/databaseService');
const { runInvestmentChain } = require('./ai/investmentChain');
const { registerUser, loginUser } = require('./services/authService');
const { requireAuth } = require('./middleware/auth');
const { chatWithAnalyst } = require('./services/chatService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const result = await registerUser(email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/research', requireAuth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await runInvestmentChain(query);

    await databaseService.saveSearch(
      query,
      result.company.ticker,
      result.company.name,
      result.analysis.recommendation,
      result.analysis.confidence,
      result.analysis.summary,
      { metrics: result.metrics, analysis: result.analysis },
      req.userId
    );

    res.json(result);

  } catch (error) {
    console.error('Error processing research request:', error);
    const status = error.message.includes('Company not found') ? 404 : 500;
    res.status(status).json({ error: error.message || 'Internal Server Error' });
  }
});

app.get('/api/history', requireAuth, async (req, res) => {
  try {
    const history = await databaseService.getHistory(req.userId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/chat', requireAuth, async (req, res) => {
  try {
    const { context, history, message } = req.body;
    if (!message || !context) {
      return res.status(400).json({ error: 'message and context are required.' });
    }
    const reply = await chatWithAnalyst(context, history || [], message);
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to get a response. Please try again.' });
  }
});

const pool = require('./config/db');

async function initDB() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to the database.');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        query VARCHAR(255) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        recommendation VARCHAR(50) NOT NULL,
        confidence INT NOT NULL,
        summary TEXT,
        result_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    connection.release();
    console.log('✅ Database tables initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
