const prisma = require('../config/database');
const ApiError = require('../utils/apiError');
const { calculateTotalDays } = require('../utils/dateUtils');
const { LEAVE_STATUS, ROLES } = require('../utils/constants');

async function createLeave(userId, { leaveTypeId, startDate, endDate, reason }) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw new ApiError(400, 'End date must be on or after start date');
  }

  const leaveType = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
  if (!leaveType || !leaveType.isActive) {
    throw new ApiError(404, 'Leave type not found or inactive');
  }

  const totalDays = calculateTotalDays(start, end);

  // Check leave balance
  const currentYear = start.getFullYear();
  const balance = await prisma.leaveBalance.findUnique({
    where: {
      userId_leaveTypeId_year: { userId, leaveTypeId, year: currentYear },
    },
  });

  if (balance) {
    const available = balance.allocated - balance.used - balance.pending;
    if (totalDays > available) {
      throw new ApiError(400, `Insufficient leave balance. Available: ${available} days, Requested: ${totalDays} days`);
    }
  }

  // Check for overlapping leaves
  const overlapping = await prisma.leave.findFirst({
    where: {
      requesterId: userId,
      status: { in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  });

  if (overlapping) {
    throw new ApiError(400, 'You already have a leave request overlapping with these dates');
  }

  const leave = await prisma.$transaction(async (tx) => {
    const newLeave = await tx.leave.create({
      data: {
        requesterId: userId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
      },
      include: {
        requester: { include: { department: true } },
        leaveType: true,
      },
    });

    // Update pending balance
    if (balance) {
      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: { pending: { increment: totalDays } },
      });
    }

    return newLeave;
  });

  return sanitizeLeave(leave);
}

async function getMyLeaves(userId, { status, page = 1, limit = 20 }) {
  const where = { requesterId: userId };
  if (status) where.status = status;

  const [leaves, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      include: { leaveType: true, reviewer: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.leave.count({ where }),
  ]);

  return {
    data: leaves.map(sanitizeLeave),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getTeamLeaves(user, { status, page = 1, limit = 20 }) {
  const where = {};
  if (status) where.status = status;

  // Manager sees only their department; admin sees all
  if (user.role === ROLES.MANAGER) {
    where.requester = { departmentId: user.departmentId };
  }

  const [leaves, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      include: {
        requester: { include: { department: true } },
        leaveType: true,
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.leave.count({ where }),
  ]);

  return {
    data: leaves.map(sanitizeLeave),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getAllLeaves({ status, leaveTypeId, departmentId, startDate, endDate, page = 1, limit = 20 }) {
  const where = {};
  if (status) where.status = status;
  if (leaveTypeId) where.leaveTypeId = leaveTypeId;
  if (departmentId) where.requester = { departmentId };
  if (startDate || endDate) {
    where.startDate = {};
    if (startDate) where.startDate.gte = new Date(startDate);
    if (endDate) where.startDate.lte = new Date(endDate);
  }

  const [leaves, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      include: {
        requester: { include: { department: true } },
        leaveType: true,
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.leave.count({ where }),
  ]);

  return {
    data: leaves.map(sanitizeLeave),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getLeaveById(leaveId, user) {
  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: {
      requester: { include: { department: true } },
      leaveType: true,
      reviewer: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!leave) throw new ApiError(404, 'Leave not found');

  // Check access: owner, manager of same department, or admin
  if (
    leave.requesterId !== user.id &&
    user.role === ROLES.EMPLOYEE
  ) {
    throw new ApiError(403, 'You do not have permission to view this leave');
  }

  if (
    user.role === ROLES.MANAGER &&
    leave.requester.departmentId !== user.departmentId &&
    leave.requesterId !== user.id
  ) {
    throw new ApiError(403, 'You can only view leaves from your department');
  }

  return sanitizeLeave(leave);
}

async function updateLeaveStatus(leaveId, reviewerId, { status, reviewComment }) {
  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: { requester: true },
  });

  if (!leave) throw new ApiError(404, 'Leave not found');
  if (leave.status !== LEAVE_STATUS.PENDING) {
    throw new ApiError(400, 'Only pending leaves can be approved or rejected');
  }

  const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });

  // Manager can only approve/reject within their department
  if (reviewer.role === ROLES.MANAGER && leave.requester.departmentId !== reviewer.departmentId) {
    throw new ApiError(403, 'You can only manage leaves from your department');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedLeave = await tx.leave.update({
      where: { id: leaveId },
      data: {
        status,
        reviewerId,
        reviewComment,
        reviewedAt: new Date(),
      },
      include: {
        requester: { include: { department: true } },
        leaveType: true,
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Update leave balance
    const year = new Date(leave.startDate).getFullYear();
    const balance = await tx.leaveBalance.findUnique({
      where: {
        userId_leaveTypeId_year: {
          userId: leave.requesterId,
          leaveTypeId: leave.leaveTypeId,
          year,
        },
      },
    });

    if (balance) {
      if (status === LEAVE_STATUS.APPROVED) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            pending: { decrement: leave.totalDays },
            used: { increment: leave.totalDays },
          },
        });
      } else if (status === LEAVE_STATUS.REJECTED) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { pending: { decrement: leave.totalDays } },
        });
      }
    }

    return updatedLeave;
  });

  return sanitizeLeave(updated);
}

