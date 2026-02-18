import { useState, useEffect, useRef } from 'react';
import '../styles/ProductsPage.css';
import type { Category } from '../interfaces/Category';
import type { Product } from '../interfaces/Product';
import api from '../services/api';
import { SmallLoader } from '../components/Loader';
import { useCart } from '../context/CartContext';
import { ProductSkeletonGrid } from '../skeletons';
import SearchInput from '../components/SearchInput';

export const ProductsPage = () => {

    const { addToCart, cart } = useCart();

    // Paramètre de filtrage
    const [categorieParams, setCategoryParams] = useState("")
    const [isFiltering, setIsFiltering] = useState(false);
    const [triParams, setTriParams] = useState("")
    const [search, setSearch] = useState("")


    // UI state: contrôle affichage filtres (mobile)
    const [showFilters, setShowFilters] = useState(true);
    const [currentBanner, setCurrentBanner] = useState(0);
    const [category, setCategory] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [offset, setOffset] = useState(0)
    const [next, setNext] = useState(null)
    const limit = 20


    // Ajout au panier : empêche doublon, met à jour si déjà présent
    const handleAddToCart = (p: Product) => {
        addToCart({
            identifiant_produit: p?.identifiant_produit || "",
            nom_produit: p?.nom_produit || "",
            prix_unitaire_produit: p?.prix_unitaire_produit || "",
            quantite_produit_disponible: p?.quantite_produit_disponible || 0,
            seuil_alerte_produit: p?.seuil_alerte_produit || 0,
            thumbnail: p?.thumbnail || "",
            image_produit: p?.image_produit || "",
            quantite_produit: 1
        } as Product);
    };



    // Fonction pour recuperer les categories
    const fetchCategories = async () => {
        try {
            const response = await api.get("/produits/list/categorie/");
            if (response.status === 200) {
                setCategory(response.data.data);
                console.log(response.data.data);
            }
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data;

                if (status === 400) {
                    console.log("Erreur 400:", message.errors || "Erreur de saisie");
                } else if (status === 500) {
                    console.log("Erreur 500:", "Erreur survenue au serveur");
                } else if (status === 401) {
                    console.log("Accès non autorisé:", message);
                } else {
                    console.log("Erreur inconnue:", error.message || "Erreur survenue");
                }
            }
        }
    }

    // Fonction pour recuperer les produits
    const fetchProducts = async (customOffset = offset, replace = false) => {
        try {
            const response = await api.get("/produits/list/", {
                params: {
                    limit,
                    offset: customOffset,
                    categorie: categorieParams,
                    tri_par: triParams,
                    search: search,
                }
            });
            if (response.status === 200) {
                const root = response.data;
                const pagination = root.data;
                if (replace) {
                    setProducts(pagination.results);
                } else {
                    setProducts((prev) => {
                        const merged = [...prev, ...pagination.results];

                        const unique = merged.filter(
                            (item, index, self) =>
                                index === self.findIndex(
                                    (p) => p.identifiant_produit === item.identifiant_produit
                                )
                        );
                        return unique;
                    });
                }
                setOffset(customOffset + pagination.results.length);
                setNext(pagination.next);

            }
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data;

                if (status === 400) {
                    console.log("Erreur 400:", message.errors || "Erreur de saisie");
                } else if (status === 500) {
                    console.log("Erreur 500:", "Erreur survenue au serveur");
                } else if (status === 401) {
                    console.log("Accès non autorisé:", message);
                } else {
                    console.log("Erreur inconnue:", error.message || "Erreur survenue");
                }
            }
        } finally {
            setLoading(false);
            // Lorsque fetch terminé, désactiver le flag d'animation si actif
            try { setIsFiltering(false); } catch (e) { }
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % 3);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setProducts([]);
        setOffset(0);
        setNext(null);
        setIsFiltering(true);
        fetchProducts(0, true);
    }, [categorieParams, triParams, search]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && next && !loading) {
                    setLoading(true);
                    fetchProducts(offset).finally(() => setLoading(false));
                }
            },
            { threshold: 0.5 }
        );

        const sentinel = sentinelRef.current;
        if (sentinel) observer.observe(sentinel);
        return () => {
            if (sentinel) observer.unobserve(sentinel);
        };
    }, [next, offset, loading]);

    if (loading) {
        return <ProductSkeletonGrid count={12} />;
    }


    return (
        <>
            {/* Page Produits */}
            <section className="page products-page active" id="products-page">
                {/* Hero Section */}
                <div className="products-hero">
                    <div className="container">
                        <div className="products-hero-content">
                            <div className="products-hero-text">
                                <span className="section-subtitle"></span>
                                <h1 className="section-title"></h1>
                                <p className="section-description">

                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Carrousel de bannières */}
                    <div className="products-hero-carousel">
                        {[
                            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
                            "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80",
                            "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80"
                        ].map((img, idx) => (
                            <div
                                key={idx}
                                className={`products-hero-banner${idx === currentBanner ? " active animated" : ""}`}
                            >
                                <img src={img} alt={`Bannière ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container">
                    {/* Barre de recherche améliorée */}
                    <div className="products-search-section mb-5">
                        <div className="search-wrapper">
                            <div className="search-input-group">
                               <SearchInput setSearch={setSearch} />
                            </div>
                        </div>
                    </div>

                    {/* Section Filtres et Tri */}
                    <div id="filters-section" className={`filters-section mb-5 ${showFilters ? '' : 'collapsed'}`}>
                        <div className="filters-header">
                            <h3 className="filters-title">
                                <i className="fas fa-sliders-h"></i> Filtrer & Trier
                            </h3>
                        </div>

                        <div className="filters-container">
                            <div className="filter-group">
                                <label className="filter-label">
                                    <i className="fas fa-list"></i> Catégorie
                                </label>
                                <select className="filter-select" id="categoryFilter" value={categorieParams} onChange={(e) => { setIsFiltering(true); setCategoryParams((e.target as HTMLSelectElement).value); }}>
                                    <option value="">Toutes les catégories</option>
                                    {
                                        category.map((cat) => (
                                            <option key={cat.identifiant_categorie} value={cat.nom_categorie}>{cat.nom_categorie}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">
                                    <i className="fas fa-sort"></i> Trier par
                                </label>
                                <select className="filter-select" id="sortFilter"
                                    value={triParams}
                                    onChange={(e) => {
                                        setIsFiltering(true);
                                        const value = e.target.value;
                                        switch (value) {
                                            case "populaire":
                                                setTriParams("populaire")
                                                break;
                                            case "prix_croissant":
                                                setTriParams("prix_croissant")
                                                break;
                                            case "prix_decroissant":
                                                setTriParams("prix_decroissant")
                                                break;
                                            case "nouveautes":
                                                setTriParams("nouveautes")
                                                break;
                                            default: setTriParams("")
                                        }
                                    }}
                                >
                                    <option value="">Aucun tri</option>
                                    <option value="populaire" disabled>Populaires</option>
                                    <option value="prix_croissant">Prix croissant</option>
                                    <option value="prix_decroissant">Prix décroissant</option>
                                    <option value="nouveautes">Nouveautés</option>
                                </select>
                            </div>

                            {/* Nouveaux critères : marque, note, disponibilité, offre, livraison */}
                            {/* <div className="filter-group">
                                <label className="filter-label">
                                    <i className="fas fa-industry"></i> Marque
                                </label>
                                <select className="filter-select" id="brandFilter" value={brandFilter} onChange={(e) => setBrandFilter((e.target as HTMLSelectElement).value)}>
                                    <option value="">Toutes les marques</option>
                                    <option value="xiaomi">Xiaomi</option>
                                    <option value="fitpro">FitPro</option>
                                    <option value="africa">AfricanBrands</option>
                                    <option value="ikea">IKEA</option>
                                </select>
                            </div> */}

                            {/* <div className="filter-group">
                                <label className="filter-label">
                                    <i className="fas fa-star"></i> Note minimale
                                </label>
                                <select className="filter-select" id="ratingFilter" value={ratingFilter} onChange={(e) => setRatingFilter((e.target as HTMLSelectElement).value)}>
                                    <option value="0">Toutes</option>
                                    <option value="4">4 étoiles et +</option>
                                    <option value="3">3 étoiles et +</option>
                                    <option value="2">2 étoiles et +</option>
                                </select>
                            </div> */}


                            {/* <div className="filter-group">
                                <label className="filter-label">
                                    <i className="fas fa-percent"></i> Offre
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <input type="checkbox" id="discountOnly" checked={discountOnly} onChange={(e) => setDiscountOnly((e.target as HTMLInputElement).checked)} />
                                    <label htmlFor="discountOnly" style={{ fontWeight: 600, color: 'var(--neutral-700)' }}>Promotions uniquement</label>
                                </div>
                            </div> */}


                        </div>
                    </div>
                    {/* Grille de produits améliorée */}
                    <div className="products-display">
                        <div className={`products-grid ${isFiltering ? 'filtering' : ''}`}>
                            {
                                products.length > 0 ? (
                                    products.map((p) => (
                                        <div className="product-card card card-hover fade-in" data-id={1} key={p.identifiant_produit}>
                                            <div className="product-image">
                                                <img
                                                    src={p.image_produit}
                                                    alt={p.nom_produit}
                                                />
                                                {/* <div className="product-badges">
                                                    <span className="badge badge-secondary">Promo</span>
                                                </div> */}
                                                <div className="product-actions">
                                                    {
                                                        cart.length > 0 && cart.some(item => item.identifiant_produit === p.identifiant_produit) ? (

                                                            <button className="btn btn-success btn-sm" disabled>
                                                                <i className="fas fa-check" /> Ajouté
                                                            </button>
                                                        ) : (
                                                            <button className="btn btn-primary btn-sm" data-id={1} onClick={() => handleAddToCart(p)}>
                                                                <i className="fas fa-cart-plus" /> Ajouter
                                                            </button>
                                                        )
                                                    }
                                                    <a href={`/products/detail/${p.identifiant_produit}`} >
                                                        <button className="btn btn-secondary btn-icon" data-id={p.identifiant_produit}>
                                                            <i className="far fa-eye" />
                                                        </button>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="product-info">
                                                <h6>{p.categorie_produit?.nom_categorie}</h6>
                                                <h3 className="product-title">{p.nom_produit}</h3>
                                                <div className="product-rating">
                                                    <div className="stars">
                                                        <i className="fas fa-star" />
                                                    </div>
                                                    <span className="rating-count">(128)</span>
                                                </div>
                                                <div className="product-price">
                                                    <span className="current-price">{p.prix_unitaire_produit} FCFA</span>
                                                    {/* <span className="old-price">145 000 FCFA</span> */}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--neutral-500)' }}>Aucun produit trouvé.</p>
                                )
                            }

                        </div>
                    </div>
                    <div ref={sentinelRef} />
                    {
                        loading && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <SmallLoader />
                            </div>
                        )
                    }
                </div>
            </section>
        </>

    )
}