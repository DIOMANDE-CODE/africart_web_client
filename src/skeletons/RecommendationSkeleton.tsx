import React from "react";

type Props = { count?: number };

export const RecommendationSkeleton: React.FC<Props> = ({ count = 4 }) => {
  return (
    <div className="recommendation-list recommendation-skeleton" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <article className="carousel-item skeleton-card" key={i}>
          <div className="item-image skeleton-image" />
          <div className="item-body">
            <div className="skeleton-line" style={{ height: 14, width: '60%' }} />
            <div className="skeleton-line" style={{ height: 14, width: '40%' }} />
          </div>
        </article>
      ))}
    </div>
  );
};

export default RecommendationSkeleton;
