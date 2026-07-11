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
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Research History
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your previous investment research searches.
        </p>
      </div>

      {loading && (
        <div className="border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-50/50">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-slate-500">Loading history...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-3 text-red-600 text-sm mb-6">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="border border-slate-200 rounded-xl p-16 text-center bg-slate-50/50">
          <p className="text-slate-500 text-base mb-6">
            No previous searches found.
          </p>
          <button
            className="bg-blue-600 text-white rounded-lg px-8 py-3.5 text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => onNavigate('home')}
          >
            Start a Search
          </button>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {history.map((item) => {
            // Determine badge colors based on recommendation
            const rec = (item.recommendation || '').toLowerCase();
            const isPositive = rec.includes('invest') || rec.includes('buy');
            const isNegative = rec.includes('pass') || rec.includes('sell');
            
            const badgeClasses = isPositive
              ? 'bg-green-50 text-green-700 border-green-200'
              : isNegative
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {item.company_name}
                      </h3>
                      <p className="text-xs font-mono font-bold text-slate-400 mt-1">
                        {item.symbol}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${badgeClasses}`}
                    >
                      {item.recommendation}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-4">
                    {item.summary}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Confidence</span>
                    <span className="text-slate-900 font-semibold">
                      {item.confidence}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Date</span>
                    <span className="text-slate-600 font-mono text-xs">
                      {new Date(item.created_at).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Time</span>
                    <span className="text-slate-600 font-mono text-xs">
                      {new Date(item.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;