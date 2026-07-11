import { useState } from 'react';
import './index.css';
import Home from './Home';
import History from './History';

function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <nav className="flex justify-between items-center px-8 py-5 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="font-bold text-lg tracking-tight cursor-pointer text-slate-900" onClick={() => setCurrentView('home')}>
          InvestPilot
        </div>
        <div className="flex gap-1">
          <button
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'home' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setCurrentView('home')}
          >
            Research
          </button>
          <button
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'history' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
            onClick={() => setCurrentView('history')}
          >
            History
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full">
        {currentView === 'home' ? (
          <Home onNavigate={setCurrentView} />
        ) : (
          <History onNavigate={setCurrentView} />
        )}
      </main>
    </div>
  );
}

export default App;
