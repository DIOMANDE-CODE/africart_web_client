import "../styles/HomePage.css";
import CategoryCarousel from "../components/CategoryCarousel";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
// Import des services
import { useCategories } from "../services/produitService";
import { usePersonalRecommendations, usePopularRecommendations } from "../services/recommandationService";
// Import des types et contextes
import type { Category } from "../interfaces/Category";
import type { Product } from "../interfaces/Product";
import type { ProductRecommended } from "../interfaces/ProductsRecommanded";
import { useAuth } from "../context/AuthContext";
// Import des composants UI
import { Alert } from "../components/Alert";
import { CategoryCarouselSkeleton, RecommendationSkeleton } from "../skeletons";
import Chatbot from "../components/Chatbot";

export const HomePage = () => {
    // --- 1. ÉTATS ET CONTEXTE ---
    const { user, loadingSession } = useAuth();
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [category, setCategory] = useState<Category[]>([]);
    const navigate = useNavigate();

    // --- 2. RÉCUPÉRATION DES CATÉGORIES (TanStack Query) ---
    // Note: Assure-toi que ton service utilise l'URL correcte : /categories/list/ (avec slash)
    const { data: catData, isLoading: isLoadingCat, isError: isCatError, error: catError, refetch: refetchCategories } = useCategories();

    useEffect(() => {
        if (catData) {
            // Mapping flexible selon la structure de ta réponse Django
            const rawData = catData.data?.data || catData.data || catData;
            setTimeout(() => setCategory(Array.isArray(rawData) ? rawData : []), 0);
        }
        if (isCatError) {
            const errAny = catError as unknown as Record<string, unknown>;
            const parsedObj = errAny?.parsed as Record<string, unknown> | undefined;
            const parsed = (typeof parsedObj?.message === 'string' ? parsedObj.message : null) || (typeof errAny?.message === 'string' ? errAny.message : null) || 'Erreur de connexion au serveur.';
            setTimeout(() => setAlert({ message: parsed, type: "error" }), 0);
        }
    }, [catData, isCatError, catError]);

    // RECUPERATION DES RECOMMANDATIONS
    const {
        data: recPersonalData,
        isLoading: isLoadingRecPersonal,
        isError: isErrorRecPersonal,
        error: recPersonalError,
    } = usePersonalRecommendations(!!user && !loadingSession);


    useEffect(() => {
        if (!isErrorRecPersonal) return;
        const errAny = recPersonalError as unknown as Record<string, unknown>;
        const parsedObj = errAny?.parsed as Record<string, unknown> | undefined;
        const parsed = (typeof parsedObj?.message === 'string' ? parsedObj.message : null) || (typeof errAny?.message === 'string' ? errAny.message : null) || 'Erreur lors de la récupération des recommandations personnalisées.';
        const resp = errAny?.response as Record<string, unknown> | undefined;
        const status = resp?.status ?? null;
        console.warn('Personal recommendations error', status, recPersonalError);
        if (status === 401) {
            setTimeout(() => setAlert({ message: parsed, type: 'error' }), 0);
            navigate('/login', { replace: true });
            return;
        }
        // setAlert({ message: parsed, type: 'error' });
    }, [isErrorRecPersonal, recPersonalError, navigate]);


    const recommendedPersonal: Product[] = useMemo(() => {
        if (!recPersonalData) return [];

        // Extraction flexible (Data > Data.Data > Root)
        const rawData = recPersonalData.data?.data || recPersonalData.data || recPersonalData;

        // Extraction de la clé 'produits' ou du tableau brut
        return Array.isArray(rawData?.produits) ? rawData.produits :
            Array.isArray(rawData) ? rawData : [];
    }, [recPersonalData]);

    const {
        data: recPopularData,
        isLoading: isLoadingRecPopular,
        isError: isErrorRecPopular,
        error: recPopularError,
    } = usePopularRecommendations();

    useEffect(() => {
        if (!isErrorRecPopular) return;
        const errAny = recPopularError as unknown as Record<string, unknown>;
        const parsedObj = errAny?.parsed as Record<string, unknown> | undefined;
        const parsed = (typeof parsedObj?.message === 'string' ? parsedObj.message : null) || (typeof errAny?.message === 'string' ? errAny.message : null) || 'Erreur lors de la récupération des recommandations populaires.';
        const resp = errAny?.response as Record<string, unknown> | undefined;
        const status = resp?.status ?? null;
        console.warn('Popular recommendations error', status, recPopularError);
        if (status === 401) {
            setTimeout(() => setAlert({ message: parsed, type: 'error' }), 0);
            navigate('/login', { replace: true });
            return;
        }
        setTimeout(() => setAlert({ message: parsed, type: 'error' }), 0);
    }, [isErrorRecPopular, recPopularError, navigate]);


    const recommendedPopular: ProductRecommended[] = useMemo(() => {
        if (!recPopularData) return [];

        // Extraction flexible (Data > Data.Data > Root)
        const rawData = recPopularData.data?.data || recPopularData.data || recPopularData;

        // Extraction de la clé 'produits' ou du tableau brut
        return Array.isArray(rawData?.produits) ? rawData.produits :
            Array.isArray(rawData) ? rawData : [];
    }, [recPopularData]);





    // --- 4. LOGIQUE DU CARROUSEL HERO ---
    const heroImages = useMemo(() => [
        "https://images.unsplash.com/photo-1646770258140-bdf4fce412bf?w=800&auto=format&fit=crop&q=80",
        "https://plus.unsplash.com/premium_photo-1675798983878-604c09f6d154?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=800&auto=format&fit=crop&q=80"
    ], []);

    const [currentHero, setCurrentHero] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHero((prev) => (prev + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    // --- 5. LOGIQUE AUTO-SCROLL (Produits Populaires) ---
    const popularRef = useRef<HTMLDivElement | null>(null);
    const isPausedRef = useRef(false);
    const directionRef = useRef<'right' | 'left'>('right');

    const scrollPopular = (dir: "left" | "right") => {
        const el = popularRef.current;
        if (!el) return;
        const step = Math.round(el.clientWidth * 0.5);
        el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
    };

    useEffect(() => {
        if (!recommendedPopular.length) return;
        const interval = setInterval(() => {
            if (isPausedRef.current || !popularRef.current) return;
            const el = popularRef.current;
            const maxScroll = el.scrollWidth - el.clientWidth;

            if (directionRef.current === 'right' && el.scrollLeft >= maxScroll - 10) directionRef.current = 'left';
            else if (directionRef.current === 'left' && el.scrollLeft <= 10) directionRef.current = 'right';

            const step = Math.round(el.clientWidth * 0.6);
            el.scrollBy({ left: directionRef.current === 'right' ? step : -step, behavior: 'smooth' });
        }, 4500);
        return () => clearInterval(interval);
    }, [recommendedPopular]);

    // État global de chargement pour les Skeletons
    const isGlobalLoading = loadingSession || isLoadingCat || isLoadingRecPersonal || isLoadingRecPopular;

    // Si la récupération des catégories a échoué et qu'il n'y a aucune catégorie, afficher un écran d'erreur
    if (isCatError && category.length === 0) {
        const errAny = catError as unknown as Record<string, unknown>;
        const parsedObj = errAny?.parsed as Record<string, unknown> | undefined;
        const parsedMessage = (typeof parsedObj?.message === 'string' ? parsedObj.message : null) || (typeof errAny?.message === 'string' ? errAny.message : null) || 'Impossible de charger les catégories.';
        return (
            <section id="home" className="page">
                <div className="container" style={{ padding: '80px 0' }}>
                    <div style={{ textAlign: 'center' }} role="alert" aria-live="assertive">
                        <i className="fas fa-exclamation-circle fa-3x mb-3" style={{ color: '#e74c3c' }} />
                        <h2>Erreur de chargement</h2>
                        <p style={{ marginBottom: 18 }}>{parsedMessage}</p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={() => refetchCategories && refetchCategories()}>
                                Réessayer
                            </button>
                            <button className="btn-back" onClick={() => navigate('/products')}>Voir les produits</button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section id="home" className="page">
                {/* Hero Section */}
                <div className="hero-section">
                    <div className="container">
                        <div className="hero-content">
                            <div className="hero-text">
                                <span className="hero-badge">Africart : Mon marché en ligne</span>
                                <h1 className="hero-title">Votre marché public en ligne</h1>
                                <p className="hero-description">Découvrez notre plateforme e-commerce qui vous permet de faire votre marché depuis chez vous.</p>
                                {!user && (
                                    <div className="hero-actions">
                                        <Link to="/login" className="btn btn-primary"><i className="fas fa-sign-in-alt" /> Se connecter</Link>
                                    </div>
                                )}
                            </div>
                            <div className="hero-visual">
                                {heroImages.map((img, idx) => (
                                    <div key={idx} className={`hero-image${idx === currentHero ? " active animated" : ""}`}>
                                        <img src={img} alt="Marché Africart" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Recommandations */}
                <div className="recommendations-section">
                    <div className="container">
                        {isGlobalLoading ? (
                            <RecommendationSkeleton count={4} />
                        ) : (
                            <>
                                {/* Recommandations Personnalisées */}
                                {recommendedPersonal.length > 0 && (
                                    <div className="recommendation-block mb-5">
                                        <div className="section-header"><h3>Recommandés pour vous</h3></div>
                                        <div className="recommendation-list">
                                            {recommendedPersonal.map((p) => (
                                                <div key={p.identifiant_produit} className="rec-card">
                                                    <img src={p.thumbnail} alt={p.nom_produit} loading="lazy" />
                                                    <div className="rec-meta">
                                                        <div className="rec-title">{p.nom_produit}</div>
                                                        <div className="rec-price">{p.prix_unitaire_produit} FCFA</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Produits Populaires / Dynamiques */}
                                {recommendedPopular.length > 0 && (
                                    <div className="recommendation-block mb-5 popular">
                                        <div className="section-header">
                                            <h3>{user ? `Sélection pour ${user.nom_utilisateur}` : "Les plus populaires"}</h3>
                                        </div>
                                        <button className="carousel-nav prev" onClick={() => scrollPopular('left')}>‹</button>
                                        <div
                                            className="recommendation-list"
                                            ref={popularRef}
                                            onMouseEnter={() => isPausedRef.current = true}
                                            onMouseLeave={() => isPausedRef.current = false}
                                        >
                                            {recommendedPopular.map((p) => (
                                                <article className="carousel-item" key={p.identifiant_produit}>
                                                    <Link to={`/products/detail/${p.identifiant_produit}`}>
                                                        <div className="item-image"><img src={p.thumbnail} alt={p.nom_produit} /></div>
                                                        <div className="item-body">
                                                            <h6 className="category-label">{p.categorie}</h6>
                                                            <div className="item-title">{p.nom_produit}</div>
                                                            <div className="item-price">{p.prix} FCFA</div>
                                                        </div>
                                                    </Link>
                                                </article>
                                            ))}
                                        </div>
                                        <button className="carousel-nav next" onClick={() => scrollPopular('right')}>›</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Section Produits par Catégorie */}
                <div className="products-section" id="products">
                    <div className="container">
                        {
                            category && (
                                <div className="products-header">
                                    <h2 className="section-title">Nos rayons</h2>
                                    <Link to="/products" className="view-all">Tout voir <i className="fas fa-arrow-right" /></Link>
                                </div>
                            )
                        }


                        {isGlobalLoading ? (
                            <><CategoryCarouselSkeleton /><CategoryCarouselSkeleton /></>
                        ) : (
                            category.slice(0, 5).map((c) => (
                                <CategoryCarousel
                                    key={c.identifiant_categorie}
                                    title={c.nom_categorie}
                                    products={c.produits}
                                />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            <Chatbot />
        </>
    );
};