import { useEffect, useState } from 'react';
import { userService, departmentService } from '../services/userService';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', role: 'employee', departmentId: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersRes, deptsRes] = await Promise.all([
        userService.getUsers({ limit: 100 }),
        departmentService.getAll(),
      ]);
      setUsers(usersRes.data.data);
      setDepartments(deptsRes.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (!data.departmentId) delete data.departmentId;
      await userService.create(data);
      toast.success('User created');
      setShowForm(false);
      setForm({ email: '', password: '', firstName: '', lastName: '', role: 'employee', departmentId: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await userService.updateRole(userId, { role });
      toast.success('Role updated');
      loadData();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await userService.deactivate(userId);
      toast.success('User deactivated');
      loadData();
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">User Management</h2>
          <p className="page-subtitle">Manage system users</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleCreate}>
          <div className="form-row-4">
            <input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          </div>
          <div className="form-row-3">
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
              <option value="">No department</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button type="submit" className="btn-create">Create User</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="empty-text">Loading...</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{u.department?.name || '-'}</td>
                  <td>
                    <span className={`status-dot ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {u.isActive && (
                      <button className="btn-action btn-delete" onClick={() => handleDeactivate(u.id)}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
