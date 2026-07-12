import { useState, useEffect } from 'react';
import './index.css';
import Auth from './Auth';
import Home from './Home';
import History from './History';

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [autoSearchQuery, setAutoSearchQuery] = useState(null);

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
  {/* Premium Typography Logo */}
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
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          currentView === 'home' 
            ? 'bg-blue-600 text-white' 
            : 'text-slate-500 hover:text-slate-900'
        }`}
        onClick={() => handleNavigate('home')}
      >
        Research
      </button>
      <button
        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          currentView === 'history' 
            ? 'bg-blue-600 text-white' 
            : 'text-slate-500 hover:text-slate-900'
        }`}
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
          />
        </div>
        {currentView === 'history' && (
          <History token={token} onNavigate={handleNavigate} />
        )}
      </main>
    </div>
  );
}

export default App;
