const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log("DEBUG: GEMINI_API_KEY from process.env exists:", !!process.env.GEMINI_API_KEY);
console.log("DEBUG: Keys in process.env:", Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('DB')));
const express = require('express');
const cors = require('cors');

const companyService = require('./services/companyService');
const analysisService = require('./services/analysisService');
const databaseService = require('./services/databaseService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Endpoint to research a company
app.post('/api/research', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // 1. Resolve ticker/name to CIK
    const company = await companyService.resolveTickerToCIK(query);
    if (!company) {
      return res.status(404).json({ error: 'Company not found in SEC database' });
    }

    // 2. Fetch financial facts
    const facts = await companyService.getCompanyFacts(company.cik);
    
    // 3. Extract metrics
    const metrics = analysisService.extractMetrics(facts);

    // 4. Generate AI analysis
    const analysis = await analysisService.generateAnalysis(company, metrics);

    // 5. Save to database
    await databaseService.saveSearch(
      query,
      company.ticker,
      company.name,
      analysis.recommendation,
      analysis.confidence,
      analysis.summary,
      { metrics, analysis } // Save everything as JSON for future reference
    );

    // 6. Return the combined result
    res.json({
      company,
      metrics,
      analysis
    });

  } catch (error) {
    console.error('Error processing research request:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Endpoint to get search history
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
