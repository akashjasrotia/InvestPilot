import { useState } from 'react';

function Home() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze company');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="hero">
        <h1>Intelligent Stock Research</h1>
        <p>Enter a company name or ticker symbol to get an AI-powered fundamental analysis and investment recommendation.</p>
      </div>

      <form className="search-container" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder="e.g., Apple or AAPL"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="search-btn" disabled={loading || !query.trim()}>
          {loading ? 'Analyzing...' : 'Research'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Fetching SEC filings and analyzing data...</div>}

      {result && (
        <div className="results-container">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>
            {result.company.name} ({result.company.ticker})
          </h2>

          <div className="dashboard-grid">
            {/* AI Recommendation Card */}
            <div className="card">
              <h3>AI Recommendation</h3>
              <div className="recommendation-card">
                <div className={`rec-value ${result.analysis.recommendation === 'Invest' ? 'rec-invest' : 'rec-pass'}`}>
                  {result.analysis.recommendation}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="metric-label">Confidence</div>
                  <div className="metric-value">{result.analysis.confidence}%</div>
                </div>
              </div>
              <div className="confidence-meter">
                <div 
                  className="confidence-fill" 
                  style={{ width: `${result.analysis.confidence}%` }}
                ></div>
              </div>
              <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                {result.analysis.summary}
              </p>
            </div>

            {/* Financial Metrics Card */}
            <div className="card">
              <h3>Key Metrics (Latest 10-K)</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Revenue Growth</span>
                  <span className="metric-value">{result.metrics.calculated.revenueGrowth}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Profit Margin</span>
                  <span className="metric-value">{result.metrics.calculated.profitMargin}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Debt to Equity</span>
                  <span className="metric-value">{result.metrics.calculated.debtToEquity}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Return on Equity</span>
                  <span className="metric-value">{result.metrics.calculated.returnOnEquity}</span>
                </div>
              </div>
            </div>

            {/* Key Factors Card */}
            <div className="card">
              <h3>Bull Case Factors</h3>
              <div>
                {result.analysis.keyFactors.map((factor, index) => (
                  <div key={index} className="list-item">{factor}</div>
                ))}
              </div>
            </div>

            {/* Risks Card */}
            <div className="card">
              <h3>Risk Factors</h3>
              <div>
                {result.analysis.risks.map((risk, index) => (
                  <div key={index} className="list-item" style={{ color: 'var(--danger-color)' }}>
                    {risk}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
