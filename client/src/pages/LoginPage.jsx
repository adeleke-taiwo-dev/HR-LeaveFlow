import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (email, password) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>HR LeaveFlow</h1>
          <p>Sign in to your account</p>
        </div>

        <div style={{ marginBottom: '1rem', padding: '0.875rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.813rem', color: '#495057', fontWeight: '600', textAlign: 'center' }}>Demo Accounts (Click to fill)</h3>
          <div style={{ display: 'grid', gap: '0.375rem', fontSize: '0.813rem' }}>
            <div
              onClick={() => fillCredentials('employee@company.com', 'Employee123!')}
              style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e9ecef', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e7f3ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: '600', color: '#0066cc', fontSize: '0.813rem' }}>👤 Employee</div>
              <div style={{ color: '#6c757d', fontSize: '0.688rem' }}>employee@company.com</div>
            </div>
            <div
              onClick={() => fillCredentials('manager@company.com', 'Manager123!')}
              style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e9ecef', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fff4e6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: '600', color: '#ff9900', fontSize: '0.813rem' }}>👔 Manager</div>
              <div style={{ color: '#6c757d', fontSize: '0.688rem' }}>manager@company.com</div>
            </div>
            <div
              onClick={() => fillCredentials('admin@company.com', 'Admin123!')}
              style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e9ecef', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe6e6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ fontWeight: '600', color: '#dc3545', fontSize: '0.813rem' }}>🔐 Admin</div>
              <div style={{ color: '#6c757d', fontSize: '0.688rem' }}>admin@company.com</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
