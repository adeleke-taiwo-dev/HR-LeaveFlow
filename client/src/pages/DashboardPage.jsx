import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { leaveService } from '../services/leaveService';
import { leaveBalanceService } from '../services/userService';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate } from '../utils/dateUtils';
import { ROLES } from '../utils/constants';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leavesRes, balancesRes] = await Promise.all([
        user.role === ROLES.ADMIN
          ? leaveService.getAllLeaves({ limit: 5 })
          : user.role === ROLES.MANAGER
          ? leaveService.getTeamLeaves({ limit: 5 })
          : leaveService.getMyLeaves({ limit: 5 }),
        leaveBalanceService.getMyBalances(),
      ]);

      const leavesData = leavesRes.data.data;
      setLeaves(leavesData);
      setBalances(balancesRes.data.data);

      // Calculate stats from all leaves for the count
      const allRes = user.role === ROLES.ADMIN
        ? await leaveService.getAllLeaves({ limit: 1000 })
        : user.role === ROLES.MANAGER
        ? await leaveService.getTeamLeaves({ limit: 1000 })
        : await leaveService.getMyLeaves({ limit: 1000 });

      const all = allRes.data.data;
      setStats({
        total: all.length,
        pending: all.filter((l) => l.status === 'pending').length,
        approved: all.filter((l) => l.status === 'approved').length,
        rejected: all.filter((l) => l.status === 'rejected').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  return (
    <div className="dashboard-page">
      <h2 className="page-title">Dashboard</h2>
      <p className="page-subtitle">
        {user.role === ROLES.ADMIN
          ? 'Organization overview'
          : user.role === ROLES.MANAGER
          ? 'Team overview'
          : 'Your leave overview'}
      </p>

      <div className="stats-grid">
        <StatCard label="Total Leaves" value={stats.total} icon={<HiOutlineClipboardList />} colorClass="blue" />
        <StatCard label="Pending" value={stats.pending} icon={<HiOutlineClock />} colorClass="orange" />
        <StatCard label="Approved" value={stats.approved} icon={<HiOutlineCheckCircle />} colorClass="green" />
        <StatCard label="Rejected" value={stats.rejected} icon={<HiOutlineXCircle />} colorClass="red" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Recent Leaves</h3>
          {leaves.length === 0 ? (
            <p className="empty-text">No leave requests yet</p>
          ) : (
            <div className="recent-leaves">
              {leaves.map((leave) => (
                <div key={leave.id} className="recent-leave-item">
                  <div className="recent-leave-info">
                    <span className="recent-leave-type">{leave.leaveType?.name}</span>
                    {leave.requester && (
                      <span className="recent-leave-name">
                        {leave.requester.firstName} {leave.requester.lastName}
                      </span>
                    )}
                    <span className="recent-leave-dates">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </span>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Leave Balance</h3>
          {balances.length === 0 ? (
            <p className="empty-text">No balance data</p>
          ) : (
            <div className="balance-list">
              {balances.map((b) => (
                <div key={b.id} className="balance-item">
                  <div className="balance-info">
                    <span className="balance-type">{b.leaveType?.name}</span>
                    <span className="balance-detail">
                      {b.remaining} of {b.allocated} remaining
                    </span>
                  </div>
                  <div className="balance-bar">
                    <div
                      className="balance-bar-fill"
                      style={{
                        width: `${b.allocated > 0 ? ((b.used + b.pending) / b.allocated) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
