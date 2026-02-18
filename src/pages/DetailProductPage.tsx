import "../styles/DetailProductPage.css";
import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { useEffect } from "react";
import type { Product } from "../interfaces/Product";
import { toUpperCase } from "../utils/upperCase";
import { useCart } from "../context/CartContext";
import { Alert } from "../components/Alert";
import { ProductDetailSkeleton } from "../skeletons";

export const DetailProductPage = () => {
    const { id } = useParams<{ id: string }>();
    const [detailProduct, setDetailProduct] = useState<Product>();
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    // UseState pour passer une commande
    const [productQty, setProductQty] = useState(1);
    const { addToCart, updateCartItem, cart } = useCart();


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



    // Fonction pour récupérer les détails du produit depuis l'API
    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/produits/detail/${id}`);
            if (response.status === 200) {
                setDetailProduct(response.data.data);
                console.log(response.data.data);
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
        fetchProductDetails();
    }, [id]);

    // when product details load, set the selected image
    useEffect(() => {
        if (detailProduct) {
            // prefer the main image, fall back to thumbnail
            setSelectedImage(detailProduct.image_produit || detailProduct.thumbnail);
        }
    }, [detailProduct]);

    if (loading) {
        return (
            <section className="page active" id="product-detail-page">
                <ProductDetailSkeleton />
            </section>
        )
    }

    return (
        <>
            {/* Page Détail Produit */}
            <section className="page active" id="product-detail-page">
                <div className="container product-detail-page">
                    <div className="product-detail" id="productDetailContainer">
                        <div className="product-gallery">
                            <div className="main-image">
                                <img
                                    src={selectedImage || detailProduct?.image_produit}
                                    alt={detailProduct?.nom_produit}
                                    id="mainProductImage"
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
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="product-info">
                            <h1>{toUpperCase(detailProduct?.nom_produit || "")}</h1>
                            {/* Affichage du stock */}
                            {typeof detailProduct?.quantite_produit_disponible === 'number' && (
                                <div className="product-stock-info">
                                    <i className="fas fa-box"></i> Stock : {detailProduct.quantite_produit_disponible} disponible{detailProduct.quantite_produit_disponible > 1 ? 's' : ''}
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
                                    <div className="buy-sub">Livraison rapide • Retours 14j</div>
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


                        </div>
                    </div>
                </div>
                {alert && (
                    <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
                )}
            </section>
        </>

    )
}