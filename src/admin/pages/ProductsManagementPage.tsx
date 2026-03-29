import { useEffect, useState, useCallback } from 'react';
import { AdminTable } from '../components/AdminTable';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { AdminModal } from '../components/AdminModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Alert } from '../../client/components/Alert';
import { IMAGE_URL } from '../../client/constants';
import {
  getAdminProducts,
  getAdminCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/adminService';

interface Product {
  identifiant_produit: string;
  nom_produit: string;
  prix_unitaire_produit: string;
  quantite_produit_disponible: number;
  seuil_alerte_produit: number;
  thumbnail: string;
  image_produit: string;
  description_produit?: string;
  caracteristiques_produit?: string;
  categorie_produit?: { identifiant_categorie: string; nom_categorie: string };
  date_creation?: string;
}

interface Category {
  identifiant_categorie: string;
  nom_categorie: string;
}

const ITEMS_PER_PAGE = 12;

export const ProductsManagementPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nom_produit: '',
    prix_unitaire_produit: '',
    quantite_produit_disponible: 0,
    seuil_alerte_produit: 5,
    description_produit: '',
    caracteristiques_produit: '',
    identifiant_categorie: '',
  });
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({
    image_produit: null,
    image_produit_2: null,
    image_produit_3: null,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        search: search || undefined,
        categorie: selectedCategory || undefined,
      });
      const data = res.data;
      setProducts(data.results || data || []);
      setTotalCount(data.count ?? (data.results?.length || data.length || 0));
    } catch {
      setAlert({ message: 'Erreur lors du chargement des produits.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    getAdminCategories()
      .then((res) => setCategories(res.data?.results || res.data || []))
      .catch(() => {});
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nom_produit: '', prix_unitaire_produit: '', quantite_produit_disponible: 0,
      seuil_alerte_produit: 5, description_produit: '', caracteristiques_produit: '', identifiant_categorie: '',
    });
    setImageFiles({ image_produit: null, image_produit_2: null, image_produit_3: null });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nom_produit: product.nom_produit,
      prix_unitaire_produit: product.prix_unitaire_produit,
      quantite_produit_disponible: product.quantite_produit_disponible,
      seuil_alerte_produit: product.seuil_alerte_produit,
      description_produit: product.description_produit || '',
      caracteristiques_produit: product.caracteristiques_produit || '',
      identifiant_categorie: product.categorie_produit?.identifiant_categorie || '',
    });
    setImageFiles({ image_produit: null, image_produit_2: null, image_produit_3: null });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom_produit.trim() || !formData.prix_unitaire_produit.trim()) {
      setAlert({ message: 'Veuillez remplir les champs obligatoires.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));
      Object.entries(imageFiles).forEach(([k, file]) => { if (file) fd.append(k, file); });

      if (editingProduct) {
        await updateProduct(editingProduct.identifiant_produit, fd);
        setAlert({ message: 'Produit mis à jour avec succès.', type: 'success' });
      } else {
        await createProduct(fd);
        setAlert({ message: 'Produit créé avec succès.', type: 'success' });
      }
      setModalOpen(false);
      fetchProducts();
    } catch {
      setAlert({ message: 'Erreur lors de la sauvegarde du produit.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.identifiant_produit);
      setAlert({ message: 'Produit supprimé.', type: 'success' });
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      setAlert({ message: 'Erreur lors de la suppression.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const columns = [
    {
      key: 'thumbnail', label: '', width: '56px',
      render: (p: Product) => (
        <img src={`${IMAGE_URL}${p.thumbnail}`} alt={p.nom_produit} className="admin-table-thumb" />
      ),
    },
    { key: 'nom_produit', label: 'Nom du produit' },
    {
      key: 'categorie_produit', label: 'Catégorie',
      render: (p: Product) => (
        <span className="admin-badge badge-neutral">{p.categorie_produit?.nom_categorie || '—'}</span>
      ),
    },
    {
      key: 'prix_unitaire_produit', label: 'Prix',
      render: (p: Product) => <strong>{Number(p.prix_unitaire_produit).toLocaleString('fr-FR')} F</strong>,
    },
    {
      key: 'quantite_produit_disponible', label: 'Stock',
      render: (p: Product) => (
        <span className={`stock-indicator ${p.quantite_produit_disponible <= p.seuil_alerte_produit ? 'critical' : p.quantite_produit_disponible <= p.seuil_alerte_produit * 2 ? 'low' : 'ok'}`}>
          {p.quantite_produit_disponible}
        </span>
      ),
    },
    {
      key: 'actions', label: 'Actions', width: '120px',
      render: (p: Product) => (
        <div className="admin-actions">
          <button className="admin-action-btn edit" title="Modifier" onClick={(e) => { e.stopPropagation(); openEditModal(p); }}>
            <i className="fas fa-edit" />
          </button>
          <button className="admin-action-btn delete" title="Supprimer" onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}>
            <i className="fas fa-trash" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="admin-page-header">
        <div>
          <h1>Gestion des produits</h1>
          <p>{totalCount} produit{totalCount > 1 ? 's' : ''} au total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="fas fa-plus" /> Nouveau produit
        </button>
      </div>

      {/* Filters */}
      <div className="admin-toolbar">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Rechercher un produit..." />
        <select
          className="admin-select"
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.identifiant_categorie} value={c.identifiant_categorie}>{c.nom_categorie}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={products}
        keyExtractor={(p) => p.identifiant_produit}
        loading={loading}
        emptyMessage="Aucun produit trouvé"
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Create/Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
        size="lg"
      >
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Nom du produit *</label>
              <input
                className="admin-form-input"
                value={formData.nom_produit}
                onChange={(e) => setFormData({ ...formData, nom_produit: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Prix unitaire (F CFA) *</label>
              <input
                className="admin-form-input"
                type="number"
                min="0"
                value={formData.prix_unitaire_produit}
                onChange={(e) => setFormData({ ...formData, prix_unitaire_produit: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Catégorie</label>
              <select
                className="admin-form-input"
                value={formData.identifiant_categorie}
                onChange={(e) => setFormData({ ...formData, identifiant_categorie: e.target.value })}
              >
                <option value="">Sélectionner</option>
                {categories.map((c) => (
                  <option key={c.identifiant_categorie} value={c.identifiant_categorie}>{c.nom_categorie}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Quantité disponible</label>
              <input
                className="admin-form-input"
                type="number"
                min="0"
                value={formData.quantite_produit_disponible}
                onChange={(e) => setFormData({ ...formData, quantite_produit_disponible: Number(e.target.value) })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Seuil d'alerte</label>
              <input
                className="admin-form-input"
                type="number"
                min="0"
                value={formData.seuil_alerte_produit}
                onChange={(e) => setFormData({ ...formData, seuil_alerte_produit: Number(e.target.value) })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Description</label>
              <textarea
                className="admin-form-textarea"
                rows={4}
                value={formData.description_produit}
                onChange={(e) => setFormData({ ...formData, description_produit: e.target.value })}
              />
            </div>
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Caractéristiques</label>
              <textarea
                className="admin-form-textarea"
                rows={3}
                value={formData.caracteristiques_produit}
                onChange={(e) => setFormData({ ...formData, caracteristiques_produit: e.target.value })}
              />
            </div>

            {/* Image uploads */}
            {['image_produit', 'image_produit_2', 'image_produit_3'].map((key, idx) => (
              <div className="admin-form-group" key={key}>
                <label className="admin-form-label">Image {idx + 1}{idx === 0 ? ' *' : ''}</label>
                <div className="admin-file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFiles({ ...imageFiles, [key]: e.target.files?.[0] || null })}
                  />
                  <div className="admin-file-upload-label">
                    <i className="fas fa-cloud-upload-alt" />
                    <span>{imageFiles[key]?.name || 'Choisir une image'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="small-loader-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
              {editingProduct ? 'Enregistrer' : 'Créer le produit'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.nom_produit}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        variant="danger"
      />
    </div>
  );
};
