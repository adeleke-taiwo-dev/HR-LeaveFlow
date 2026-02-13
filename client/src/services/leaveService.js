import api from './api';

export const leaveService = {
  create: (data) => api.post('/leaves', data),
  getMyLeaves: (params) => api.get('/leaves/my', { params }),
  getTeamLeaves: (params) => api.get('/leaves/team', { params }),
  getAllLeaves: (params) => api.get('/leaves', { params }),
  getCalendarLeaves: (params) => api.get('/leaves/calendar', { params }),
  getById: (id) => api.get(`/leaves/${id}`),
  updateStatus: (id, data) => api.patch(`/leaves/${id}/status`, data),
  cancel: (id) => api.patch(`/leaves/${id}/cancel`),
  delete: (id) => api.delete(`/leaves/${id}`),
};
