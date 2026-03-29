import React from 'react';
import '../styles/skeletons/CategoryCarouselSkeleton.css';

const CategoryCarouselSkeleton = () => {
  const items = Array.from({ length: 5 });

  return (
    <section className="category-carousel-skeleton">
      <div className="carousel-header-skeleton">
        <div className="title-skeleton skeleton"></div>
        <div className="controls-skeleton">
          <div className="arrow-skeleton skeleton"></div>
          <div className="arrow-skeleton skeleton"></div>
        </div>
      </div>
      <div className="carousel-track-skeleton">
        {items.map((_, index) => (
          <div className="product-card-skeleton" key={index}>
            <div className="image-skeleton skeleton"></div>
            <div className="text-line-skeleton skeleton"></div>
            <div className="text-line-skeleton skeleton" style={{ width: '60%' }}></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryCarouselSkeleton;
