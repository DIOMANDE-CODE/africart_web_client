import api from '../../client/services/api';

/* ══════════════════════════════════════════════════
   Admin API Service — All admin-scoped endpoints
   ══════════════════════════════════════════════════ */

// ─── Dashboard Stats ──────────────────────────────
export const getDashboardStats = () =>
  api.get('/admin/dashboard/stats/');

export const getRecentOrders = (limit = 10) =>
  api.get('/admin/commandes/recent/', { params: { limit } });

export const getLowStockProducts = (threshold = 10) =>
  api.get('/admin/produits/low-stock/', { params: { threshold } });

export const getRevenueStats = (period: 'week' | 'month' | 'year' = 'month') =>
  api.get('/admin/dashboard/revenue/', { params: { period } });

// ─── Products Management ──────────────────────────
export interface AdminProductPayload {
  nom_produit: string;
  prix_unitaire_produit: string;
  quantite_produit_disponible: number;
  seuil_alerte_produit: number;
  description_produit?: string;
  caracteristiques_produit?: string;
  identifiant_categorie: string;
}

export const getAdminProducts = (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  categorie?: string;
}) => api.get('/admin/produits/list/', { params });

export const getAdminProductDetail = (id: string) =>
  api.get(`/admin/produits/detail/${id}/`);

export const createProduct = (data: FormData) =>
  api.post('/admin/produits/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id: string, data: FormData) =>
  api.put(`/admin/produits/update/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProduct = (id: string) =>
  api.delete(`/admin/produits/delete/${id}/`);

// ─── Categories Management ────────────────────────
export const getAdminCategories = () =>
  api.get('/admin/categories/list/');

export const createCategory = (data: { nom_categorie: string }) =>
  api.post('/admin/categories/create/', data);

export const updateCategory = (id: string, data: { nom_categorie: string }) =>
  api.put(`/admin/categories/update/${id}/`, data);

export const deleteCategory = (id: string) =>
  api.delete(`/admin/categories/delete/${id}/`);

// ─── Orders Management ────────────────────────────
export const getAdminOrders = (params?: {
  limit?: number;
  offset?: number;
  etat?: string;
  search?: string;
}) => api.get('/admin/commandes/list/', { params });

export const getAdminOrderDetail = (id: string) =>
  api.get(`/admin/commandes/detail/${id}/`);

export const updateOrderStatus = (id: string, etat: string) =>
  api.put(`/admin/commandes/update-status/${id}/`, { etat_commande: etat });

// ─── Users Management ─────────────────────────────
export const getAdminUsers = (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
}) => api.get('/admin/utilisateurs/list/', { params });

export const getAdminUserDetail = (id: string) =>
  api.get(`/admin/utilisateurs/detail/${id}/`);

export const updateUserRole = (id: string, role: string) =>
  api.put(`/admin/utilisateurs/update-role/${id}/`, { role });

export const toggleUserStatus = (id: string) =>
  api.put(`/admin/utilisateurs/toggle-status/${id}/`);
