import { useState, useEffect, useRef } from 'react';
import { getMockNews } from './utils';

function ChatPanel({ result, token, messages, onMessagesChange, onClose }) {
  const initialGreeting = {
    role: 'assistant',
    content: `Hi! I've read the full analysis for **${result.company.name}**. Ask me anything about their financials, risks, or the recommendation.`,
  };

  const displayMessages = messages.length === 0 ? [initialGreeting] : messages;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, loading]);

  const context = {
    companyName: result.company.name,
    ticker: result.company.ticker,
    recommendation: result.analysis.recommendation,
    confidence: result.analysis.confidence,
    summary: result.analysis.summary,
    keyFactors: result.analysis.keyFactors,
    risks: result.analysis.risks,
    metrics: result.metrics.calculated,
    news: getMockNews(result.company.name, result.company.ticker, result.analysis.recommendation),
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...(messages.length === 0 ? [initialGreeting] : messages), userMsg];
    onMessagesChange(updatedMessages);
    setInput('');
    setLoading(true);
    setError('');

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          context,
          history: updatedMessages,
          message: text,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong.');

      onMessagesChange([...updatedMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6">
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full sm:w-[420px] h-[85vh] sm:h-[600px] bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Ask AI</h3>
            <p className="text-xs text-slate-400 mt-0.5">{result.company.name} · {result.company.ticker}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {displayMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] text-sm leading-relaxed px-4 py-2.5 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="px-4 py-3 border-t border-slate-100 flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${result.company.name}...`}
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPanel;
