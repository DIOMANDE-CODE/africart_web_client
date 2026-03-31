import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/ProductsPage.css';
import { useCategories, useProducts } from '../services/produitService';
import { usePopularRecommendations } from '../services/recommandationService';
import { SmallLoader } from '../components/Loader';
import { ProductRating } from '../components/ProductRating';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductSkeletonGrid, RecommendationSkeleton } from '../skeletons';
import SearchInput from '../components/SearchInput';
import { isNewArrival } from '../utils/isNewArrival';
import Chatbot from '../components/Chatbot';
import { Alert } from "../components/Alert";
import type { Product } from '../interfaces/Product';
import type { ProductRecommended } from '../interfaces/ProductsRecommanded';

export const ProductsPage = () => {
    const { addToCart, cart } = useCart();
    const { user, loadingSession } = useAuth();
    const navigate = useNavigate();

    // --- ÉTATS DES FILTRES ---
    const [categorieParams, setCategoryParams] = useState("");
    const [triParams, setTriParams] = useState("");
    const [search, setSearch] = useState("");
    const limit = 20;

    // --- ÉTATS UI ---
    const [currentBanner] = useState(0);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // --- 1. CHARGEMENT DES CATÉGORIES ---
    const { data: catData, isError: isCatError, error: catError } = useCategories();
    const categories = catData?.data?.data || catData?.data || catData || [];

    // --- 2. INFINITE SCROLL AVEC TANSTACK QUERY ---
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingProd,
        isFetching: isFetchingProd,
        isError: isProdError,
        error: prodError
    } = useProducts({
        limit,
        categorie: categorieParams,
        tri_par: triParams,
        search: search
    });

    // Aplatissement des pages de produits (Fusion automatique et propre)
    const allProducts = data?.pages.flatMap(page => {
        const p = page.data?.data || page.data || page;
        return p.results || [];
    }) || [];


    // --- 3. RECOMMANDATIONS & ANIMATIONS ---
    const {
        data: recPopularData,
        isLoading: isLoadingRecPopular,
        isError: isErrorRecPopular,
        error: axiosError
    } = usePopularRecommendations();

    useEffect(() => {
        if (!isErrorRecPopular) return;

        // Gestion d'erreur détaillée selon le code HTTP
        const errAny = axiosError as unknown as Record<string, unknown>;
        const resp = errAny?.response as Record<string, unknown> | undefined;
        const status = resp?.status ?? null;
        console.warn('Popular recommendations error', status, axiosError);

        switch (status) {
            case 401:
                setTimeout(() => setAlert({ message: "Session expirée. Veuillez vous reconnecter.", type: "error" }), 0);
                navigate('/login', { replace: true });
                break;
            case 403:
                setTimeout(() => setAlert({ message: "Accès refusé aux recommandations.", type: "error" }), 0);
                break;
            case 404:
                setTimeout(() => setAlert({ message: "Aucune recommandation trouvée pour votre compte.", type: "error" }), 0);
                break;
            case 429:
                setTimeout(() => setAlert({ message: "Trop de requêtes. Réessayez dans un instant.", type: "error" }), 0);
                break;
            default:
                setTimeout(() => setAlert({ message: "Erreur serveur lors de la récupération des recommandations.", type: "error" }), 0);
                break;
        }
    }, [isErrorRecPopular, axiosError, navigate]);



    const recommended: ProductRecommended[] = useMemo(() => {
        if (!recPopularData) return [];

        // Extraction flexible (Data > Data.Data > Root)
        const rawData = recPopularData.data?.data || recPopularData.data || recPopularData;

        return Array.isArray(rawData?.produits) ? rawData.produits :
            Array.isArray(rawData) ? rawData : [];
    }, [recPopularData]);


    // --- 4. GESTION DU SCROLL INFINI (OBSERVER) ---
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Alertes d'erreurs
    useEffect(() => {
        if (isCatError || isProdError) {
            const sourceError = isCatError ? catError : prodError;
            const errAny = sourceError as unknown as Record<string, unknown>;
            const parsedObj = errAny?.parsed as Record<string, unknown> | undefined;
            const parsed = (typeof parsedObj?.message === 'string' ? parsedObj.message : null) || (typeof errAny?.message === 'string' ? errAny.message : null) || 'Erreur lors de la récupération des produits.';
            setTimeout(() => setAlert({ message: parsed, type: "error" }), 0);
        }
    }, [isCatError, isProdError, catError, prodError]);

    // État global de chargement pour les Skeletons
    const isGlobalLoading = loadingSession || isLoadingProd || isLoadingRecPopular;

    if (loadingSession || (isLoadingProd && allProducts.length === 0)) {
        return <ProductSkeletonGrid count={12} />;
    }

    if (isGlobalLoading) {
        return (
            <RecommendationSkeleton />
        )
    }

    return (
        <section className="page products-page active">
            <div className="products-hero">
                <div className="products-hero-carousel">
                    {[
                        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&auto=format&fit=crop&q=60",
                        "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?w=500&auto=format&fit=crop&q=60",
                        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60"
                    ].map((img, idx) => (
                        <div key={idx} className={`products-hero-banner${idx === currentBanner ? " active animated" : ""}`}>
                            <img src={img} alt="Promo" loading="lazy" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="container">
                <div className="products-search-section mb-5">
                    <SearchInput setSearch={setSearch} />
                </div>

                {/* Recommandations */}
                {recommended.length > 0 && (
                    <div className="recommendation-block mb-5">
                        <div className="section-header">
                            <h3>{user ? `Pour vous, ${user.nom_utilisateur}` : "Produits populaires"}</h3>
                        </div>
                        <div className="recommendation-list">
                            {recommended.map((p) => (
                                <article className="carousel-item" key={p.identifiant_produit}>
                                    <Link to={`/products/detail/${p.identifiant_produit}`}>
                                        <div className="item-image"><img src={p.thumbnail} alt={p.nom_produit} /></div>
                                        <div className="item-body">
                                            <div className="item-title">{p.nom_produit}</div>
                                            <div className="item-price">{p.prix} FCFA</div>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filtres */}
                <div className="filters-section mb-5">
                    <div className="filters-container">
                        <div className="filter-group">
                            <label className="filter-label">Catégorie</label>
                            <select className="filter-select" value={categorieParams} onChange={(e) => setCategoryParams(e.target.value)}>
                                <option value="">Toutes les catégories</option>
                                {categories.map((cat: Record<string, unknown>) => (
                                    <option key={String(cat.identifiant_categorie)} value={String(cat.nom_categorie)}>{String(cat.nom_categorie)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Trier par</label>
                            <select className="filter-select" value={triParams} onChange={(e) => setTriParams(e.target.value)}>
                                <option value="">Aucun tri</option>
                                <option value="prix_croissant">Prix croissant</option>
                                <option value="prix_decroissant">Prix décroissant</option>
                                <option value="nouveautes">Nouveautés</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Grille Produits */}
                <div className="products-display">
                    <div className={`products-grid ${isFetchingProd && !isFetchingNextPage ? 'filtering' : ''}`}>
                        {allProducts.length > 0 ? (
                            allProducts.map((p: Product) => (
                                <div className="product-card card card-hover fade-in" key={p.identifiant_produit}>
                                    <div className="product-image">
                                        <img src={p.thumbnail || ''} alt={p.nom_produit} loading="lazy" />
                                        <div className="product-badges">
                                            {isNewArrival(p.date_creation || '') && <span className="badge badge-nouveaute">Nouveauté</span>}
                                        </div>
                                        <div className="product-actions">
                                            {cart.some(i => i.identifiant_produit === p.identifiant_produit) ? (
                                                <button className="btn btn-success btn-sm" disabled><i className="fas fa-check" /> Ajouté</button>
                                            ) : (
                                                <button className="btn btn-primary btn-sm" onClick={() => addToCart({ ...p, quantite_produit: 1 } as Product)}>
                                                    <i className="fas fa-cart-plus" /> Ajouter
                                                </button>
                                            )}
                                            <Link to={`/products/detail/${p.identifiant_produit}`}>
                                                <button className="btn btn-secondary btn-icon"><i className="far fa-eye" /></button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="product-info">
                                        <h6>{p.categorie_produit?.nom_categorie}</h6>
                                        <h3 className="product-title">{p.nom_produit}</h3>
                                        <ProductRating productId={p.identifiant_produit} />
                                        <div className="product-price">{p.prix_unitaire_produit} FCFA</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !isFetchingProd && <p className="text-center w-100">Aucun produit trouvé.</p>
                        )}
                    </div>
                </div>

                {/* Sentinel & Loader */}
                <div ref={sentinelRef} style={{ height: '50px' }} />
                {isFetchingNextPage && (
                    <div className="text-center p-4"><SmallLoader /></div>
                )}
            </div>

            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            <Chatbot />
        </section>
    );
};