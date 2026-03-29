import { StarRating } from "../components/StarRating";
import "../styles/DetailProductPage.css";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { noteProduct, useProductDetail, useAverageRating } from "../services/produitService";
import { trackView, getSimilarCategoryProducts, getCoPurchaseProducts } from "../services/recommandationService";
import type { Product } from "../interfaces/Product";
import { toUpperCase } from "../utils/upperCase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { ProductDetailSkeleton, RecommendationSkeleton } from "../skeletons";
import type { ProductRecommended } from "../interfaces/ProductsRecommanded";

export const DetailProductPage = () => {
    // 1. DÉCLARATION DES HOOKS (Toujours au début)
    const { user, loadingSession } = useAuth();
    const { id } = useParams<{ id: string }>();
    const { addToCart, updateCartItem, cart } = useCart();

    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [productQty, setProductQty] = useState(1);

    const [rating, setRating] = useState(0);
    const [ratingSent, setRatingSent] = useState(false);
    const [ratingError, setRatingError] = useState<string | null>(null);
    const [ratingDisabled, setRatingDisabled] = useState(false);

    const [sameCategory, setSameCategory] = useState<ProductRecommended[]>([]);
    const [coAchat, setCoAchat] = useState<ProductRecommended[]>([]);
    const [loadingSameCategory, setLoadingSameCategory] = useState(true);
    const [loadingCoAchat, setLoadingCoAchat] = useState(true);

    // Refs pour carrousel "Same Category"
    const sameRef = useRef<HTMLDivElement | null>(null);
    const samePausedRef = useRef(false);
    const sameAutoRef = useRef<number | null>(null);
    const sameDirRef = useRef<'right' | 'left'>('right');

    // Refs pour carrousel "Co-achat"
    const coRef = useRef<HTMLDivElement | null>(null);
    const coPausedRef = useRef(false);
    const coAutoRef = useRef<number | null>(null);
    const coDirRef = useRef<'right' | 'left'>('right');

    // Récupération des données API
    const { data: productData, isLoading: isProductLoading, isError: isProductError } = useProductDetail(id ?? "");
    const { data: ratingData, isLoading: isRatingLoading } = useAverageRating(id ?? "");

    const detailProduct = productData?.data || null;
    const averageRating = ratingData?.data?.note_moyenne ?? null;
    const averageCount = ratingData?.data?.nombre_notations ?? 0;

    // 2. LOGIQUE DES EFFETS (useEffect)

    // Track View
    useEffect(() => {
        const produitVue = async () => {
            if (id) {
                try { await trackView(id); } catch (error) { console.error("Erreur vue :", error); }
            }
        }
        produitVue();
    }, [id]);

    // Sync image sélectionnée
    useEffect(() => {
        if (detailProduct) {
            setSelectedImage(detailProduct.image_produit || detailProduct.thumbnail);
        }
    }, [detailProduct]);

    // Sync panier
    useEffect(() => {
        if (detailProduct) {
            const itemInCart = cart.find(p => p.identifiant_produit === detailProduct.identifiant_produit);
            if (itemInCart) {
                updateCartItem({ ...itemInCart, ...detailProduct });
            }
        }
    }, [detailProduct]);

    // Fetch Same Category
    useEffect(() => {
        const getSameCategoryProduct = async () => {
            if (!id) return;
            try {
                const res = await getSimilarCategoryProducts(id);
                if (res.status === 200 && res.data?.data) {
                    setSameCategory(res.data.data.produits || []);
                }
            } catch (e) { } finally { setLoadingSameCategory(false); }
        }
        getSameCategoryProduct();
    }, [id]);

    // Fetch Co-Achat
    useEffect(() => {
        const getCoAchatProduct = async () => {
            if (!id) return;
            try {
                const res = await getCoPurchaseProducts(id);
                if (res.status === 200 && res.data?.data) {
                    setCoAchat(res.data.data.produits || []);
                }
            } catch (e) { } finally { setLoadingCoAchat(false); }
        }
        getCoAchatProduct();
    }, [id]);

    // Auto-scroll Same Category
    useEffect(() => {
        if (!sameCategory || sameCategory.length === 0) return;
        sameAutoRef.current = window.setInterval(() => {
            if (samePausedRef.current) return;
            const el = sameRef.current;
            if (!el) return;
            const max = el.scrollWidth - el.clientWidth;
            if (sameDirRef.current === 'right' && el.scrollLeft >= (max - 8)) sameDirRef.current = 'left';
            else if (sameDirRef.current === 'left' && el.scrollLeft <= 8) sameDirRef.current = 'right';
            const step = Math.max(160, Math.round(el.clientWidth * 0.6));
            el.scrollBy({ left: sameDirRef.current === 'right' ? step : -step, behavior: 'smooth' });
        }, 3000);
        return () => { if (sameAutoRef.current) clearInterval(sameAutoRef.current); };
    }, [sameCategory]);

    // Auto-scroll Co-Achat
    useEffect(() => {
        if (!coAchat || coAchat.length === 0) return;
        coAutoRef.current = window.setInterval(() => {
            if (coPausedRef.current) return;
            const el = coRef.current;
            if (!el) return;
            const max = el.scrollWidth - el.clientWidth;
            if (coDirRef.current === 'right' && el.scrollLeft >= (max - 8)) coDirRef.current = 'left';
            else if (coDirRef.current === 'left' && el.scrollLeft <= 8) coDirRef.current = 'right';
            const step = Math.max(140, Math.round(el.clientWidth * 0.55));
            el.scrollBy({ left: coDirRef.current === 'right' ? step : -step, behavior: 'smooth' });
        }, 3000);
        return () => { if (coAutoRef.current) clearInterval(coAutoRef.current); };
    }, [coAchat]);

    // 3. HANDLERS
    const handleAddToCart = () => {
        if (!detailProduct) return;
        addToCart({
            identifiant_produit: detailProduct.identifiant_produit,
            nom_produit: detailProduct.nom_produit,
            prix_unitaire_produit: detailProduct.prix_unitaire_produit,
            quantite_produit_disponible: detailProduct.quantite_produit_disponible,
            seuil_alerte_produit: detailProduct.seuil_alerte_produit,
            thumbnail: detailProduct.thumbnail,
            image_produit: detailProduct.image_produit,
            quantite_produit: productQty
        } as Product);
    };

    const handleAddRecommandedToCart = (p: Product | ProductRecommended) => {
        addToCart({
            identifiant_produit: p.identifiant_produit,
            nom_produit: p.nom_produit,
            prix_unitaire_produit: (p as Product).prix_unitaire_produit || (p as ProductRecommended).prix || 0,
            quantite_produit_disponible: (p as Product).quantite_produit_disponible || 0,
            seuil_alerte_produit: (p as Product).seuil_alerte_produit || 0,
            thumbnail: p.thumbnail || "",
            image_produit: (p as Product).image_produit || p.thumbnail || "",
            quantite_produit: 1
        } as Product);
    };

    const reduceQty = (qty: number) => { if (qty > 1) setProductQty(qty - 1); };
    const increaseQty = (qty: number, maxQty?: number) => { if (maxQty && qty < maxQty) setProductQty(qty + 1); };

    const handleRate = async (newRating: number) => {
        setRatingError(null);
        setRating(newRating);
        if (!detailProduct?.identifiant_produit) return;
        try {
            const response = await noteProduct(detailProduct.identifiant_produit, newRating);
            if (response.data.success) {
                setRatingSent(true);
                setRatingDisabled(true);
                setAlert({ message: response.data.message || "Merci pour votre note !", type: "success" });
            }
        } catch (error: any) {
            setRatingError("Erreur lors de la notation.");
        }
    };

    const scrollSame = (dir: 'left' | 'right') => {
        const el = sameRef.current;
        if (!el) return;
        const step = Math.max(160, Math.round(el.clientWidth * 0.6));
        el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
    };

    const scrollCo = (dir: 'left' | 'right') => {
        const el = coRef.current;
        if (!el) return;
        const step = Math.max(140, Math.round(el.clientWidth * 0.55));
        el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
    };

    // 4. RENDUS CONDITIONNELS (Après les hooks)
    const isInitialLoading = loadingSession || isProductLoading || isRatingLoading;

    if (isInitialLoading) {
        return (
            <section className="page active" id="product-detail-page">
                <ProductDetailSkeleton />
            </section>
        );
    }

    if (isProductError || !detailProduct) {
        return <Alert message="Produit introuvable" type="error" />;
    }

    // 5. RENDU PRINCIPAL
    return (
        <section className="page active" id="product-detail-page">
            <div className="container product-detail-page">

                {/* BLOC CO-ACHAT */}
                <div className="recommendation-block mb-5">
                    <div className="section-header"><h3>Fréquemment achetés ensemble</h3></div>
                    {loadingCoAchat ? (
                        <RecommendationSkeleton count={6} />
                    ) : coAchat.length > 0 && (
                        <>
                            <button type="button" className="carousel-nav prev" onClick={() => scrollCo('left')}>‹</button>
                            <div className="recommendation-list" ref={coRef}
                                onMouseEnter={() => { coPausedRef.current = true; }}
                                onMouseLeave={() => { coPausedRef.current = false; }}>
                                {coAchat.map((p) => (
                                    <article className="carousel-item" key={p.identifiant_produit}>
                                        <div className="item-image">
                                            <Link to={`/products/detail/${p.identifiant_produit}`}>
                                                <img src={p.thumbnail} alt={p.nom_produit} loading="lazy" />
                                            </Link>
                                        </div>
                                        <div className="item-body">
                                            <h6 style={{ color: 'black' }}>{p.categorie}</h6>
                                            <div className="item-title">{p.nom_produit}</div>
                                            <div className="item-price">{p.prix} FCFA</div>
                                        </div>
                                        <div className="item-actions">
                                            {cart.some(item => item.identifiant_produit === p.identifiant_produit) ? (
                                                <button className="btn btn-success btn-sm" disabled><i className="fas fa-check" /> Ajouté</button>
                                            ) : (
                                                <button className="btn btn-primary btn-sm" onClick={() => handleAddRecommandedToCart(p)}>
                                                    <i className="fas fa-cart-plus" /> Ajouter
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <button type="button" className="carousel-nav next" onClick={() => scrollCo('right')}>›</button>
                        </>
                    )}
                </div>

                {/* DÉTAIL PRODUIT */}
                <div className="product-detail" id="productDetailContainer">
                    <div className="product-gallery">
                        <div className="main-image">
                            <img src={selectedImage || detailProduct.image_produit} alt={detailProduct.nom_produit} loading="lazy" />
                        </div>
                        <div className="thumbnails">
                            {[detailProduct.thumbnail, detailProduct.thumbnail_2, detailProduct.thumbnail_3].map((img, idx) => img && (
                                <div key={idx} className={`thumbnail ${selectedImage === img ? 'active' : ''}`} onClick={() => setSelectedImage(img)}>
                                    <img src={img} alt={detailProduct.nom_produit} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="product-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h1 style={{ margin: 0 }}>{toUpperCase(detailProduct.nom_produit)}</h1>
                            {averageRating !== null && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <StarRating rating={Math.round(averageRating)} onRate={() => { }} />
                                    <span style={{ fontSize: 14, color: '#888' }}>({averageRating} / 5, {averageCount} avis)</span>
                                </div>
                            )}
                        </div>

                        {typeof detailProduct.quantite_produit_disponible === 'number' && (
                            <div className="product-stock-info">
                                <i className="fas fa-box"></i> Stock : {detailProduct.quantite_produit_disponible} Kg disponible{detailProduct.quantite_produit_disponible > 1 ? 's' : ''}
                            </div>
                        )}

                        <div className="buy-panel">
                            <div className="buy-left">
                                <div className="buy-price">{detailProduct.prix_unitaire_produit} FCFA</div>
                                <div className="buy-sub">Livraison rapide • 4 jours</div>
                            </div>
                            <div className="buy-actions">
                                {!cart.some(p => p.identifiant_produit === detailProduct.identifiant_produit) && (
                                    <div className="compact-qty">
                                        <button className="qty-btn minus" onClick={() => reduceQty(productQty)}>-</button>
                                        <span className="qty">{productQty}</span>
                                        <button className="qty-btn plus" onClick={() => increaseQty(productQty, detailProduct.quantite_produit_disponible)}>+</button>
                                    </div>
                                )}
                                <button className={`btn btn-large ${cart.some(p => p.identifiant_produit === detailProduct.identifiant_produit) ? 'btn-success' : 'btn-primary'}`}
                                    onClick={handleAddToCart}
                                    disabled={cart.some(p => p.identifiant_produit === detailProduct.identifiant_produit)}>
                                    <i className={`fas ${cart.some(p => p.identifiant_produit === detailProduct.identifiant_produit) ? 'fa-check' : 'fa-cart-plus'}`} />
                                    {cart.some(p => p.identifiant_produit === detailProduct.identifiant_produit) ? ' Ajouté' : ' Ajouter'}
                                </button>
                            </div>
                            <div className="secure-badge"><i className="fas fa-lock" /> Paiement sécurisé</div>
                        </div>

                        <div className="product-description">
                            <p>{detailProduct.description_produit}</p>
                        </div>

                        {detailProduct.caracteristiques_produit && (
                            <div className="product-features">
                                <h4>Caractéristiques</h4>
                                <ul className="feature-list">
                                    {detailProduct.caracteristiques_produit.split(',').map((carac: string, index: number) => (
                                        <li key={index}>{carac.trim()}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="product-actions-large">
                            <Link to="/products" className="btn btn-outline btn-large">Continuer les achats</Link>
                        </div>

                        {user && !ratingDisabled && (
                            <div style={{ marginBottom: 16, textAlign: "center", paddingInline: 16 }}>
                                <h3>Notez ce produit :</h3>
                                <StarRating rating={rating} onRate={handleRate} />
                                {ratingError && <div style={{ color: '#dc3545', marginTop: 8 }}>{ratingError}</div>}
                            </div>
                        )}
                    </div>
                </div>

                {/* BLOC PRODUITS SIMILAIRES */}
                <div className="recommendation-block mb-5 background-orange">
                    <div className="section-header"><h3>Produits similaires</h3></div>
                    {loadingSameCategory ? (
                        <RecommendationSkeleton count={6} />
                    ) : sameCategory.length > 0 && (
                        <>
                            <button type="button" className="carousel-nav prev" onClick={() => scrollSame('left')}>‹</button>
                            <div className="recommendation-list" ref={sameRef}
                                onMouseEnter={() => { samePausedRef.current = true; }}
                                onMouseLeave={() => { samePausedRef.current = false; }}>
                                {sameCategory.map((p) => (
                                    <article className="carousel-item" key={p.identifiant_produit}>
                                        <a href={`/products/detail/${p.identifiant_produit}`}>
                                            <div className="item-image"><img src={p.thumbnail} alt={p.nom_produit} /></div>
                                            <div className="item-body">
                                                <h6 style={{ color: 'black' }}>{p.categorie}</h6>
                                                <div className="item-title">{p.nom_produit}</div>
                                                <div className="item-price">{p.prix} FCFA</div>
                                            </div>
                                        </a>
                                    </article>
                                ))}
                            </div>
                            <button type="button" className="carousel-nav next" onClick={() => scrollSame('right')}>›</button>
                        </>
                    )}
                </div>
            </div>
            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </section>
    );
};