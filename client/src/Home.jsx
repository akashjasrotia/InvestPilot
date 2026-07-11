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
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">Stock Research</h1>
        <p className="text-slate-500 text-sm">Enter a company name or ticker to get an AI-powered investment analysis.</p>
      </div>

      <form className="flex gap-2 mb-10" onSubmit={handleSearch}>
        <input
          type="text"
          className="flex-1 bg-white border border-slate-200 text-slate-900 text-sm px-4 py-3 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
          placeholder="e.g., Apple or AAPL"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={loading || !query.trim()}
        >
          {loading ? 'Analyzing...' : 'Research'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-3 text-red-600 text-sm mb-6">
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {loading && (
        <div className="border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-50/50">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-slate-500">Fetching SEC filings and analyzing data...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="pb-5 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">{result.company.name}</h2>
            <p className="text-xs font-mono font-bold text-slate-400 mt-1">{result.company.ticker}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">Recommendation</p>
              <div className="flex items-end justify-between mb-4">
                <span className={`text-3xl font-extrabold ${result.analysis.recommendation === 'Invest' ? 'text-green-600' : 'text-red-600'}`}>
                  {result.analysis.recommendation}
                </span>
                <span className="text-slate-500 text-sm font-medium">{result.analysis.confidence}% confidence</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${result.analysis.confidence}%` }}
                />
              </div>
              <p className="text-slate-650 text-sm leading-relaxed">{result.analysis.summary}</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">Key Metrics</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Revenue Growth</p>
                  <p className="text-slate-900 font-semibold text-lg">{result.metrics.calculated.revenueGrowth}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Profit Margin</p>
                  <p className="text-slate-900 font-semibold text-lg">{result.metrics.calculated.profitMargin}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Debt to Equity</p>
                  <p className="text-slate-900 font-semibold text-lg">{result.metrics.calculated.debtToEquity}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Return on Equity</p>
                  <p className="text-slate-900 font-semibold text-lg">{result.metrics.calculated.returnOnEquity}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4 text-green-700">Bull Case</p>
              <ul className="space-y-3">
                {result.analysis.keyFactors.map((factor, index) => (
                  <li key={index} className="flex gap-2 text-sm text-slate-600 leading-relaxed">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4 text-red-700">Risk Factors</p>
              <ul className="space-y-3">
                {result.analysis.risks.map((risk, index) => (
                  <li key={index} className="flex gap-2 text-sm text-slate-655 leading-relaxed">
                    <span className="text-red-500 font-bold">⚠</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-16 pt-8 border-t border-slate-200">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">System Reference Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-4">Target Benchmarks</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Operating Margin</span>
                <span className="font-medium text-slate-800">&gt; 15.0% Healthy</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Debt-to-Equity (D/E)</span>
                <span className="font-medium text-slate-800">&lt; 2.0x Low Risk</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-500">Return on Equity (ROE)</span>
                <span className="font-medium text-slate-800">&gt; 10.0% Efficient</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Agent Decision Logic</h4>
            <p className="text-xs text-slate-550 leading-relaxed">
              The agent utilizes dual-track processing. When a valid API key is present, Gemini evaluates custom prompt directives. In offline mode, the system falls back to strict deterministic logic checking operating margins and debt coverage metrics.
            </p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Disclaimer</p>
          <p className="text-xs text-slate-450 leading-relaxed max-w-2xl mx-auto">
            This simulator aggregates historical reports. It does not constitute investment advice or buy/sell recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;