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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>HR LeaveFlow</h1>
          <p>Sign in to your account</p>
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

        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#495057', fontWeight: '600' }}>Demo Accounts</h3>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ fontWeight: '600', color: '#212529', marginBottom: '0.25rem' }}>Employee</div>
              <div style={{ color: '#6c757d' }}>employee@company.com / Employee123!</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ fontWeight: '600', color: '#212529', marginBottom: '0.25rem' }}>Manager</div>
              <div style={{ color: '#6c757d' }}>manager@company.com / Manager123!</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <div style={{ fontWeight: '600', color: '#212529', marginBottom: '0.25rem' }}>Admin</div>
              <div style={{ color: '#6c757d' }}>admin@company.com / Admin123!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
