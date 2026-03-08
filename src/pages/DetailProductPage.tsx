import { StarRating } from "../components/StarRating";
import "../styles/DetailProductPage.css";
import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { useEffect } from "react";
import type { Product } from "../interfaces/Product";
import { toUpperCase } from "../utils/upperCase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";
import { ProductDetailSkeleton, RecommendationSkeleton } from "../skeletons";
import type { ProductRecommended } from "../interfaces/ProductsRecommanded";
import { useRef } from "react";



export const DetailProductPage = () => {
    const { user, loadingSession } = useAuth();
    // ...existing code...
    // State pour la note moyenne
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [averageCount, setAverageCount] = useState<number>(0);
    const { id } = useParams<{ id: string }>();
    const [detailProduct, setDetailProduct] = useState<Product>();
    // On retire le loader, on utilise juste le skeleton
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    // UseState pour passer une commande
    const [productQty, setProductQty] = useState(1);
    const { addToCart, updateCartItem, cart } = useCart();
    // Système de notation par étoiles
    const [rating, setRating] = useState(0);
    const [ratingSent, setRatingSent] = useState(false);
    const [ratingError, setRatingError] = useState<string | null>(null);
    const [ratingDisabled, setRatingDisabled] = useState(false);
    // Recommandations produits de la même catégorie et co_achat
    const [sameCategory, setSameCategory] = useState<ProductRecommended[]>([]);
    const [coAchat, setCoAchat] = useState<ProductRecommended[]>([]);

    // Same-category recommendations

    const [loadingSameCategory, setLoadingSameCategory] = useState(true);
    const [loadingCoAchat, setLoadingCoAchat] = useState(true);
    const sameRef = useRef<HTMLDivElement | null>(null);
    const samePausedRef = useRef(false);
    const sameAutoRef = useRef<number | null>(null);
    const sameDirRef = useRef<'right' | 'left'>('right');
    // co-achat (frequently bought together) separate carousel refs
    const coRef = useRef<HTMLDivElement | null>(null);
    const coPausedRef = useRef(false);
    const coAutoRef = useRef<number | null>(null);
    const coDirRef = useRef<'right' | 'left'>('right');



    // Ajout produit recommandé au panier : empêche doublon, met à jour si déjà présent
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


    const reduceQty = (qty: number) => {
        if (qty > 1) {
            setProductQty(qty - 1);
        }
    }

    const increaseQty = (qty: number, maxQty?: number) => {
        if (maxQty && qty < maxQty) {
            setProductQty(qty + 1);

        }
    }



    // Fonction pour envoyer la note à l'API Django
    const handleRate = async (newRating: number) => {
        setRatingError(null);
        setRating(newRating);
        if (!detailProduct?.identifiant_produit) return;
        try {
            const response = await api.post(`/produits/noter/${detailProduct.identifiant_produit}/`, { note_produit: newRating });
            if (response.data.success) {
                setRatingSent(true);
                setRatingDisabled(true);
                setAlert({ message: response.data.message || "Merci pour votre note !", type: "success" });
            } else {
                setRatingSent(false);
                setRatingError(response.data.errors || "Erreur lors de la notation.");
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                setRatingError(error.response.data.errors);
                if (error.response.data.errors.includes("déjà noté")) setRatingDisabled(true);
            } else {
                setRatingError("Erreur lors de l'envoi de la note.");
            }
            setRatingSent(false);
        }
    };


    // Fonction pour signaler que le produit a été vue
    const produitVue = async () => {
        try {
            await api.post(`/recommandations/vue/`, {
                produit_id: id
            }, {
                withCredentials: true
            });
        } catch (error: any) {
            console.error("Erreur lors de la mise à jour de la vue du produit :", error);
        }
    }


    // Fonction pour récupérer les détails du produit depuis l'API
    const fetchProductDetails = async () => {
        try {
            const response = await api.get(`/produits/detail/${id}`);
            if (response.status === 200) {
                setDetailProduct(response.data.data);
            }
            // Récupérer la note moyenne
            const avgRes = await api.get(`/produits/note_moyenne/${id}`);
            if (avgRes.data.success && avgRes.data.data) {
                setAverageRating(avgRes.data.data.note_moyenne);
                setAverageCount(avgRes.data.data.nombre_notations);
            } else {
                setAverageRating(null);
                setAverageCount(0);
            }
        }
        catch (error: any) {
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
        finally {
            setLoading(false);
        }
    }

    // Ajout au panier : empêche doublon, met à jour si déjà présent
    const handleAddToCart = () => {
        addToCart({
            identifiant_produit: detailProduct?.identifiant_produit || "",
            nom_produit: detailProduct?.nom_produit || "",
            prix_unitaire_produit: detailProduct?.prix_unitaire_produit || "",
            quantite_produit_disponible: detailProduct?.quantite_produit_disponible || 0,
            seuil_alerte_produit: detailProduct?.seuil_alerte_produit || 0,
            thumbnail: detailProduct?.thumbnail || "",
            image_produit: detailProduct?.image_produit || "",
            quantite_produit: productQty
        } as Product);
    };

    // Synchronise le panier si le produit a été modifié
    useEffect(() => {
        if (detailProduct) {
            const itemInCart = cart.find(p => p.identifiant_produit === detailProduct.identifiant_produit);
            if (itemInCart) {
                updateCartItem({ ...itemInCart, ...detailProduct });
            }
        }
    }, [detailProduct]);

    useEffect(() => {
        if (id) {
            produitVue();
            fetchProductDetails();
        }
    }, [id]);

    // when product details load, set the selected image
    useEffect(() => {
        if (detailProduct) {
            // prefer the main image, fall back to thumbnail
            setSelectedImage(detailProduct.image_produit || detailProduct.thumbnail);
        }
    }, [detailProduct]);

    useEffect(() => {
        const getSameCategoryProduct = async () => {
            try {
                const sameCategoryProduct = await api.get(`/recommandations/?type=similar_categorie&produit_id=${id}`);
                if (sameCategoryProduct.status === 200 && sameCategoryProduct.data?.data) {
                    const prods = sameCategoryProduct.data.data.produits || [];
                    setSameCategory(prods);
                }
            } catch (e) {
                // fallback: rien
            } finally {
                setLoadingSameCategory(false);
            }
        }
        getSameCategoryProduct();
    }, [id]);


    useEffect(() => {
        const getCoAchatProduct = async () => {
            try {
                const coAchatProduct = await api.get(`/recommandations/?type=co_achat&produit_id=${id}`);
                if (coAchatProduct.status === 200 && coAchatProduct.data?.data) {
                    const prods = coAchatProduct.data.data.produits || [];
                    setCoAchat(prods);
                }
            } catch (e) {
                // fallback: rien
            } finally {
                setLoadingCoAchat(false);
            }
        }
        getCoAchatProduct();
    }, [id]);

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

    useEffect(() => {
        if (!sameCategory || sameCategory.length === 0) return;
        if (sameAutoRef.current) return;
        sameAutoRef.current = window.setInterval(() => {
            if (samePausedRef.current) return;
            const el = sameRef.current;
            if (!el) return;
            const max = el.scrollWidth - el.clientWidth;
            const atEnd = el.scrollLeft >= (max - 8);
            const atStart = el.scrollLeft <= 8;
            if (sameDirRef.current === 'right' && atEnd) sameDirRef.current = 'left';
            else if (sameDirRef.current === 'left' && atStart) sameDirRef.current = 'right';
            const step = Math.max(160, Math.round(el.clientWidth * 0.6));
            el.scrollBy({ left: sameDirRef.current === 'right' ? step : -step, behavior: 'smooth' });
        }, 3000) as unknown as number;

        return () => {
            if (sameAutoRef.current) { clearInterval(sameAutoRef.current as number); sameAutoRef.current = null; }
        };
    }, [sameCategory]);

    // independent auto-scroll for co-achat carousel
    useEffect(() => {
        if (!coAchat || coAchat.length === 0) return;
        if (coAutoRef.current) return;
        coAutoRef.current = window.setInterval(() => {
            if (coPausedRef.current) return;
            const el = coRef.current;
            if (!el) return;
            const max = el.scrollWidth - el.clientWidth;
            const atEnd = el.scrollLeft >= (max - 8);
            const atStart = el.scrollLeft <= 8;
            if (coDirRef.current === 'right' && atEnd) coDirRef.current = 'left';
            else if (coDirRef.current === 'left' && atStart) coDirRef.current = 'right';
            const step = Math.max(140, Math.round(el.clientWidth * 0.55));
            el.scrollBy({ left: coDirRef.current === 'right' ? step : -step, behavior: 'smooth' });
        }, 3000) as unknown as number;

        return () => {
            if (coAutoRef.current) { clearInterval(coAutoRef.current as number); coAutoRef.current = null; }
        };
    }, [coAchat]);

    if (loadingSession || loading) {
        return (
            <section className="page active" id="product-detail-page">
                <ProductDetailSkeleton />
            </section>
        );
    }

    return (
        <>
            {/* Page Détail Produit */}
            <section className="page active" id="product-detail-page">
                <div className="container product-detail-page">
                    {/* Autres produits (positionné au dessus du détail produit) */}
                    <div className="recommendation-block mb-5">
                        <div className="section-header">
                            <h3>Fréquemment achetés ensemble</h3>
                        </div>
                        {loadingCoAchat ? (
                            <RecommendationSkeleton count={6} />
                        ) : coAchat && coAchat.length > 0 ? (
                            <>
                                <button type="button" className="carousel-nav prev" onClick={() => scrollCo('left')} aria-label="Précédent">‹</button>
                                <div className="recommendation-list" ref={coRef} onMouseEnter={() => { coPausedRef.current = true; }} onMouseLeave={() => { coPausedRef.current = false; }}>
                                    {coAchat.map((p) => (
                                        <article className="carousel-item" key={p.identifiant_produit} role="listitem">
                                            <div className="item-image">
                                                <a href={`/products/detail/${p.identifiant_produit}`}>
                                                    <img src={p.thumbnail} alt={p.nom_produit} loading="lazy" />
                                                </a>
                                            </div>
                                            <div className="item-body">
                                                <h6 style={{ color: 'black' }}>{p.categorie}</h6>
                                                <div className="item-title">{p.nom_produit}</div>
                                                <div className="item-price">{p.prix} FCFA</div>
                                            </div>
                                            <div className="item-actions">
                                                {cart.some(item => item.identifiant_produit === p.identifiant_produit) ? (
                                                    <button className="btn btn-success btn-sm" disabled>
                                                        <i className="fas fa-check" /> Ajouté
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleAddRecommandedToCart(p)}>
                                                        <i className="fas fa-cart-plus" /> Ajouter
                                                    </button>
                                                )}

                                            </div>
                                        </article>
                                    ))}
                                </div>
                                <button type="button" className="carousel-nav next" onClick={() => scrollCo('right')} aria-label="Suivant">›</button>
                            </>
                        ) : null}
                    </div>
                    {/* ...existing code... */}
                    <div className="product-detail" id="productDetailContainer">
                        <div className="product-gallery">
                            <div className="main-image">
                                <img
                                    src={selectedImage || detailProduct?.image_produit}
                                    alt={detailProduct?.nom_produit}
                                    id="mainProductImage"
                                    loading="lazy"
                                />
                            </div>
                            <div className="thumbnails">
                                <div
                                    className={`thumbnail ${selectedImage === detailProduct?.thumbnail ? 'active' : ''}`}
                                    data-index={0}
                                    onClick={() => setSelectedImage(detailProduct?.thumbnail)}
                                >
                                    <img
                                        src={detailProduct?.thumbnail}
                                        alt={detailProduct?.nom_produit}
                                        loading="lazy"
                                    />
                                </div>
                                <div
                                    className={`thumbnail ${selectedImage === detailProduct?.thumbnail_2 ? 'active' : ''}`}
                                    data-index={1}
                                    onClick={() => setSelectedImage(detailProduct?.thumbnail_2)}
                                >
                                    <img
                                        src={detailProduct?.thumbnail_2}
                                        alt={detailProduct?.nom_produit}
                                        loading="lazy"
                                    />
                                </div>
                                <div
                                    className={`thumbnail ${selectedImage === detailProduct?.thumbnail_3 ? 'active' : ''}`}
                                    data-index={2}
                                    onClick={() => setSelectedImage(detailProduct?.thumbnail_3)}
                                >
                                    <img
                                        src={detailProduct?.thumbnail_3}
                                        alt={detailProduct?.nom_produit}
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="product-info">

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <h1 style={{ margin: 0 }}>{toUpperCase(detailProduct?.nom_produit || "")}</h1>
                                {averageRating !== null && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <StarRating rating={Math.round(averageRating)} onRate={() => { }} />
                                        <span style={{ fontSize: 14, color: '#888' }}>({averageRating} / 5, {averageCount} avis)</span>
                                    </div>
                                )}
                            </div>
                            {/* Affichage du stock */}
                            {typeof detailProduct?.quantite_produit_disponible === 'number' && (
                                <div className="product-stock-info">
                                    <i className="fas fa-box"></i> Stock : {detailProduct.quantite_produit_disponible} Kg disponible{detailProduct.quantite_produit_disponible > 1 ? 's' : ''}
                                </div>
                            )}
                            {/* <div className="product-meta">
                                <div className="product-rating">
                                    <div className="stars">
                                        <i className="fas fa-star" />
                                    </div>
                                    <div className="rating-count">128 avis</div>
                                </div>
                            </div> */}
                            {/* Panneau d'achat sticky */}
                            <div className="buy-panel" aria-hidden="false">
                                <div className="buy-left">
                                    <div className="buy-price">{detailProduct?.prix_unitaire_produit} FCFA</div>
                                    <div className="buy-sub">Livraison rapide • 4 jours</div>
                                </div>
                                <div className="buy-actions">
                                    {
                                        cart.some(p => p.identifiant_produit === detailProduct?.identifiant_produit) ? (
                                            <div></div>
                                        ) : (
                                            <div className="compact-qty">
                                                <button className="qty-btn minus" onClick={() => reduceQty(productQty)}>-</button>
                                                <span className="qty">{productQty}</span>
                                                <button className="qty-btn plus" onClick={() => increaseQty(productQty, detailProduct?.quantite_produit_disponible)}>+</button>
                                            </div>
                                        )
                                    }


                                    {
                                        cart.some(p => p.identifiant_produit === detailProduct?.identifiant_produit) ? (
                                            <button className="btn btn-success btn-large" id="addToCartDetailSticky" disabled>
                                                <i className="fas fa-check" /> Ajouté
                                            </button>
                                        ) : (
                                            <button className="btn btn-primary btn-large" id="addToCartDetailSticky" onClick={handleAddToCart}>
                                                <i className="fas fa-cart-plus" /> Ajouter
                                            </button>
                                        )
                                    }


                                </div>
                                <div className="secure-badge">
                                    <i className="fas fa-lock" /> Paiement sécurisé
                                </div>
                            </div>

                            <div className="product-description">
                                {
                                    detailProduct?.description_produit && (
                                        <p>
                                            {detailProduct.description_produit}
                                        </p>
                                    )
                                }

                            </div>
                            {
                                detailProduct?.caracteristiques_produit && (
                                    <div className="product-features">
                                        <h4>Caractéristiques</h4>
                                        <ul className="feature-list">
                                            {
                                                detailProduct.caracteristiques_produit.split(',').map((carac, index) => (
                                                    <li key={index}>{carac.trim()}</li>
                                                ))
                                            }

                                        </ul>
                                    </div>
                                )
                            }


                            {
                                cart.some(p => p.identifiant_produit === detailProduct?.identifiant_produit) ? (
                                    <div></div>
                                ) : (
                                    <div className="quantity-selector">
                                        <label>Quantité:</label>
                                        <div className="qty-control">
                                            <button className="qty-btn minus" onClick={() => reduceQty(productQty)}>-</button>
                                            <span className="qty" id="productQty">
                                                {productQty}
                                            </span>
                                            <button className="qty-btn plus" onClick={() => increaseQty(productQty, detailProduct?.quantite_produit_disponible)}>+</button>
                                        </div>
                                    </div>
                                )
                            }



                            <div className="product-actions-large">
                                {
                                    cart.some(p => p.identifiant_produit === detailProduct?.identifiant_produit) ? (
                                        <button className="btn btn-success btn-large" id="addToCartDetail" disabled>
                                            <i className="fas fa-check" /> Ajouté au panier
                                        </button>
                                    ) : (
                                        <button className="btn btn-primary btn-large" id="addToCartDetail" onClick={handleAddToCart} >
                                            <i className="fas fa-cart-plus" /> Ajouter au panier
                                        </button>
                                    )
                                }

                                <button className="btn btn-outline btn-large" id="buyNow">
                                    <a href="/products">Continuer les achats</a>
                                </button>
                            </div>
                            {/* Bloc de notation par étoiles */}
                            {user && !ratingDisabled && (
                                <div style={{ marginBottom: 16, textAlign: "center", paddingInline: 16 }}>
                                    <h3>Notez ce produit :</h3>
                                    <StarRating rating={rating} onRate={handleRate} />
                                    {ratingError && <div style={{ color: '#dc3545', marginTop: 8 }}>{ratingError}</div>}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Autres produits (positionné au dessus du détail produit) */}
                    <div className="recommendation-block mb-5 background-orange">
                        <div className="section-header">
                            <h3>Produits similaires</h3>
                        </div>
                        {loadingSameCategory ? (
                            <RecommendationSkeleton count={6} />
                        ) : sameCategory && sameCategory.length > 0 ? (
                            <>
                                <button type="button" className="carousel-nav prev" onClick={() => scrollSame('left')} aria-label="Précédent">‹</button>
                                <div className="recommendation-list" ref={sameRef} onMouseEnter={() => { samePausedRef.current = true; }} onMouseLeave={() => { samePausedRef.current = false; }}>
                                    {sameCategory.map((p) => (
                                        <article className="carousel-item" key={p.identifiant_produit} role="listitem">
                                            <a href={`/products/detail/${p.identifiant_produit}`}>
                                                <div className="item-image">
                                                    <img src={p.thumbnail} alt={p.nom_produit} loading="lazy" />
                                                </div>
                                                <div className="item-body">
                                                    <h6 style={{ color: 'black' }}>{p.categorie}</h6>
                                                    <div className="item-title">{p.nom_produit}</div>
                                                    <div className="item-price">{p.prix} FCFA</div>
                                                </div>
                                            </a>
                                        </article>
                                    ))}
                                </div>
                                <button type="button" className="carousel-nav next" onClick={() => scrollSame('right')} aria-label="Suivant">›</button>
                            </>
                        ) : null}
                    </div>
                </div>
                {alert && (
                    <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
                )}
            </section>
        </>

    )
}