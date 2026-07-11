import { useState, useEffect } from 'react';

function History({ onNavigate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/history');
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="results-container">
      <h2 className="history-title">Search History</h2>
      
      {loading && <div className="loading">Loading history...</div>}
      
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && history.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No previous searches found.</p>
          <button 
            className="search-btn" 
            style={{ marginTop: '1rem' }}
            onClick={() => onNavigate('home')}
          >
            Start a Search
          </button>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-info">
                <h4>{item.company_name} ({item.symbol})</h4>
                <p>Searched on: {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}</p>
                <p style={{ marginTop: '0.5rem' }}>{item.summary}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`history-tag ${item.recommendation === 'Invest' ? 'tag-invest' : 'tag-pass'}`}>
                  {item.recommendation} ({item.confidence}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;
