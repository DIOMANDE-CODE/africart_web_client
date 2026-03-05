import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { CartSidebar } from "./CartSidebar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const { cart } = useCart();
    const { user, loadingSession } = useAuth();
    const location: string = useLocation().pathname
    const [sessionChecking, setSessionChecking] = useState(false);


    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMobileOpen(false);
                setCartOpen(false);
            }
        };

        if (mobileOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEscape);
        } else {
            document.body.style.overflow = "";
        }

        return () => window.removeEventListener("keydown", handleEscape);
    }, [mobileOpen, cartOpen]);

    // Listen for session check start/end events to show a small spinner locally
    useEffect(() => {
        const start = () => setSessionChecking(true);
        const end = () => setSessionChecking(false);
        window.addEventListener('africart:session_check_start', start as EventListener);
        window.addEventListener('africart:session_check_end', end as EventListener);
        return () => {
            window.removeEventListener('africart:session_check_start', start as EventListener);
            window.removeEventListener('africart:session_check_end', end as EventListener);
        };
    }, []);

    const closeMobile = () => setMobileOpen(false);

    return (
        <header className="main-header">
            <div className="container header-content">
                <NavLink to="/" className="logo" onClick={closeMobile}>
                    <div className="logo-icon"><img src="/src/assets/Logo_AfriCart_sans_fond.png" alt="AfriCart Logo" /></div>
                    <div className="logo-text">
                        Afri<span>Cart</span>
                    </div>
                </NavLink>

                <nav className="nav-menu">
                    <NavLink
                        to="/"
                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                    >
                        Accueil
                    </NavLink>

                    <NavLink
                        to="/products"
                        className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                    >
                        Produits
                    </NavLink>
                </nav>

                <div className="nav-actions">
                    {
                        location === "/checkout" || location === "/confirmation" ? (
                            <button className="action-btn " aria-label="Voir le panier" onClick={() => setCartOpen(true)} aria-expanded={cartOpen} disabled>
                                <i className="fas fa-shopping-cart" />
                                <span className="action-badge">{cart.length}</span>
                            </button>
                        ) : (
                            <button className="action-btn" aria-label="Voir le panier" onClick={() => setCartOpen(true)} aria-expanded={cartOpen}>
                                <i className="fas fa-shopping-cart" />
                                <span className="action-badge">{cart.length}</span>
                            </button>
                        )
                    }

                    {
                                        // During session check render a small spinner to avoid layout shift
                                        (sessionChecking || loadingSession) ? (
                                            <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                                                <span className="small-loader-spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                                            </div>
                                        ) : !user ? (
                                            <Link to="/login" aria-label="Se connecter">
                                                <button className="action-btn">
                                                    <i className="fas fa-sign-in-alt" />
                                                </button>
                                            </Link>
                                        ) : (
                                            <NavLink to="/account">
                                                <div className="user-avatar">
                                                    {user?.nom_utilisateur && user?.nom_utilisateur?.slice(0, 2).toUpperCase() || "?"}
                                                </div>
                                            </NavLink>
                                        )
                    }

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                        aria-expanded={mobileOpen}
                    >
                        <i className={`fas fa-${mobileOpen ? "times" : "bars"}`} />
                    </button>

                </div>
                <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
            </div>

            {/* Mobile Menu Drawer */}
            {mobileOpen && (
                <>
                    <div className="mobile-menu-backdrop" onClick={closeMobile} aria-hidden="true" />
                    <nav className="mobile-menu-drawer">
                        <div className="mobile-menu-header">
                            <h3>Navigation</h3>
                            <button
                                className="mobile-menu-close"
                                onClick={closeMobile}
                                aria-label="Fermer le menu"
                            >
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        <div className="mobile-menu-content">
                            <NavLink
                                to="/"
                                className={({ isActive }) => (isActive ? "mobile-nav-link active" : "mobile-nav-link")}
                                onClick={closeMobile}
                            >
                                <i className="fas fa-home" /> Accueil
                            </NavLink>
                            <NavLink
                                to="/products"
                                className={({ isActive }) => (isActive ? "mobile-nav-link active" : "mobile-nav-link")}
                                onClick={closeMobile}
                            >
                                <i className="fas fa-shopping-bag" /> Produits
                            </NavLink>
                        </div>
                        <div className="mobile-menu-footer">
                            <button className="mobile-action-btn" onClick={() => { setCartOpen(true); closeMobile(); }}>
                                <i className="fas fa-shopping-cart" />
                                <span>Panier ({cart.length})</span>
                            </button>
                            {/* <button className="mobile-action-btn" onClick={() => { closeMobile(); }}>
                                <i className="fas fa-heart" />
                                <span>Favoris (12)</span>
                            </button> */}
                        </div>
                    </nav>
                </>
            )}
        </header>
    );
};
