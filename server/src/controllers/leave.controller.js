const leaveService = require('../services/leave.service');
const catchAsync = require('../utils/catchAsync');

const createLeave = catchAsync(async (req, res) => {
  const leave = await leaveService.createLeave(req.user.id, req.validated.body);
  res.status(201).json({
    success: true,
    data: leave,
    message: 'Leave request submitted successfully',
  });
});

const getMyLeaves = catchAsync(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await leaveService.getMyLeaves(req.user.id, {
    status,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });
  res.json({ success: true, ...result });
});

const getTeamLeaves = catchAsync(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await leaveService.getTeamLeaves(req.user, {
    status,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });
  res.json({ success: true, ...result });
});

const getAllLeaves = catchAsync(async (req, res) => {
  const { status, leaveTypeId, departmentId, startDate, endDate, page, limit } = req.query;
  const result = await leaveService.getAllLeaves({
    status,
    leaveTypeId,
    departmentId,
    startDate,
    endDate,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });
  res.json({ success: true, ...result });
});

const getLeaveById = catchAsync(async (req, res) => {
  const leave = await leaveService.getLeaveById(req.params.id, req.user);
  res.json({ success: true, data: leave });
});

const updateLeaveStatus = catchAsync(async (req, res) => {
  const leave = await leaveService.updateLeaveStatus(
    req.params.id,
    req.user.id,
    req.validated.body
  );
  res.json({
    success: true,
    data: leave,
    message: `Leave ${req.validated.body.status} successfully`,
  });
});

const cancelLeave = catchAsync(async (req, res) => {
  const leave = await leaveService.cancelLeave(req.params.id, req.user.id);
  res.json({
    success: true,
    data: leave,
    message: 'Leave cancelled successfully',
  });
});

const deleteLeave = catchAsync(async (req, res) => {
  await leaveService.deleteLeave(req.params.id);
  res.json({
    success: true,
    message: 'Leave deleted successfully',
  });
});

module.exports = {
  createLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  getLeaveById,
  updateLeaveStatus,
  cancelLeave,
  deleteLeave,
};
