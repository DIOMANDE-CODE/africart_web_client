import { useEffect, useState } from 'react';
import { AdminModal } from '../components/AdminModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { SearchBar } from '../components/SearchBar';
import { Alert } from '../../client/components/Alert';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../services/adminService';

interface Category {
  identifiant_categorie: string;
  nom_categorie: string;
  produits_count?: number;
}

export const CategoriesManagementPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getAdminCategories();
      const data = res.data?.results || res.data || [];
      setCategories(data);
      setFiltered(data);
    } catch {
      setAlert({ message: 'Erreur lors du chargement des catégories.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(categories);
    } else {
      const q = search.toLowerCase();
      setFiltered(categories.filter((c) => c.nom_categorie.toLowerCase().includes(q)));
    }
  }, [search, categories]);

  const openCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.nom_categorie);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setAlert({ message: 'Veuillez entrer un nom de catégorie.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.identifiant_categorie, { nom_categorie: categoryName.trim() });
        setAlert({ message: 'Catégorie modifiée.', type: 'success' });
      } else {
        await createCategory({ nom_categorie: categoryName.trim() });
        setAlert({ message: 'Catégorie créée.', type: 'success' });
      }
      setModalOpen(false);
      fetchCategories();
    } catch {
      setAlert({ message: 'Erreur lors de la sauvegarde.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.identifiant_categorie);
      setAlert({ message: 'Catégorie supprimée.', type: 'success' });
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      setAlert({ message: 'Erreur lors de la suppression.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="admin-page-header">
        <div>
          <h1>Gestion des catégories</h1>
          <p>{categories.length} catégorie{categories.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="fas fa-plus" /> Nouvelle catégorie
        </button>
      </div>

      <div className="admin-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une catégorie..." />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="categories-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="category-card skeleton">
              <div className="skeleton-line" style={{ width: '60%', height: 20 }} />
              <div className="skeleton-line" style={{ width: '40%', height: 14, marginTop: 8 }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-table-empty">
          <i className="fas fa-tags" />
          <p>Aucune catégorie trouvée</p>
        </div>
      ) : (
        <div className="categories-grid">
          {filtered.map((cat) => (
            <div key={cat.identifiant_categorie} className="category-card">
              <div className="category-card-icon">
                <i className="fas fa-tag" />
              </div>
              <div className="category-card-content">
                <h3>{cat.nom_categorie}</h3>
                {cat.produits_count !== undefined && (
                  <span className="category-card-count">{cat.produits_count} produit{cat.produits_count > 1 ? 's' : ''}</span>
                )}
              </div>
              <div className="category-card-actions">
                <button className="admin-action-btn edit" title="Modifier" onClick={() => openEdit(cat)}>
                  <i className="fas fa-edit" />
                </button>
                <button className="admin-action-btn delete" title="Supprimer" onClick={() => setDeleteTarget(cat)}>
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        size="sm"
      >
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Nom de la catégorie *</label>
            <input
              className="admin-form-input"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ex: Vêtements, Accessoires..."
              autoFocus
              required
            />
          </div>
          <div className="admin-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="small-loader-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
              {editingCategory ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer la catégorie"
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${deleteTarget?.nom_categorie}" ? Les produits associés ne seront pas supprimés.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        variant="danger"
      />
    </div>
  );
};
