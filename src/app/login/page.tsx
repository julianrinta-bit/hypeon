'use client';

import { useState, type FormEvent } from 'react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));

    setLoading(false);
    setError('Incorrect email or password.');
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <a href="/" className="login-logo" aria-label="Back to home">
          <span className="nav-logo-slash">//</span>
          <span className="nav-logo-text">HYPE ON</span>
        </a>
        <h1 className="login-title">Client Portal</h1>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="login-input"
            placeholder="you@company.com"
          />

          <label className="login-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="login-input"
            placeholder="••••••••"
          />

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
