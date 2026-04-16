import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { LayoutDashboard, Users, Key, BarChart3, Map, FileText, LogOut, Globe } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/portal';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">B</div>
          <div>
            <h1>Bharat API</h1>
            <span>Geo Data Platform</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {isAdmin && (
          <div className="nav-section">
            <div className="nav-section-title">Admin Panel</div>
            <NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} /> Users
            </NavLink>
            <NavLink to="/admin/api-keys" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Key size={18} /> API Keys
            </NavLink>
            <NavLink to="/admin/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={18} /> Analytics
            </NavLink>
          </div>
        )}

        {!isAdmin && (
          <div className="nav-section">
            <div className="nav-section-title">B2B Portal</div>
            <NavLink to="/portal" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
          </div>
        )}

        <div className="nav-section">
          <div className="nav-section-title">Data</div>
          <NavLink to={`${prefix}/explorer`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Map size={18} /> Data Explorer
          </NavLink>
          <NavLink to={`${prefix}/docs`} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> API Docs
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-info">
            <div className="name">{user?.name || 'User'}</div>
            <div className="role">{user?.role || 'user'}</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}
