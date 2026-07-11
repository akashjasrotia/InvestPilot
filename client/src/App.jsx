import { useState } from 'react';
import './index.css';
import Home from './Home';
import History from './History';

function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo" onClick={() => setCurrentView('home')}>
          <span>AI</span> InvestPilot
        </div>
        <div className="nav-links">
          <button 
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            Research
          </button>
          <button 
            className={`nav-btn ${currentView === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentView('history')}
          >
            History
          </button>
        </div>
      </nav>

      {/* Main Content Area - Simple conditional rendering instead of React Router */}
      <main className="main-content">
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