async function cancelLeave(leaveId, userId) {
  const leave = await prisma.leave.findUnique({ where: { id: leaveId } });

  if (!leave) throw new ApiError(404, 'Leave not found');
  if (leave.requesterId !== userId) {
    throw new ApiError(403, 'You can only cancel your own leaves');
  }
  if (leave.status !== LEAVE_STATUS.PENDING) {
    throw new ApiError(400, 'Only pending leaves can be cancelled');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedLeave = await tx.leave.update({
      where: { id: leaveId },
      data: { status: LEAVE_STATUS.CANCELLED },
      include: {
        requester: { include: { department: true } },
        leaveType: true,
      },
    });

    // Restore pending balance
    const year = new Date(leave.startDate).getFullYear();
    const balance = await tx.leaveBalance.findUnique({
      where: {
        userId_leaveTypeId_year: {
          userId: leave.requesterId,
          leaveTypeId: leave.leaveTypeId,
          year,
        },
      },
    });

    if (balance) {
      await tx.leaveBalance.update({
        where: { id: balance.id },
        data: { pending: { decrement: leave.totalDays } },
      });
    }

    return updatedLeave;
  });

  return sanitizeLeave(updated);
}

async function deleteLeave(leaveId) {
  const leave = await prisma.leave.findUnique({ where: { id: leaveId } });
  if (!leave) throw new ApiError(404, 'Leave not found');

  await prisma.$transaction(async (tx) => {
    // Restore balance if pending or approved
    if (leave.status === LEAVE_STATUS.PENDING || leave.status === LEAVE_STATUS.APPROVED) {
      const year = new Date(leave.startDate).getFullYear();
      const balance = await tx.leaveBalance.findUnique({
        where: {
          userId_leaveTypeId_year: {
            userId: leave.requesterId,
            leaveTypeId: leave.leaveTypeId,
            year,
          },
        },
      });

      if (balance) {
        const update = {};
        if (leave.status === LEAVE_STATUS.PENDING) {
          update.pending = { decrement: leave.totalDays };
        } else {
          update.used = { decrement: leave.totalDays };
        }
        await tx.leaveBalance.update({ where: { id: balance.id }, data: update });
      }
    }

    await tx.leave.delete({ where: { id: leaveId } });
  });
}

function sanitizeLeave(leave) {
  if (leave.requester) {
    const { passwordHash, ...safeRequester } = leave.requester;
    leave.requester = safeRequester;
  }
  return leave;
}

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
