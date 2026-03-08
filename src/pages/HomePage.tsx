import "../styles/HomePage.css";
import CategoryCarousel from "../components/CategoryCarousel";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import type { Category } from "../interfaces/Category";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { CategoryCarouselSkeleton } from "../skeletons";
import Chatbot from "../components/Chatbot";

export const HomePage = () => {

    // Creation des useState
    const [category, setCategory] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loadingSession } = useAuth();
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Fonction pour recuperer les categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await api.get("/produits/list/categorie/");
            if (response.status === 200) {
                setCategory(response.data.data);
            }
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;

                if (status === 400) {
                    setAlert({ message: "Erreur de saisie.", type: "error" });
                } else if (status === 500) {
                    setAlert({ message: "Erreur survenue au serveur.", type: "error" });
                } else if (status === 401) {
                    setAlert({ message: "Accès non autorisé.", type: "error" });
                } else {
                    setAlert({ message: "Erreur inconnue.", type: "error" });
                }
            }
        } finally {
            setLoading(false);
        }
    }


    // Images du carrousel hero
    const heroImages = [
        "https://images.unsplash.com/photo-1646770258140-bdf4fce412bf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHZpdnJpZXJzfGVufDB8fDB8fHww",
        "https://plus.unsplash.com/premium_photo-1675798983878-604c09f6d154?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGVndW1lfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bGVndW1lfGVufDB8fDB8fHww"
    ];

    const [currentHero, setCurrentHero] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHero((prev) => (prev + 1) % heroImages.length);
        }, 3000);
        return () => clearInterval(interval);

    }, [heroImages.length]);

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <>
            {/* Page d'accueil */}
            <section id="home" className="page">
                <div className="hero-section">
                    <div className="container">
                        <div className="hero-content">
                            <div className="hero-text">
                                <span className="hero-badge">Africart : Mon marché en ligne </span>
                                <h1 className="hero-title">
                                    Votre marché public en ligne
                                </h1>
                                <p className="hero-description">
                                    Découvrez notre plateforme e-commerce qui vous permet de faire votre marché depuis chez vous.
                                </p>
                                {
                                    !user && (
                                        <div className="hero-actions">
                                            <Link to="/login" className="btn btn-primary">
                                                <i className="fas fa-sign-in-alt" />
                                                Se connecter
                                            </Link>
                                        </div>
                                    )
                                }

                            </div>
                            <div className="hero-visual">
                                {heroImages.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className={`hero-image${idx === currentHero ? " active animated" : ""}`}
                                    >
                                        <img src={img} alt={`Hero ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catégories */}
                {/* <div className="categories-section" id="categories">
                    <div className="container">
                        <div className="categories-grid">
                            {
                                category.map((c) => (
                                    <div className="category-card" key={c.identifiant_categorie}>
                                        <h3 className="category-name">{c.nom_categorie}</h3>
                                    </div>
                                ))
                            }

                        </div>
                    </div>
                </div> */}

                {/* Produits par catégorie */}
                <div className="products-section" id="products">
                    <div className="container">
                        <div className="products-header">
                            <Link to="/products" className="view-all">
                                Voir plus <i className="fas fa-arrow-right" />
                            </Link>
                        </div>

                        {(loadingSession || loading) ? (
                            <>
                                <CategoryCarouselSkeleton />
                                <CategoryCarouselSkeleton />
                                <CategoryCarouselSkeleton />
                            </>
                        ) : (
                            category.slice(0, 5).map((c) => (
                                <CategoryCarousel key={c.identifiant_categorie} title={c.nom_categorie} products={c.produits} />
                            ))
                        )}

                        {/* <div className="view-more-section">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                Voir les produits
                            </Link>
                        </div> */}
                    </div>
                </div>
            </section>
            {alert && (
                <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} duration={3000} />
            )}

            <Chatbot />

        </>
    );
};
