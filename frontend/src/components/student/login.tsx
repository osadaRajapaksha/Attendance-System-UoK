import React, { useState } from 'react';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './signup';

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

type LoginProps = {
  onLogin?: () => void;
};

export default function Login({ onLogin }: LoginProps): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const LOGIN_API_URL = 'http://172.20.96.202:8081/api/auth/login';

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      const resp = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        setError(body?.message || 'Login failed');
        return;
      }

      const body = await resp.json().catch(() => null);
      const token = body?.token ?? body?.accessToken;

      if (!token) {
        setError('Invalid credentials');
        return;
      }

      // Store token and any available user info so App can route appropriately
      localStorage.setItem('token', token);

      // Extract role/username from common response shapes
      const rawRole = body?.role ?? body?.user?.role ?? body?.roles ?? null;
      const roleString = rawRole?.name ?? (typeof rawRole === 'string' ? rawRole : null);
      if (roleString) localStorage.setItem('role', roleString);

      const username = body?.username ?? body?.user?.username ?? body?.user?.email ?? body?.email ?? null;
      if (username) localStorage.setItem('username', username);

      onLogin?.();
    } catch (err: any) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (showSignup) {
    return <Signup onSignupSuccess={() => setShowSignup(false)} />;
  }

  return (
    
    <div
      className="login-card auth-bg d-flex align-items-center justify-content-center min-vh-100"
    
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card shadow-lg border-0"
        style={{ maxWidth: 420, width: '100%', borderRadius: 16 }}
      >
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#6b1d1d' }}>eKelaniya</h2>
            <p className="text-muted mb-0">University of Kelaniya</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="Username / Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-100"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <div className="text-center mt-3">
            <a href="#" className="text-decoration-none">Lost password?</a>
          </div>

          <div className="text-center mt-3">
            <button
              className="btn btn-link"
              onClick={() => setShowSignup(true)}
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
