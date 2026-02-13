const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflow.controller');
const authorize = require('../middleware/roleCheck');

// All workflow routes require admin access
router.get('/', authorize('admin'), workflowController.getAllWorkflows);
router.get('/leave-type/:leaveTypeId', authorize('admin'), workflowController.getWorkflowByLeaveType);
router.post('/', authorize('admin'), workflowController.createWorkflow);
router.patch('/:id', authorize('admin'), workflowController.updateWorkflow);
router.delete('/:id', authorize('admin'), workflowController.deleteWorkflow);

module.exports = router;
