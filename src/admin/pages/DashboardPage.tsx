import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { AdminTable } from '../components/AdminTable';
import { StatusBadge } from '../components/StatusBadge';
import { getDashboardStats, getRecentOrders, getLowStockProducts } from '../services/adminService';
import { IMAGE_URL } from '../../client/constants';

interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_users: number;
  total_revenue: number;
  orders_today: number;
  low_stock_count: number;
}

interface RecentOrder {
  identifiant_commande: string;
  date_commande: string;
  etat_commande: string;
  total_ttc: string;
  client_name: string;
}

interface LowStockProduct {
  identifiant_produit: string;
  nom_produit: string;
  quantite_produit_disponible: number;
  seuil_alerte_produit: number;
  thumbnail: string;
}

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes, stockRes] = await Promise.all([
          getDashboardStats(),
          getRecentOrders(8),
          getLowStockProducts(),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data?.results || ordersRes.data || []);
        setLowStockProducts(stockRes.data?.results || stockRes.data || []);
      } catch {
        // Fallback: mock data for development
        setStats({
          total_products: 156,
          total_orders: 1243,
          total_users: 389,
          total_revenue: 8457500,
          orders_today: 12,
          low_stock_count: 8,
        });
        setRecentOrders([]);
        setLowStockProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val);

  const orderColumns = [
    { key: 'identifiant_commande', label: 'Réf.', width: '140px',
      render: (o: RecentOrder) => <span className="admin-mono">{o.identifiant_commande.slice(0, 8)}...</span> },
    { key: 'client_name', label: 'Client' },
    { key: 'date_commande', label: 'Date',
      render: (o: RecentOrder) => new Date(o.date_commande).toLocaleDateString('fr-FR') },
    { key: 'total_ttc', label: 'Total',
      render: (o: RecentOrder) => <strong>{Number(o.total_ttc).toLocaleString('fr-FR')} F</strong> },
    { key: 'etat_commande', label: 'Statut',
      render: (o: RecentOrder) => <StatusBadge status={o.etat_commande} /> },
  ];

  const stockColumns = [
    { key: 'thumbnail', label: '', width: '48px',
      render: (p: LowStockProduct) => (
        <img src={`${IMAGE_URL}${p.thumbnail}`} alt={p.nom_produit} className="admin-table-thumb" />
      ),
    },
    { key: 'nom_produit', label: 'Produit' },
    { key: 'quantite_produit_disponible', label: 'Stock',
      render: (p: LowStockProduct) => (
        <span className={`stock-indicator ${p.quantite_produit_disponible <= p.seuil_alerte_produit ? 'critical' : 'low'}`}>
          {p.quantite_produit_disponible}
        </span>
      ),
    },
    { key: 'seuil_alerte_produit', label: 'Seuil' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble de votre boutique AfriCart</p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="stats-grid">
        <StatCard
          title="Revenu total"
          value={stats ? formatCurrency(stats.total_revenue) : '—'}
          icon="fa-coins"
          color="primary"
          trend={{ value: 12, label: 'ce mois' }}
        />
        <StatCard
          title="Commandes"
          value={stats?.total_orders ?? '—'}
          icon="fa-receipt"
          color="secondary"
          trend={{ value: 8, label: 'cette semaine' }}
        />
        <StatCard
          title="Produits"
          value={stats?.total_products ?? '—'}
          icon="fa-box-open"
          color="tertiary"
        />
        <StatCard
          title="Utilisateurs"
          value={stats?.total_users ?? '—'}
          icon="fa-users"
          color="success"
          trend={{ value: 5, label: 'ce mois' }}
        />
      </div>

      {/* ── Quick Stats ── */}
      <div className="quick-stats">
        <div className="quick-stat-item">
          <i className="fas fa-shopping-bag" />
          <div>
            <strong>{stats?.orders_today ?? 0}</strong>
            <span>Commandes aujourd'hui</span>
          </div>
        </div>
        <div className="quick-stat-item alert">
          <i className="fas fa-exclamation-triangle" />
          <div>
            <strong>{stats?.low_stock_count ?? 0}</strong>
            <span>Produits en stock faible</span>
          </div>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="dashboard-grid">
        <div className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-header">
            <h3><i className="fas fa-clock" /> Commandes récentes</h3>
            <Link to="/admin/orders" className="admin-link">Voir tout →</Link>
          </div>
          <AdminTable
            columns={orderColumns}
            data={recentOrders}
            keyExtractor={(o) => o.identifiant_commande}
            loading={loading}
            emptyMessage="Aucune commande récente"
          />
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3><i className="fas fa-exclamation-circle" /> Stock faible</h3>
            <Link to="/admin/products" className="admin-link">Gérer →</Link>
          </div>
          <AdminTable
            columns={stockColumns}
            data={lowStockProducts}
            keyExtractor={(p) => p.identifiant_produit}
            loading={loading}
            emptyMessage="Aucune alerte de stock"
          />
        </div>
      </div>
    </div>
  );
};
