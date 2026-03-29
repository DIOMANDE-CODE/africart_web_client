interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: { value: number; label: string };
  color: 'primary' | 'secondary' | 'tertiary' | 'success' | 'error';
}

const colorMap = {
  primary:   { bg: 'var(--primary-50)',   icon: 'var(--primary-500)',   trend: 'var(--primary-600)' },
  secondary: { bg: 'var(--secondary-50)', icon: 'var(--secondary-500)', trend: 'var(--secondary-600)' },
  tertiary:  { bg: 'var(--tertiary-50)',  icon: 'var(--tertiary-500)',  trend: 'var(--tertiary-600)' },
  success:   { bg: '#e8f5e9',             icon: 'var(--success)',       trend: 'var(--primary-600)' },
  error:     { bg: '#fce4ec',             icon: 'var(--error)',         trend: 'var(--error)' },
};

export const StatCard = ({ title, value, icon, trend, color }: StatCardProps) => {
  const c = colorMap[color];
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: c.bg, color: c.icon }}>
        <i className={`fas ${icon}`} />
      </div>
      <div className="stat-card-content">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-value">{value}</span>
        {trend && (
          <span
            className={`stat-card-trend ${trend.value >= 0 ? 'positive' : 'negative'}`}
            style={{ color: trend.value >= 0 ? c.trend : 'var(--error)' }}
          >
            <i className={`fas fa-arrow-${trend.value >= 0 ? 'up' : 'down'}`} />
            {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
    </div>
  );
};
