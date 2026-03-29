import "../styles/skeletons/ProductSkeleton.css";

export const ProductSkeleton = () => {
  return (
    <div className="product-skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-price"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

// Composant pour afficher plusieurs skeletons de produits
export const ProductSkeletonGrid = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="products-skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
};
