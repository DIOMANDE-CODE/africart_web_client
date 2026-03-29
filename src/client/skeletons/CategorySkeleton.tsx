import "../styles/skeletons/CategorySkeleton.css";

export const CategorySkeleton = () => {
  return (
    <div className="category-skeleton">
      <div className="skeleton-category-image"></div>
      <div className="skeleton-category-name"></div>
    </div>
  );
};

// Composant pour afficher plusieurs skeletons de catégories
export const CategorySkeletonCarousel = ({ count = 20 }: { count?: number }) => {
  return (
    <div className="categories-skeleton-carousel">
      {Array.from({ length: count }).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
};
