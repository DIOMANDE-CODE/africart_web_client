import { createContext, useContext, useState, useEffect } from "react";
import type { Product } from "../interfaces/Product";

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  updateCartItem: (product: Product) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Product[]>(() => {
    const stored = localStorage.getItem("africart_cart");
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Invalid cart data in localStorage, resetting africart_cart.", error);
      localStorage.removeItem("africart_cart");
      return [];
    }
  });

  // Sauvegarde le panier à chaque modification
  useEffect(() => {
    localStorage.setItem("africart_cart", JSON.stringify(cart));
  }, [cart]);

  // Écoute des événements de vidage du panier (ex: logout depuis AuthContext)
  useEffect(() => {
    const handler = () => {
      setCart([]);
      try {
        localStorage.removeItem("africart_cart");
      } catch (e) {
        /* ignore */
      }
    };
    window.addEventListener('africart:clear_cart', handler as EventListener);
    return () => window.removeEventListener('africart:clear_cart', handler as EventListener);
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.identifiant_produit === product.identifiant_produit);
      if (exists) {
        return prev.map((p) =>
          p.identifiant_produit === product.identifiant_produit
            ? { ...p, ...product }
            : p
        );
      }
      return [...prev, { ...product, quantite_produit: product.quantite_produit || 1 }];
    });
  };

  const updateCartItem = (product: Product) => {
    setCart((prev) =>
      prev.map((p) =>
        p.identifiant_produit === product.identifiant_produit
          ? { ...p, ...product }
          : p
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((p) => p.identifiant_produit !== productId));
  };

  const increaseQty = (productId: string) => {
    setCart((prev) =>
      prev.map((p) =>
        p.identifiant_produit === productId &&
        p.quantite_produit !== undefined &&
        p.quantite_produit < p.quantite_produit_disponible
          ? { ...p, quantite_produit: p.quantite_produit + 1 }
          : p
      )
    );
  };

  const decreaseQty = (productId: string) => {
    setCart((prev) =>
      prev.map((p) =>
        p.identifiant_produit === productId &&
        p.quantite_produit !== undefined &&
        p.quantite_produit > 1
          ? { ...p, quantite_produit: p.quantite_produit - 1 }
          : p
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, increaseQty, decreaseQty, updateCartItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
