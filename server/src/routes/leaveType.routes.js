const express = require('express');
const leaveTypeController = require('../controllers/leaveType.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all leave types (all authenticated users)
router.get('/', leaveTypeController.getAll);

// Get specific leave type
router.get('/:id', leaveTypeController.getById);

// Admin-only routes
router.post('/', authorize('admin'), leaveTypeController.create);
router.patch('/:id', authorize('admin'), leaveTypeController.update);
router.delete('/:id', authorize('admin'), leaveTypeController.delete);

module.exports = router;
