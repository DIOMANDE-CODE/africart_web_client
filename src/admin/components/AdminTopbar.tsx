import { useAuth } from '../../client/context/AuthContext';

interface Props {
  onToggleSidebar: () => void;
}

export const AdminTopbar = ({ onToggleSidebar }: Props) => {
  const { user, logout } = useAuth();

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button className="admin-topbar-toggle" onClick={onToggleSidebar} aria-label="Menu">
          <i className="fas fa-bars" />
        </button>
        <div className="admin-breadcrumb">
          <span className="admin-breadcrumb-title">Administration</span>
        </div>
      </div>

      <div className="admin-topbar-right">
        <div className="admin-topbar-user">
          <div className="admin-topbar-avatar">
            {user?.nom_utilisateur?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="admin-topbar-username">{user?.nom_utilisateur || 'Admin'}</span>
          <button className="admin-topbar-logout" onClick={logout} title="Déconnexion">
            <i className="fas fa-sign-out-alt" />
          </button>
        </div>
      </div>
    </header>
  );
};
