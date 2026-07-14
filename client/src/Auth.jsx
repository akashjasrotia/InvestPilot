import { useState } from 'react';

function Auth({ onAuth }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      localStorage.setItem('investpilot_token', data.token);
      localStorage.setItem('investpilot_user', JSON.stringify(data.user));
      onAuth(data.token, data.user);
    } catch (err) {
      setError(err.message + "Unable to connect at the moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">InvestPilot</h1>
          <p className="text-sm text-slate-500 mt-1">AI-powered investment research</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full bg-white border border-slate-200 text-slate-900 text-sm px-4 py-2.5 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'register' ? 'Min. 6 characters' : '••••••••'}
                required
                disabled={loading}
                className="w-full bg-white border border-slate-200 text-slate-900 text-sm px-4 py-2.5 rounded-lg outline-none focus:border-blue-500 transition-colors placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                tab === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Research only. Not financial advice.
        </p>
      </div>
    </div>
  );
}

export default Auth;
