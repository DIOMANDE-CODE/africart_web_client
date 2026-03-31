import React from "react";
import { useAverageRating } from "../services/produitService";

interface ProductRatingProps {
  productId: string;
}

export const ProductRating: React.FC<ProductRatingProps> = ({ productId }) => {
  const { data } = useAverageRating(productId);
  const count = (data && data.data && typeof data.data.nombre_notations === 'number') ? data.data.nombre_notations : 0;

  return (
    <span style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>
      {count > 0 ? `(${count} avis)` : ''}
    </span>
  );
};
