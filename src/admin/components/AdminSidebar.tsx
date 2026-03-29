import { NavLink } from 'react-router-dom';
import { useAuth } from '../../client/context/AuthContext';

const navItems = [
  { to: '/admin',            icon: 'fa-tachometer-alt', label: 'Tableau de bord', end: true },
  { to: '/admin/products',   icon: 'fa-box-open',       label: 'Produits' },
  { to: '/admin/orders',     icon: 'fa-receipt',        label: 'Commandes' },
  { to: '/admin/categories', icon: 'fa-tags',           label: 'Catégories' },
  { to: '/admin/users',      icon: 'fa-users',          label: 'Utilisateurs' },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export const AdminSidebar = ({ collapsed, onToggle }: Props) => {
  const { user } = useAuth();

  return (
    <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="admin-sidebar-header">
        <NavLink to="/admin" className="admin-logo">
          <img src="/src/client/assets/Logo_AfriCart_sans_fond.png" alt="AfriCart" className="admin-logo-icon" />
          {!collapsed && (
            <span className="admin-logo-text">
              Afri<span>Cart</span>
              <small>Admin</small>
            </span>
          )}
        </NavLink>
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`} />
        </button>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <i className={`fas ${item.icon}`} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-user-card">
          <div className="admin-user-avatar">
            {user?.nom_utilisateur?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.nom_utilisateur || 'Admin'}</span>
              <span className="admin-user-role">Administrateur</span>
            </div>
          )}
        </div>
        <NavLink to="/" className="admin-nav-link back-link" title="Retour au site">
          <i className="fas fa-arrow-left" />
          {!collapsed && <span>Retour au site</span>}
        </NavLink>
      </div>
    </aside>
  );
};
