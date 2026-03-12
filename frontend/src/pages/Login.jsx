import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(username, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2.5rem' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              padding: '1rem',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              <Package size={32} color="white" />
            </div>
          </div>
          <h1 className="title text-gradient" style={{ fontSize: '1.75rem' }}>Inventory Pro</h1>
          <p className="subtitle">Sign in to manage your inventory</p>
        </div>
        
        {error && (
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="username" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Username</label>
            <input 
              id="username"
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              id="password"
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p>Default Admin: admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
