import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService } from '../services/leaveService';
import { leaveBalanceService } from '../services/userService';
import { calculateDays } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import './LeavesPage.css';

export default function NewLeavePage() {
  const [form, setForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [balances, setBalances] = useState([]);
  const [days, setDays] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    leaveBalanceService.getMyBalances()
      .then((res) => setBalances(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.startDate && form.endDate) {
      const d = calculateDays(form.startDate, form.endDate);
      setDays(d > 0 ? d : 0);
    } else {
      setDays(0);
    }
  }, [form.startDate, form.endDate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedBalance = balances.find((b) => b.leaveType?.id === form.leaveTypeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await leaveService.create(form);
      toast.success('Leave request submitted!');
      navigate('/leaves/my');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="leaves-page">
      <h2 className="page-title">New Leave Request</h2>
      <p className="page-subtitle">Submit a new leave request</p>

      <div className="leave-form-card" style={{ marginTop: '1.5rem' }}>
        {days > 0 && (
          <div className="days-indicator">
            <div className="days-indicator-label">Total Days</div>
            <div className="days-indicator-value">{days}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="leaveTypeId">Leave Type</label>
            <select
              id="leaveTypeId"
              name="leaveTypeId"
              value={form.leaveTypeId}
              onChange={handleChange}
              required
            >
              <option value="">Select leave type</option>
              {balances.map((b) => (
                <option key={b.leaveType.id} value={b.leaveType.id}>
                  {b.leaveType.name} ({b.remaining} days remaining)
                </option>
              ))}
            </select>
          </div>

          {selectedBalance && (
            <div style={{
              padding: '0.5rem 1rem',
              background: '#f0fdf4',
              borderRadius: '8px',
              fontSize: '0.813rem',
              color: '#065f46',
              marginBottom: '1.25rem',
            }}>
              Balance: {selectedBalance.allocated} allocated, {selectedBalance.used} used, {selectedBalance.pending} pending, <strong>{selectedBalance.remaining} remaining</strong>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <textarea
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Enter reason for leave request"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
