import { useEffect, useState, useCallback } from 'react';
import { AdminTable } from '../components/AdminTable';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { AdminModal } from '../components/AdminModal';
import { Alert } from '../../client/components/Alert';
import { getAdminUsers, updateUserRole, toggleUserStatus } from '../services/adminService';

interface AdminUser {
  identifiant_utilisateur: string;
  nom_utilisateur: string;
  email_utilisateur: string;
  numero_telephone_utilisateur: string | null;
  role: string;
  photo_profil_utilisateur?: string;
  date_inscription?: string;
  is_active?: boolean;
}

const ITEMS_PER_PAGE = 15;

export const UsersManagementPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      const data = res.data;
      setUsers(data.results || data || []);
      setTotalCount(data.count ?? (data.results?.length || data.length || 0));
    } catch {
      setAlert({ message: 'Erreur lors du chargement des utilisateurs.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openDetail = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setAlert({ message: 'Rôle mis à jour.', type: 'success' });
      if (selectedUser && selectedUser.identifiant_utilisateur === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      fetchUsers();
    } catch {
      setAlert({ message: 'Erreur lors de la mise à jour du rôle.', type: 'error' });
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
      setAlert({ message: 'Statut utilisateur mis à jour.', type: 'success' });
      fetchUsers();
    } catch {
      setAlert({ message: 'Erreur lors de la mise à jour du statut.', type: 'error' });
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const columns = [
    {
      key: 'avatar', label: '', width: '48px',
      render: (u: AdminUser) => (
        <div className="admin-user-table-avatar">
          {u.nom_utilisateur?.charAt(0).toUpperCase() || '?'}
        </div>
      ),
    },
    { key: 'nom_utilisateur', label: 'Nom' },
    { key: 'email_utilisateur', label: 'Email' },
    {
      key: 'numero_telephone_utilisateur', label: 'Téléphone',
      render: (u: AdminUser) => u.numero_telephone_utilisateur || '—',
    },
    {
      key: 'role', label: 'Rôle',
      render: (u: AdminUser) => (
        <span className={`admin-badge ${u.role === 'admin' ? 'badge-primary' : 'badge-neutral'}`}>
          {u.role === 'admin' ? 'Admin' : 'Client'}
        </span>
      ),
    },
    {
      key: 'is_active', label: 'Statut',
      render: (u: AdminUser) => (
        <span className={`admin-badge ${u.is_active !== false ? 'badge-success' : 'badge-error'}`}>
          {u.is_active !== false ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'actions', label: '', width: '50px',
      render: (u: AdminUser) => (
        <button className="admin-action-btn view" title="Détails" onClick={(e) => { e.stopPropagation(); openDetail(u); }}>
          <i className="fas fa-eye" />
        </button>
      ),
    },
  ];

  return (
    <div className="admin-page">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="admin-page-header">
        <div>
          <h1>Gestion des utilisateurs</h1>
          <p>{totalCount} utilisateur{totalCount > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Rechercher un utilisateur..." />
        <select
          className="admin-select"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="client">Client</option>
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={users}
        keyExtractor={(u) => u.identifiant_utilisateur}
        loading={loading}
        emptyMessage="Aucun utilisateur trouvé"
        onRowClick={openDetail}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* User Detail Modal */}
      <AdminModal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedUser(null); }}
        title="Détails de l'utilisateur"
        size="md"
      >
        {selectedUser && (
          <div className="user-detail">
            <div className="user-detail-header">
              <div className="user-detail-avatar">
                {selectedUser.nom_utilisateur?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h3>{selectedUser.nom_utilisateur}</h3>
                <p className="text-muted">{selectedUser.email_utilisateur}</p>
              </div>
            </div>

            <div className="user-detail-info">
              <div className="detail-row">
                <span>ID</span>
                <span className="admin-mono">{selectedUser.identifiant_utilisateur}</span>
              </div>
              <div className="detail-row">
                <span>Téléphone</span>
                <span>{selectedUser.numero_telephone_utilisateur || 'Non renseigné'}</span>
              </div>
              <div className="detail-row">
                <span>Date d'inscription</span>
                <span>{selectedUser.date_inscription ? new Date(selectedUser.date_inscription).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
              <div className="detail-row">
                <span>Rôle</span>
                <select
                  className="admin-select admin-select-inline"
                  value={selectedUser.role}
                  onChange={(e) => handleRoleChange(selectedUser.identifiant_utilisateur, e.target.value)}
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="detail-row">
                <span>Statut</span>
                <div className="admin-toggle-group">
                  <span className={`admin-badge ${selectedUser.is_active !== false ? 'badge-success' : 'badge-error'}`}>
                    {selectedUser.is_active !== false ? 'Actif' : 'Inactif'}
                  </span>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleToggleStatus(selectedUser.identifiant_utilisateur)}
                  >
                    {selectedUser.is_active !== false ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};
