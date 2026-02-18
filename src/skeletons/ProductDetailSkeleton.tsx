import "../styles/skeletons/ProductDetailSkeleton.css";

export const ProductDetailSkeleton = () => {
  return (
    <div className="product-detail-skeleton">
      <div className="detail-skeleton-image"></div>
      <div className="detail-skeleton-content">
        <div className="detail-skeleton-title"></div>
        <div className="detail-skeleton-rating"></div>
        <div className="detail-skeleton-price"></div>
        <div className="detail-skeleton-description"></div>
        <div className="detail-skeleton-description"></div>
        <div className="detail-skeleton-button"></div>
      </div>
    </div>
  );
};
