import "../styles/skeletons/ConfirmationSkeleton.css";

export const ConfirmationSkeleton = () => {
  return (
    <section className="page active" id="confirmation-page">
      <div className="container confirmation-page">
        <div className="confirmation-card">
          {/* Icon skeleton */}
          <div className="skeleton-icon"></div>

          {/* Title skeleton */}
          <div className="skeleton-title"></div>

          {/* Subtitle skeleton */}
          <div className="skeleton-subtitle"></div>

          {/* Order details grid skeleton */}
          <div className="order-details card-grid skeleton-grid">
            {Array.from({ length: 7 }).map((_, index) => (
              <div className="order-item skeleton-item" key={index}>
                <div className="skeleton-label"></div>
                <div className="skeleton-value"></div>
              </div>
            ))}
          </div>

          {/* Tracking card skeleton */}
          <div className="order-references single">
            <div className="shipping-tracking centered">
              <div className="tracking-card skeleton-tracking">
                <div className="skeleton-tracking-title"></div>
                <div className="skeleton-tracking-content"></div>
              </div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="skeleton-description"></div>

          {/* Status pill skeleton */}
          <div className="skeleton-status"></div>

          {/* Action button skeleton */}
          <div className="mt-5 action-row">
            <div className="skeleton-button"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
