import "../styles/HomePage.css";
import CategoryCarousel from "../components/CategoryCarousel";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import type { Category } from "../interfaces/Category";
import type { Product } from "../interfaces/Product";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { CategoryCarouselSkeleton, RecommendationSkeleton } from "../skeletons";
import Chatbot from "../components/Chatbot";
import type { ProductRecommended } from "../interfaces/ProductsRecommanded";

export const HomePage = () => {

    // Creation des useState
    const [category, setCategory] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loadingSession } = useAuth();
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [recommendedPersonal, setRecommendedPersonal] = useState<Product[]>([]);
    const [recommendedPopular, setRecommendedPopular] = useState<ProductRecommended[]>([]);

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

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                // essaie endpoint personnalisé
                const respPersonal = await api.get('/produits/recommendations/personal/');
                if (respPersonal.status === 200 && respPersonal.data?.data) setRecommendedPersonal(respPersonal.data.data.produits || respPersonal.data.data || []);
            } catch (e) {
                // ignore si non disponible
            }

            try {
                const respPopular = await api.get('/recommandations/?type=best_sellers');
                if (respPopular.status === 200 && respPopular.data?.data) {
                    const prods = respPopular.data.data.produits || [];
                    setRecommendedPopular(prods);
                }
            } catch (e) {
                // fallback: rien
            }
        };
        fetchRecommendations();
    }, []);

    const popularRef = useRef<HTMLDivElement | null>(null);
    const isPausedRef = useRef(false);
    const autoScrollIntervalRef = useRef<number | null>(null);
    const directionRef = useRef<'right' | 'left'>('right');

    const scrollPopular = (dir: "left" | "right") => {
        const el = popularRef.current;
        if (!el) return;
        const step = Math.round(el.clientWidth * 0.4) || 300;
        el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
    };

    useEffect(() => {
        if (!recommendedPopular || recommendedPopular.length === 0) return;
        // start auto scroll
        if (autoScrollIntervalRef.current) return;
        autoScrollIntervalRef.current = window.setInterval(() => {
            if (isPausedRef.current) return;
            const el = popularRef.current;
            if (!el) return;
            const max = el.scrollWidth - el.clientWidth;
            const atEnd = el.scrollLeft >= (max - 8);
            const atStart = el.scrollLeft <= 8;
            // flip direction if needed
            if (directionRef.current === 'right' && atEnd) directionRef.current = 'left';
            else if (directionRef.current === 'left' && atStart) directionRef.current = 'right';

            // perform scroll step based on direction
            const step = Math.max(160, Math.round(el.clientWidth * 0.6));
            el.scrollBy({ left: directionRef.current === 'right' ? step : -step, behavior: 'smooth' });
        }, 3500) as unknown as number;

        return () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current as number);
                autoScrollIntervalRef.current = null;
            }
        };
    }, [recommendedPopular]);

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

                {/* Espace recommandations */}
                <div className="recommendations-section">
                    <div className="container">
                        {recommendedPersonal && recommendedPersonal.length > 0 ? (
                            <div className="recommendation-block mb-5">
                                <div className="section-header">
                                    <h3>Recommandés pour vous</h3>
                                </div>
                                <div className="recommendation-list">
                                    {recommendedPersonal.map((p) => (
                                        <div key={p.identifiant_produit} className="rec-card">
                                            <img src={p.thumbnail} alt={p.nom_produit} />
                                            <div className="rec-meta">
                                                <div className="rec-title">{p.nom_produit}</div>
                                                <div className="rec-price">{p.prix_unitaire_produit} FCFA</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            loading && <RecommendationSkeleton count={4} />
                        )}

                        {recommendedPopular && recommendedPopular.length > 0 ? (
                            <div className="recommendation-block mb-5 popular" >
                                <div className="section-header">
                                    <h3>PRODUITS POPULAIRES</h3>
                                </div>
                                    <button type="button" className="carousel-nav prev" onClick={() => scrollPopular('left')} aria-label="Précédent">‹</button>
                                    <div
                                        className="recommendation-list"
                                        ref={popularRef}
                                        onMouseEnter={() => { isPausedRef.current = true; }}
                                        onMouseLeave={() => { isPausedRef.current = false; }}
                                    >
                                        {recommendedPopular.map((p) => (
                                            <article className="carousel-item" key={p.identifiant_produit} role="listitem">
                                                <a href={`/products/detail/${p.identifiant_produit}`}>
                                                    <div className="item-image">
                                                        <img src={p.thumbnail} alt={p.nom_produit} loading="lazy" />
                                                    </div>
                                                    <div className="item-body">
                                                        <h6 style={{color:"black"}}>{p.categorie}</h6>
                                                        <div className="item-title">{p.nom_produit}</div>
                                                        <div className="item-price">{p.prix} FCFA</div>
                                                    </div>
                                                </a>
                                            </article>
                                        ))}
                                    </div>
                                    <button type="button" className="carousel-nav next" onClick={() => scrollPopular('right')} aria-label="Suivant">›</button>
                            </div>
                        ) : (
                            loading && <RecommendationSkeleton count={4} />
                        )}
                    </div>
                </div>

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
