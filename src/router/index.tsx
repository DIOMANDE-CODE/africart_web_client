import { Route, Routes, useLocation } from "react-router-dom";

import { Header } from "../client/components/Header";
import { Footer } from "../client/components/Footer";
import { PrivateRoute, PublicRoute } from "../client/components/LockRoute";

import { Login } from "../client/pages/authentification/Login";
import { Register } from "../client/pages/authentification/Register";
import { HomePage } from "../client/pages/HomePage";
import { ProductsPage } from "../client/pages/ProductsPage";
import { DetailProductPage } from "../client/pages/DetailProductPage";
import { AccountPage } from "../client/pages/AccountPage";
import { CheckoutPage } from "../client/pages/CheckoutPage";
import { ConfirmationPage } from "../client/pages/ConfirmationPage";
import { ReceiptPage } from "../client/pages/ReceiptPage";
import CommandesPage from "../client/pages/CommandesPage";
import { NotFoundPage } from "../client/pages/NotFoundPage";
import { ServerErrorPage } from "../client/pages/ServerErrorPage";

import {
  AdminLayout,
  DashboardPage,
  ProductsManagementPage,
  OrdersManagementPage,
  UsersManagementPage,
  CategoriesManagementPage,
} from "../admin";

/**
 * Centralised application router.
 * Owns Header/Footer visibility logic and all route declarations.
 */
export function AppRoutes() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className={isAdminPage ? undefined : "app-container"}>
      {!isAuthPage && !isAdminPage && <Header />}

      <Routes>
        {/* ── Admin routes (own layout, role-gated inside AdminLayout) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsManagementPage />} />
          <Route path="orders" element={<OrdersManagementPage />} />
          <Route path="categories" element={<CategoriesManagementPage />} />
          <Route path="users" element={<UsersManagementPage />} />
        </Route>

        {/* ── Public-only routes (redirect to / when authenticated) ── */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* ── Open routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/detail/:id" element={<DetailProductPage />} />

        {/* ── Protected routes (redirect to /login when unauthenticated) ── */}
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <AccountPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <PrivateRoute>
              <ConfirmationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/receipt/:id"
          element={
            <PrivateRoute>
              <ReceiptPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/commandes"
          element={
            <PrivateRoute>
              <CommandesPage />
            </PrivateRoute>
          }
        />

        {/* ── Pages d'erreur ── */}
        <Route path="/500" element={<ServerErrorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
}
