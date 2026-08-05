import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './admin.css';


export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-mark">Z</div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
              Zaevyul
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-caption)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
              Admin Panel
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="field-group">
              <label className="field-label">Email address</label>
              <input
                className="field-input"
                type="email"
                placeholder="you@zaevyul.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--color-text-caption)' }}>
          Demo: <code style={{ fontSize: 11 }}>super@zaevyul.com</code> / <code style={{ fontSize: 11 }}>admin123</code>
        </p>
      </div>
    </div>
  );
}
