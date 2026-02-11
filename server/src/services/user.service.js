const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const ApiError = require('../utils/apiError');

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function getUsers({ page = 1, limit = 20, departmentId, role, search }) {
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { department: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users.map(sanitizeUser),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { department: true },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return sanitizeUser(user);
}

async function createUser({ email, password, firstName, lastName, role, departmentId }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role, departmentId },
    include: { department: true },
  });

  // Create leave balances
  const currentYear = new Date().getFullYear();
  const leaveTypes = await prisma.leaveType.findMany({ where: { isActive: true } });
  await Promise.all(
    leaveTypes.map((lt) =>
      prisma.leaveBalance.create({
        data: {
          userId: user.id,
          leaveTypeId: lt.id,
          year: currentYear,
          allocated: lt.defaultDaysPerYear,
        },
      })
    )
  );

  return sanitizeUser(user);
}

async function updateUser(userId, data) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    include: { department: true },
  });
  return sanitizeUser(user);
}

async function updateUserRole(userId, role) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
    include: { department: true },
  });
  return sanitizeUser(user);
}

async function deactivateUser(userId) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    include: { department: true },
  });
  return sanitizeUser(user);
}

module.exports = { getUsers, getUserById, createUser, updateUser, updateUserRole, deactivateUser };
