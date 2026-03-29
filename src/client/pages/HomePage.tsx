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
    const { data: catData, isLoading: isLoadingCat, isError: isCatError } = useCategories();

    useEffect(() => {
        if (catData) {
            // Mapping flexible selon la structure de ta réponse Django
            const rawData = catData.data?.data || catData.data || catData;
            setCategory(Array.isArray(rawData) ? rawData : []);
        }
        if (isCatError) {
            setAlert({ message: "Erreur de connexion au serveur (404 ou 500).", type: "error" });
        }
    }, [catData, isCatError]);

    // RECUPERATION DES RECOMMANDATIONS
    const {
        data: recPersonalData,
        isLoading: isLoadingRecPersonal,
        isError: isErrorRecPersonal,
        error: axiosError
    } = usePersonalRecommendations(!!user && !loadingSession);


    useEffect(() => {
        if (!isErrorRecPersonal) return;

        // Gestion d'erreur détaillée selon le code HTTP
        const status = (axiosError as any)?.response?.status ?? null;
        console.warn('Personal recommendations error', status, axiosError);

        switch (status) {
            case 401:
                setAlert({ message: "Session expirée. Veuillez vous reconnecter.", type: "error" });
                navigate('/login', { replace: true });
                break;
            case 403:
                setAlert({ message: "Accès refusé aux recommandations.", type: "error" });
                break;
            case 404:
                setAlert({ message: "Aucune recommandation trouvée pour votre compte.", type: "error" });
                break;
            case 429:
                setAlert({ message: "Trop de requêtes. Réessayez dans un instant.", type: "error" });
                break;
            default:
                setAlert({ message: "Erreur serveur lors de la récupération des recommandations.", type: "error" });
                break;
        }
    }, [isErrorRecPersonal, axiosError, navigate]);


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
    } = usePopularRecommendations();

    useEffect(() => {
        if (!isErrorRecPopular) return;

        // Gestion d'erreur détaillée selon le code HTTP
        const status = (axiosError as any)?.response?.status ?? null;
        console.warn('Popular recommendations error', status, axiosError);

        switch (status) {
            case 401:
                setAlert({ message: "Session expirée. Veuillez vous reconnecter.", type: "error" });
                navigate('/login', { replace: true });
                break;
            case 403:
                setAlert({ message: "Accès refusé aux recommandations.", type: "error" });
                break;
            case 404:
                setAlert({ message: "Aucune recommandation trouvée pour votre compte.", type: "error" });
                break;
            case 429:
                setAlert({ message: "Trop de requêtes. Réessayez dans un instant.", type: "error" });
                break;
            default:
                setAlert({ message: "Erreur serveur lors de la récupération des recommandations.", type: "error" });
                break;
        }
    }, [isErrorRecPopular, axiosError, navigate]);


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