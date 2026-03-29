interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  en_attente:  { label: 'En attente',  className: 'badge-warning' },
  en_cours:    { label: 'En cours',    className: 'badge-info' },
  confirmee:   { label: 'Confirmée',   className: 'badge-primary' },
  livree:      { label: 'Livrée',      className: 'badge-success' },
  annulee:     { label: 'Annulée',     className: 'badge-error' },
  retournee:   { label: 'Retournée',   className: 'badge-neutral' },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] || { label: status, className: 'badge-neutral' };
  return <span className={`admin-badge ${config.className}`}>{config.label}</span>;
};
