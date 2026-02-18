import "../styles/HomePage.css";
import CategoryCarousel from "../components/CategoryCarousel";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import type { Category } from "../interfaces/Category";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";


export const HomePage = () => {

    // Creation des useState
    const [category, setCategory] = useState<Category[]>([]);
    const { user, } = useAuth();
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Fonction pour recuperer les categories
    const fetchCategories = async () => {
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
        }
    }


    // Images du carrousel hero
    const heroImages = [
        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
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
                                <span className="hero-badge">Nouveau : IA Shopping</span>
                                <h1 className="hero-title">
                                    L'expérience shopping réinventée pour l'Afrique
                                </h1>
                                <p className="hero-description">
                                    Découvrez une plateforme e-commerce intelligente avec
                                    recommandations personnalisées, livraison ultra-rapide et
                                    paiements 100% sécurisés.
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
                                Voir tout <i className="fas fa-arrow-right" />
                            </Link>
                        </div>

                        {category.slice(0, 5).map((c) => (
                            <CategoryCarousel key={c.identifiant_categorie} title={c.nom_categorie} products={c.produits} />
                        ))}

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

        </>
    );
};
