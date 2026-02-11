import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import {
  HiOutlineViewGrid,
  HiOutlineDocumentText,
  HiOutlinePlusCircle,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineUsers,
} from 'react-icons/hi';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const navItems = [
    { to: '/dashboard', icon: <HiOutlineViewGrid />, label: 'Dashboard', roles: null },
    { to: '/leaves/my', icon: <HiOutlineDocumentText />, label: 'My Leaves', roles: null },
    { to: '/leaves/new', icon: <HiOutlinePlusCircle />, label: 'New Request', roles: null },
    { to: '/balances', icon: <HiOutlineChartBar />, label: 'Leave Balance', roles: null },
    { to: '/leaves/team', icon: <HiOutlineUserGroup />, label: 'Team Leaves', roles: [ROLES.MANAGER, ROLES.ADMIN] },
    { to: '/admin/users', icon: <HiOutlineUsers />, label: 'Users', roles: [ROLES.ADMIN] },
    { to: '/admin/departments', icon: <HiOutlineOfficeBuilding />, label: 'Departments', roles: [ROLES.ADMIN] },
    { to: '/admin/leave-types', icon: <HiOutlineCog />, label: 'Leave Types', roles: [ROLES.ADMIN] },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>HLF</h2>
        <span>HR LeaveFlow</span>
      </div>
      <nav className="sidebar-nav">
        {navItems
          .filter((item) => !item.roles || item.roles.includes(role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
