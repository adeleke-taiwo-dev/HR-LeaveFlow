import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { departmentService } from '../services/userService';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    departmentId: '',
  });
  const [departments, setDepartments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    departmentService.getAll()
      .then((res) => setDepartments(res.data.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = { ...form };
      if (!data.departmentId) delete data.departmentId;
      await authService.register(data);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join HR LeaveFlow</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 8 chars, uppercase, lowercase, digit"
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label htmlFor="departmentId">Department</label>
            <select
              id="departmentId"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
            >
              <option value="">Select department (optional)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
