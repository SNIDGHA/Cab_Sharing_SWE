import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import './AuthPage.css';

const AuthPage = () => {
  const { login, loginWithEmail, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('login');         // 'login' | 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm) {
      return setError('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      {/* Animated blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="auth-card">
        {/* Logo / title */}
        <div className="auth-logo">
          <span className="auth-logo-icon">🚗</span>
          <h1 className="auth-title">GoTogether</h1>
          <p className="auth-subtitle">Share rides. Save money. Travel together.</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            id="tab-login"
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            id="tab-register"
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && <div className="auth-error">{error}</div>}

        {/* ——— LOGIN FORM ——— */}
        {tab === 'login' && (
          <form id="form-login" className="auth-form" onSubmit={handleLoginSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button id="btn-login" type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Sign In'}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <button id="btn-google-login" type="button" className="auth-btn-google" onClick={login}>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width="20"
                height="20"
              />
              Continue with Google
            </button>
          </form>
        )}

        {/* ——— REGISTER FORM ——— */}
        {tab === 'register' && (
          <form id="form-register" className="auth-form" onSubmit={handleRegisterSubmit}>
            <div className="auth-field">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                name="confirm"
                placeholder="••••••••"
                value={formData.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button id="btn-register" type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Create Account'}
            </button>

            <div className="auth-divider"><span>or</span></div>

            <button id="btn-google-register" type="button" className="auth-btn-google" onClick={login}>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                width="20"
                height="20"
              />
              Sign up with Google
            </button>
          </form>
        )}

        <p className="auth-footer">
          {tab === 'login'
            ? <>No account? <button className="auth-link" onClick={() => { setTab('register'); setError(''); }}>Register</button></>
            : <>Have an account? <button className="auth-link" onClick={() => { setTab('login'); setError(''); }}>Sign In</button></>
          }
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
