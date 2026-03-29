import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../client/context/AuthContext';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminTopbar } from './components/AdminTopbar';
import './styles/AdminLayout.css';
import './styles/AdminComponents.css';
import './styles/AdminDashboard.css';
import './styles/AdminTable.css';
import './styles/AdminForms.css';

export const AdminLayout = () => {
  const { user, loadingSession } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loadingSession) {
    return (
      <div className="app-loader">
        <div className="loader-logo">
          <div className="loader-icon">
            <img src="/src/client/assets/Logo_AfriCart_sans_fond.png" alt="AfriCart" style={{ width: 64, height: 64 }} />
          </div>
          <div className="loader-text">Afri<span>Cart</span></div>
        </div>
        <div className="loader-spinner" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`admin-layout${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="admin-main">
        <AdminTopbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
