import { useEffect, useState } from 'react';
import { leaveService } from '../services/leaveService';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import './LeavesPage.css';

export default function TeamLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeaves(); }, [filter]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter) params.status = filter;
      const res = await leaveService.getTeamLeaves(params);
      setLeaves(res.data.data);
    } catch (err) {
      toast.error('Failed to load team leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    const comment = status === 'rejected'
      ? window.prompt('Reason for rejection (optional):') || ''
      : '';
    try {
      await leaveService.updateStatus(id, { status, reviewComment: comment });
      toast.success(`Leave ${status}`);
      loadLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="leaves-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Team Leaves</h2>
          <p className="page-subtitle">Review and manage team leave requests</p>
        </div>
      </div>

      <div className="filter-bar">
        {['', 'pending', 'pending_hr', 'approved', 'rejected', 'cancelled'].map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'pending_hr' ? 'Awaiting HR' : (s || 'All')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="empty-text">Loading...</p>
      ) : leaves.length === 0 ? (
        <div className="empty-state">
          <p>No team leave requests found</p>
        </div>
      ) : (
        <div className="leaves-list">
          {leaves.map((leave) => (
            <div key={leave.id} className="leave-card">
              <div className="leave-card-header">
                <span className="leave-card-type">{leave.leaveType?.name}</span>
                <StatusBadge status={leave.status} />
              </div>
              <div className="leave-card-name">
                {leave.requester?.firstName} {leave.requester?.lastName}
                {leave.requester?.department && (
                  <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.5rem', fontSize: '0.85rem' }}>
                    ({leave.requester.department.name})
                  </span>
                )}
              </div>
              <div className="leave-card-dates">
                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                <span className="leave-card-days">{leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="leave-card-reason">{leave.reason}</div>

              {/* Multi-level approval info */}
              {(leave.managerReviewer || leave.hrReviewer) && (
                <div className="approval-info">
                  {leave.managerReviewer && (
                    <div className="approval-step">
                      <strong>Manager:</strong> Approved by {leave.managerReviewer.firstName} {leave.managerReviewer.lastName}
                      {leave.managerComment && <div className="approval-comment">"{leave.managerComment}"</div>}
                    </div>
                  )}
                  {leave.hrReviewer && (
                    <div className="approval-step">
                      <strong>HR:</strong> {leave.status === 'approved' ? 'Approved' : 'Reviewed'} by {leave.hrReviewer.firstName} {leave.hrReviewer.lastName}
                      {leave.hrComment && <div className="approval-comment">"{leave.hrComment}"</div>}
                    </div>
                  )}
                </div>
              )}

              {(leave.status === 'pending' || leave.status === 'pending_hr') && (
                <div className="leave-card-actions">
                  <button className="btn-action btn-approve" onClick={() => handleAction(leave.id, 'approved')}>
                    Approve
                  </button>
                  <button className="btn-action btn-reject" onClick={() => handleAction(leave.id, 'rejected')}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
