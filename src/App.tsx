import './App.css'
import { useEffect, useState } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Preloader } from './components/Preloader'
import { Route, Routes, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { AccountPage } from './pages/AccountPage'
import { DetailProductPage } from './pages/DetailProductPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmationPage } from './pages/ConfirmationPage'
import { CartProvider } from './context/CartContext'
import { Login } from './pages/authentification/Login'
import { Register } from './pages/authentification/Register'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute, PublicRoute } from './components/LockRoute'

function App() {
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(true)

  useEffect(() => {
    const hide = () => setTimeout(() => setShowPreloader(false), 600)
    if (document.readyState === 'complete') {
      hide()
    } else {
      window.addEventListener('load', hide)
      return () => window.removeEventListener('load', hide)
    }
  }, [])

  // Vérifie si on est sur la page login
  const isLoginPage = location.pathname === "/login" || location.pathname === "/register";

  if (showPreloader) {
    return <Preloader />
  }

  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-container">
          {/* Affiche Header sauf sur /login */}
          {!isLoginPage && <Header />}
          <Routes>
            {/* Routes publiques accessibles seulement si NON connecté */}
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

            {/* Routes accessibles à tous */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/detail/:id" element={<DetailProductPage />} />

            {/* Routes protégées accessibles seulement si connecté */}
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
          </Routes>

          {/* Affiche Footer sauf sur /login */}
          {!isLoginPage && <Footer />}
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
