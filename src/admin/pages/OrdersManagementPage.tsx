import { useEffect, useState, useCallback } from 'react';
import { AdminTable } from '../components/AdminTable';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { AdminModal } from '../components/AdminModal';
import { Alert } from '../../client/components/Alert';
import { IMAGE_URL } from '../../client/constants';
import { getAdminOrders, getAdminOrderDetail, updateOrderStatus } from '../services/adminService';

interface Order {
  identifiant_commande: string;
  code_livraison: string;
  date_commande: string;
  etat_commande: string;
  lieu_livraison: string;
  total_ht: string;
  total_ttc: string;
  frais_livraison_appliques?: string;
  client_name?: string;
  client_phone?: string;
}

interface OrderDetail extends Order {
  details_commandes?: {
    produit: { thumbnail: string; nom_produit: string };
    quantite: string;
    sous_total: string;
    prix_unitaire: string;
  }[];
}

const ORDER_STATUSES = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'livree', label: 'Livrée' },
  { value: 'annulee', label: 'Annulée' },
];

const ITEMS_PER_PAGE = 15;

export const OrdersManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminOrders({
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        search: search || undefined,
        etat: statusFilter || undefined,
      });
      const data = res.data;
      setOrders(data.results || data || []);
      setTotalCount(data.count ?? (data.results?.length || data.length || 0));
    } catch {
      setAlert({ message: 'Erreur lors du chargement des commandes.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openDetail = async (order: Order) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await getAdminOrderDetail(order.identifiant_commande);
      setSelectedOrder(res.data);
    } catch {
      setSelectedOrder(order as OrderDetail);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setAlert({ message: 'Statut mis à jour avec succès.', type: 'success' });
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, etat_commande: newStatus });
      }
      fetchOrders();
    } catch {
      setAlert({ message: 'Erreur lors de la mise à jour du statut.', type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const columns = [
    {
      key: 'identifiant_commande', label: 'Référence', width: '150px',
      render: (o: Order) => <span className="admin-mono">{o.identifiant_commande.slice(0, 8)}...</span>,
    },
    { key: 'client_name', label: 'Client',
      render: (o: Order) => (
        <div>
          <div>{o.client_name || '—'}</div>
          {o.client_phone && <small className="text-muted">{o.client_phone}</small>}
        </div>
      ),
    },
    {
      key: 'date_commande', label: 'Date',
      render: (o: Order) => new Date(o.date_commande).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    { key: 'lieu_livraison', label: 'Lieu' },
    {
      key: 'total_ttc', label: 'Total',
      render: (o: Order) => <strong>{Number(o.total_ttc).toLocaleString('fr-FR')} F</strong>,
    },
    {
      key: 'etat_commande', label: 'Statut',
      render: (o: Order) => <StatusBadge status={o.etat_commande} />,
    },
    {
      key: 'actions', label: '', width: '50px',
      render: (o: Order) => (
        <button className="admin-action-btn view" title="Détails" onClick={(e) => { e.stopPropagation(); openDetail(o); }}>
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
          <h1>Gestion des commandes</h1>
          <p>{totalCount} commande{totalCount > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Rechercher par référence, client..." />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={columns}
        data={orders}
        keyExtractor={(o) => o.identifiant_commande}
        loading={loading}
        emptyMessage="Aucune commande trouvée"
        onRowClick={openDetail}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Order Detail Modal */}
      <AdminModal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedOrder(null); }}
        title={`Commande ${selectedOrder?.identifiant_commande?.slice(0, 8) || ''}...`}
        size="lg"
      >
        {detailLoading ? (
          <div className="admin-detail-loading">
            <div className="loader-spinner" />
          </div>
        ) : selectedOrder ? (
          <div className="order-detail">
            <div className="order-detail-grid">
              <div className="order-detail-section">
                <h4>Informations</h4>
                <div className="detail-row">
                  <span>Référence</span>
                  <span className="admin-mono">{selectedOrder.identifiant_commande}</span>
                </div>
                <div className="detail-row">
                  <span>Code livraison</span>
                  <strong>{selectedOrder.code_livraison}</strong>
                </div>
                <div className="detail-row">
                  <span>Date</span>
                  <span>{new Date(selectedOrder.date_commande).toLocaleString('fr-FR')}</span>
                </div>
                <div className="detail-row">
                  <span>Lieu de livraison</span>
                  <span>{selectedOrder.lieu_livraison}</span>
                </div>
              </div>

              <div className="order-detail-section">
                <h4>Client</h4>
                <div className="detail-row">
                  <span>Nom</span>
                  <span>{selectedOrder.client_name || '—'}</span>
                </div>
                <div className="detail-row">
                  <span>Téléphone</span>
                  <span>{selectedOrder.client_phone || '—'}</span>
                </div>
              </div>

              <div className="order-detail-section">
                <h4>Montants</h4>
                <div className="detail-row">
                  <span>Sous-total HT</span>
                  <span>{Number(selectedOrder.total_ht).toLocaleString('fr-FR')} F</span>
                </div>
                <div className="detail-row">
                  <span>Livraison</span>
                  <span>{Number(selectedOrder.frais_livraison_appliques || 0).toLocaleString('fr-FR')} F</span>
                </div>
                <div className="detail-row total">
                  <span>Total TTC</span>
                  <strong>{Number(selectedOrder.total_ttc).toLocaleString('fr-FR')} F</strong>
                </div>
              </div>

              <div className="order-detail-section">
                <h4>Statut</h4>
                <div className="order-status-selector">
                  <StatusBadge status={selectedOrder.etat_commande} />
                  <select
                    className="admin-select"
                    value={selectedOrder.etat_commande}
                    onChange={(e) => handleStatusChange(selectedOrder.identifiant_commande, e.target.value)}
                    disabled={updatingStatus}
                  >
                    {ORDER_STATUSES.filter((s) => s.value).map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {updatingStatus && <span className="small-loader-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />}
                </div>
              </div>
            </div>

            {/* Order Items */}
            {selectedOrder.details_commandes && selectedOrder.details_commandes.length > 0 && (
              <div className="order-items-section">
                <h4>Articles commandés</h4>
                <div className="order-items-list">
                  {selectedOrder.details_commandes.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <img src={`${IMAGE_URL}${item.produit.thumbnail}`} alt={item.produit.nom_produit} className="order-item-thumb" />
                      <div className="order-item-info">
                        <span className="order-item-name">{item.produit.nom_produit}</span>
                        <span className="order-item-qty">{item.quantite} × {Number(item.prix_unitaire).toLocaleString('fr-FR')} F</span>
                      </div>
                      <span className="order-item-total">{Number(item.sous_total).toLocaleString('fr-FR')} F</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
};
