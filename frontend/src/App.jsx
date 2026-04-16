import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { api } from './api';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminApiKeys from './pages/AdminApiKeys';
import AdminAnalytics from './pages/AdminAnalytics';
import DataExplorer from './pages/DataExplorer';
import PortalDashboard from './pages/PortalDashboard';
import ApiDocs from './pages/ApiDocs';
import Sidebar from './components/Sidebar';

// Auth Context
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then(data => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const data = await api.register(formData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/portal'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/portal" /> : <Register />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={user?.role === 'admin' ? <DashboardLayout><AdminDashboard /></DashboardLayout> : <Navigate to="/login" />} />
        <Route path="/admin/users" element={user?.role === 'admin' ? <DashboardLayout><AdminUsers /></DashboardLayout> : <Navigate to="/login" />} />
        <Route path="/admin/api-keys" element={user?.role === 'admin' ? <DashboardLayout><AdminApiKeys /></DashboardLayout> : <Navigate to="/login" />} />
        <Route path="/admin/analytics" element={user?.role === 'admin' ? <DashboardLayout><AdminAnalytics /></DashboardLayout> : <Navigate to="/login" />} />
        <Route path="/admin/explorer" element={user?.role === 'admin' ? <DashboardLayout><DataExplorer /></DashboardLayout> : <Navigate to="/login" />} />
        <Route path="/admin/docs" element={user?.role === 'admin' ? <DashboardLayout><ApiDocs /></DashboardLayout> : <Navigate to="/login" />} />
        
        {/* Portal routes */}
        <Route path="/portal" element={user ? <DashboardLayout><PortalDashboard /></DashboardLayout> : <Navigate to="/login" />} />
        <Route path="/portal/explorer" element={user ? <DashboardLayout><DataExplorer /></DashboardLayout> : <Navigate to="/login" />} />
        <Route path="/portal/docs" element={user ? <DashboardLayout><ApiDocs /></DashboardLayout> : <Navigate to="/login" />} />
      </Routes>
    </AuthContext.Provider>
  );
}

function DashboardLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default App;
