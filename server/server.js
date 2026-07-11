const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const databaseService = require('./services/databaseService');
const { runInvestmentChain } = require('./ai/investmentChain');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/research', async (req, res) => {
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
      { metrics: result.metrics, analysis: result.analysis }
    );

    res.json(result);

  } catch (error) {
    console.error('Error processing research request:', error);
    const status = error.message.includes('Company not found') ? 404 : 500;
    res.status(status).json({ error: error.message || 'Internal Server Error' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const history = await databaseService.getHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
