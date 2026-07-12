import { useState, useEffect } from 'react';
import './index.css';
import Auth from './Auth';
import Home from './Home';
import History from './History';
import ChatPanel from './ChatPanel';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [autoSearchQuery, setAutoSearchQuery] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem('investpilot_token');
    const storedUser = localStorage.getItem('investpilot_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setCurrentView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('investpilot_token');
    localStorage.removeItem('investpilot_user');
    setToken(null);
    setUser(null);
    setCurrentView('home');
    setAutoSearchQuery(null);
    setCurrentResult(null);
    setChatOpen(false);
    setChatMessages([]);
  };

  const handleNavigate = (view, searchTicker = null) => {
    setCurrentView(view);
    if (view === 'home' && searchTicker) {
      setAutoSearchQuery(searchTicker);
    }
  };

  if (!token) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <nav className="flex justify-between items-center px-8 py-5 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div
          className="cursor-pointer flex items-center text-slate-900 uppercase"
          onClick={() => handleNavigate('home')}
        >
          <span className="font-black text-lg tracking-[0.15em]">Invest</span>
          <span className="font-light text-lg tracking-[0.25em] ml-1">Pilot</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-1">
            <button
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'home' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              onClick={() => handleNavigate('home')}
            >
              Research
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentView === 'history' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              onClick={() => handleNavigate('history')}
            >
              History
            </button>
          </div>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <span className="text-xs text-slate-500 hidden sm:block">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full">
        <div className={currentView === 'home' ? 'block' : 'hidden'}>
          <Home
            token={token}
            onNavigate={handleNavigate}
            autoSearchQuery={autoSearchQuery}
            onClearAutoSearch={() => setAutoSearchQuery(null)}
            onResultChange={(data) => {
              setCurrentResult(data);
              setChatMessages([]);
            }}
          />
        </div>
        {currentView === 'history' && (
          <History token={token} onNavigate={handleNavigate} />
        )}
      </main>

      {currentResult && !chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium pl-4 pr-5 py-3 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
          </svg>
          Ask AI
        </button>
      )}

      {chatOpen && currentResult && (
        <ChatPanel
          result={currentResult}
          token={token}
          messages={chatMessages}
          onMessagesChange={setChatMessages}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
