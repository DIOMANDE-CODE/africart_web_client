import React, { useState, useEffect } from "react";
import api from "../services/api";

interface ProductRatingProps {
  productId: string;
}

export const ProductRating: React.FC<ProductRatingProps> = ({ productId }) => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.get(`/produits/note_moyenne/${productId}`);
        if (res.data.success && res.data.data) {
          setCount(res.data.data.nombre_notations);
        } else {
          setCount(0);
        }
      } catch {
        setCount(0);
      }
    };
    fetchCount();
  }, [productId]);

  return (
    <span style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>
      {count !== null ? `(${count} avis)` : ''}
    </span>
  );
};
