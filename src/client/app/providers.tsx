import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

/**
 * Composes all React context providers in one place.
 * Wrap the router/app shell with <AppProviders> so every page
 * has access to auth and cart state without re-importing providers.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
