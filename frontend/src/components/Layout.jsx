import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ClipboardList, LogOut, Wrench, Users, Bell } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Inventory', path: '/inventory', icon: <Package size={20} />, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Requests', path: '/requests', icon: <ClipboardList size={20} />, roles: ['Admin', 'Manager', 'Staff'] },
    { name: 'Allocation', path: '/allocations', icon: <Users size={20} />, roles: ['Admin', 'Manager'] },
    { name: 'Maintenance', path: '/maintenance', icon: <Wrench size={20} />, roles: ['Admin', 'Manager'] },
  ];

  const navItems = user ? allNavItems.filter(item => item.roles.includes(user.role)) : [];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="text-gradient">Inventory Pro</h2>
          <p className="subtitle" style={{ margin: 0 }}>Role: {user?.role}</p>
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '400',
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <button 
          onClick={handleLogout} 
          className="btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: 'auto' }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
      
      <main className="main-content">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem' }}>
          <NavLink to="/notifications" style={{ color: 'var(--text-secondary)', position: 'relative' }}>
            <Bell size={20} />
          </NavLink>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Welcome, <strong>{user?.username}</strong></span>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;
