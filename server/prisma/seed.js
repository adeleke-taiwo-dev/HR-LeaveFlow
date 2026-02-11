const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: { name: 'Engineering', description: 'Software development and engineering' },
    }),
    prisma.department.upsert({
      where: { name: 'Human Resources' },
      update: {},
      create: { name: 'Human Resources', description: 'People operations and HR' },
    }),
    prisma.department.upsert({
      where: { name: 'Finance' },
      update: {},
      create: { name: 'Finance', description: 'Financial operations and accounting' },
    }),
    prisma.department.upsert({
      where: { name: 'Marketing' },
      update: {},
      create: { name: 'Marketing', description: 'Marketing and communications' },
    }),
    prisma.department.upsert({
      where: { name: 'Operations' },
      update: {},
      create: { name: 'Operations', description: 'Business operations and logistics' },
    }),
  ]);

  console.log(`Created ${departments.length} departments`);

  // Create leave types
  const leaveTypes = await Promise.all([
    prisma.leaveType.upsert({
      where: { name: 'Annual Leave' },
      update: {},
      create: { name: 'Annual Leave', description: 'Paid annual vacation leave', defaultDaysPerYear: 21 },
    }),
    prisma.leaveType.upsert({
      where: { name: 'Sick Leave' },
      update: {},
      create: { name: 'Sick Leave', description: 'Paid sick leave for illness or medical appointments', defaultDaysPerYear: 10 },
    }),
    prisma.leaveType.upsert({
      where: { name: 'Personal Leave' },
      update: {},
      create: { name: 'Personal Leave', description: 'Leave for personal matters', defaultDaysPerYear: 5 },
    }),
    prisma.leaveType.upsert({
      where: { name: 'Maternity/Paternity Leave' },
      update: {},
      create: { name: 'Maternity/Paternity Leave', description: 'Leave for new parents', defaultDaysPerYear: 90 },
    }),
    prisma.leaveType.upsert({
      where: { name: 'Unpaid Leave' },
      update: {},
      create: { name: 'Unpaid Leave', description: 'Unpaid leave of absence', defaultDaysPerYear: 30 },
    }),
    prisma.leaveType.upsert({
      where: { name: 'Compassionate Leave' },
      update: {},
      create: { name: 'Compassionate Leave', description: 'Leave for bereavement or family emergencies', defaultDaysPerYear: 5 },
    }),
  ]);

  console.log(`Created ${leaveTypes.length} leave types`);

  // Create admin user
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      passwordHash,
      firstName: 'HR',
      lastName: 'Admin',
      role: 'admin',
      departmentId: departments[1].id, // HR department
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  // Create a sample manager
  const managerHash = await bcrypt.hash('Manager123!', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: {
      email: 'manager@company.com',
      passwordHash: managerHash,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'manager',
      departmentId: departments[0].id, // Engineering
    },
  });

  console.log(`Created manager user: ${manager.email}`);

  // Create a sample employee
  const employeeHash = await bcrypt.hash('Employee123!', 12);
  const employee = await prisma.user.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      email: 'employee@company.com',
      passwordHash: employeeHash,
      firstName: 'John',
      lastName: 'Doe',
      role: 'employee',
      departmentId: departments[0].id, // Engineering
    },
  });

  console.log(`Created employee user: ${employee.email}`);

  // Create leave balances for the current year
  const currentYear = new Date().getFullYear();
  const users = [admin, manager, employee];

  for (const user of users) {
    for (const leaveType of leaveTypes) {
      await prisma.leaveBalance.upsert({
        where: {
          userId_leaveTypeId_year: {
            userId: user.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
          },
        },
        update: {},
        create: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          year: currentYear,
          allocated: leaveType.defaultDaysPerYear,
          used: 0,
          pending: 0,
        },
      });
    }
  }

  console.log(`Created leave balances for ${users.length} users`);
  console.log('\nSeed completed successfully!');
  console.log('\nDefault accounts:');
  console.log('  Admin:    admin@company.com    / Admin123!');
  console.log('  Manager:  manager@company.com  / Manager123!');
  console.log('  Employee: employee@company.com / Employee123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
