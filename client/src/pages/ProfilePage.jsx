import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [changing, setChanging] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChanging(true);
    try {
      await authService.changePassword(passwords);
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="profile-page">
      <h2 className="page-title">Profile</h2>
      <p className="page-subtitle">Your account information</p>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Account Details</h3>
          <div className="profile-fields">
            <div className="profile-field">
              <span className="field-label">Name</span>
              <span className="field-value">{user?.firstName} {user?.lastName}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Email</span>
              <span className="field-value">{user?.email}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Role</span>
              <span className="field-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Department</span>
              <span className="field-value">{user?.department?.name || 'Not assigned'}</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Min 8 chars, uppercase, lowercase, digit"
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="submit-btn" disabled={changing}>
              {changing ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
