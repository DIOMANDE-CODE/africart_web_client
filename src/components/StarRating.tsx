import React, { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  max?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, max = 5 }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="star-rating" style={{ display: 'flex', gap: 6, position: 'relative', justifyContent: 'center' }}>
      {[...Array(max)].map((_, i) => (
        <span
          key={i}
          className={i < (hovered !== null ? hovered : rating) ? "star filled" : "star"}
          onClick={() => onRate(i + 1)}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: "pointer", fontSize: 24, color: i < (hovered !== null ? hovered : rating) ? "#FFD700" : "#ccc", transition: 'color 0.2s' }}
          aria-label={`Donner ${i + 1} étoile${i > 0 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};
