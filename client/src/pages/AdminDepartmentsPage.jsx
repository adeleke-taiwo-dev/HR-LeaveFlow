import { useEffect, useState } from 'react';
import { departmentService } from '../services/userService';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadDepartments(); }, []);

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data.data);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await departmentService.create(form);
      toast.success('Department created');
      setShowForm(false);
      setForm({ name: '', description: '' });
      loadDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await departmentService.delete(id);
      toast.success('Department deleted');
      loadDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Departments</h2>
          <p className="page-subtitle">Manage organization departments</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleCreate}>
          <div className="form-row-3">
            <input placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button type="submit" className="btn-create">Create</button>
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
                <th>Description</th>
                <th>Users</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.description || '-'}</td>
                  <td>{d._count?.users || 0}</td>
                  <td>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(d.id)}>
                      Delete
                    </button>
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
