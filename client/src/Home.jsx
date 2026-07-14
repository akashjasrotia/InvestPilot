import { useState, useEffect } from 'react';
import { getMockNews } from './utils';

const LOADING_STEPS = [
  "Finding company...",
  "Reading SEC filings...",
  "Calculating financial metrics...",
  "Analyzing recent news...",
  "Generating AI recommendation..."
];

const FREQUENT_COMPANIES = [
  { label: 'Apple', query: 'AAPL', sector: 'Technology' },
  { label: 'NVIDIA', query: 'NVDA', sector: 'Semiconductors' },
  { label: 'Microsoft', query: 'MSFT', sector: 'Technology' },
  { label: 'Tesla', query: 'TSLA', sector: 'EV / Auto' },
  { label: 'Amazon', query: 'AMZN', sector: 'E-Commerce' },
  { label: 'Alphabet', query: 'GOOGL', sector: 'Technology' },
  { label: 'Meta', query: 'META', sector: 'Social Media' },
  { label: 'JPMorgan', query: 'JPM', sector: 'Finance' },
];

function Home({ token, onNavigate, autoSearchQuery, onClearAutoSearch, onResultChange }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [activeChip, setActiveChip] = useState(null);

  // Trigger search automatically when coming from History
  useEffect(() => {
    if (autoSearchQuery) {
      setQuery(autoSearchQuery);
      handleSearch(null, autoSearchQuery);
      if (onClearAutoSearch) onClearAutoSearch();
    }
  }, [autoSearchQuery]);

  // Loading animation pipeline
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1200); // Progress step every 1.2s
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (e, overrideQuery = null) => {
    if (e) e.preventDefault();
    const searchQuery = overrideQuery || query.trim();
    if (!searchQuery) return;

    setLoading(true);
    setError('');
    setResult(null);
    if (onResultChange) onResultChange(null);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${apiBase}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze company');
      }

      setResult(data);
      if (onResultChange) onResultChange(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingStepIndex(LOADING_STEPS.length - 1);
      setActiveChip(null);
    }
  };

  const handleQuickSearch = (company) => {
    setActiveChip(company.query);
    setQuery(company.query);
    handleSearch(null, company.query);
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

      {/* Frequently Searched Companies */}
      {!result && !loading && (
        <div className="mb-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
            Frequently Searched
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FREQUENT_COMPANIES.map((company) => {
              const isActive = activeChip === company.query;
              return (
                <button
                  key={company.query}
                  onClick={() => handleQuickSearch(company)}
                  disabled={loading}
                  className={`
                    group relative flex items-center gap-3 bg-white border rounded-xl px-4 py-3.5
                    text-left transition-all duration-200
                    hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5
                    active:translate-y-0 active:shadow-sm
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
                    ${isActive
                      ? 'border-blue-400 shadow-md bg-blue-50'
                      : 'border-slate-200 shadow-sm'
                    }
                  `}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate transition-colors ${isActive ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-700'}`}>
                      {company.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">
                      {company.query} · {company.sector}
                    </p>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
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

      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-xl mx-auto mb-10">
          <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            AI Analysis Pipeline
          </h3>
          <div className="space-y-4">
            {LOADING_STEPS.map((step, index) => {
              const isCompleted = index < loadingStepIndex;
              const isCurrent = index === loadingStepIndex;
              const isPending = index > loadingStepIndex;

              return (
                <div key={index} className={`flex items-center gap-3 ${isPending ? 'opacity-40' : 'opacity-100'} transition-opacity duration-300`}>
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    {isCompleted && (
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isCurrent && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    )}
                    {isPending && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    )}
                  </div>
                  <span className={`text-sm ${isCurrent ? 'font-medium text-blue-700' : 'text-slate-600'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {result && !loading && (
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
          
          {/* Mock News Section */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Recent News & Sentiment</h3>
            <div className="grid gap-4">
              {getMockNews(result.company.name, result.company.ticker, result.analysis.recommendation).map((news) => (
                <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                          news.sentiment === 'Bullish' ? 'bg-green-50 text-green-700 border-green-200' :
                          news.sentiment === 'Bearish' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {news.sentiment}
                        </span>
                        <span className="text-xs font-medium text-slate-400">{news.date}</span>
                      </div>
                      <h4 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                        {news.headline}
                      </h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {news.summary}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
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