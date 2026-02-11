import { useEffect, useState } from 'react';
import { leaveBalanceService } from '../services/userService';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function AdminLeaveTypesPage() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // For now, show leave types from the current user's balances
      // In production, you'd have a dedicated leave types endpoint
      const res = await leaveBalanceService.getMyBalances();
      setBalances(res.data.data);
    } catch (err) {
      toast.error('Failed to load leave types');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Leave Types</h2>
          <p className="page-subtitle">View and manage leave type configurations</p>
        </div>
      </div>

      {loading ? (
        <p className="empty-text">Loading...</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Default Days/Year</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.leaveType?.id}>
                  <td style={{ fontWeight: 600 }}>{b.leaveType?.name}</td>
                  <td>{b.allocated}</td>
                  <td>
                    <span className="status-dot active">Active</span>
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
