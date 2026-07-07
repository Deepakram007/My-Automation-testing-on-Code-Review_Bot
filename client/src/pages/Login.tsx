import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simulate basic authentication
    if (email === 'admin@example.com' && password === 'password123') {
      localStorage.setItem('auth_token', 'fake-jwt-token');
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
      <div style={{ background: 'var(--bg-elevated)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border)', width: '300px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-main)' }}>Sign In</h2>
        {error && <div style={{ color: 'var(--red-400)', marginBottom: '1rem', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '14px' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-main)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '14px' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-base)', color: 'var(--text-main)' }}
            />
          </div>
          <button type="submit" style={{ background: 'var(--purple-500)', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
