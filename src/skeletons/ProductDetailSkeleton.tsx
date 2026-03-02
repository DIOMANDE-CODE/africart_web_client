import "../styles/skeletons/ProductDetailSkeleton.css";

export const ProductDetailSkeleton = () => {
  return (
    <div className="product-detail-skeleton">
      <div className="detail-skeleton-image"></div>
      <div className="detail-skeleton-content">
        <div className="detail-skeleton-title"></div>
        {/* Bloc d'étoiles skeleton */}
        <div className="detail-skeleton-rating" style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ fontSize: 24, color: '#e0e0e0' }}>★</span>
          ))}
        </div>
        <div className="detail-skeleton-price"></div>
        <div className="detail-skeleton-description"></div>
        <div className="detail-skeleton-description"></div>
        <div className="detail-skeleton-button"></div>
      </div>
    </div>
  );
};
