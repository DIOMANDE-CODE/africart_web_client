import "../styles/CartSidebar.css";
import React, { useEffect, useState } from "react";
import "../styles/CartSidebar.css";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Alert } from "./Alert";
import { useNavigate } from "react-router-dom";

type Props = { open: boolean; onClose: () => void };

export const CartSidebar: React.FC<Props> = ({ open, onClose }) => {

    const { cart, increaseQty, decreaseQty, removeFromCart } = useCart();
    const { user } = useAuth()
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const navigate = useNavigate()

    // Calcul dynamique du total du panier
    const total = cart.reduce((sum, item) => {
        const prix = parseFloat(item.prix_unitaire_produit.toString().replace(/\s/g, ''));
        return sum + (isNaN(prix) ? 0 : prix * (item.quantite_produit || 1));
    }, 0);

    // Fonction pour valider le panier
    const validerPanier = () => {
        if (!user) {
            setAlert({ message: "Veuillez vous connecter pour valider votre panier.", type: "error" });
        }
        else {
            onClose();
            navigate('/checkout');
        }
    }


    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <div className={`overlay ${open ? "active" : ""}`} onClick={onClose} aria-hidden={!open} />

            <aside
                className={`cart-sidebar ${open ? "active" : ""}`}
                id="cartSidebar"
                role="dialog"
                aria-modal={open}
                aria-hidden={!open}
                aria-label="Panier"
            >
                <div className="cart-header">
                    <h3 className="cart-title">Votre Panier</h3>
                    <button className="close-cart" onClick={onClose} aria-label="Fermer le panier">
                        <i className="fas fa-times" />
                    </button>
                </div>

                <div className="cart-items" id="cartItemsContainer">
                    {
                        cart.length === 0 ? (
                            <div className="cart-empty">Votre panier est vide.</div>
                        ) : (
                            cart.map((item) => (
                                <div className="cart-item" key={item.identifiant_produit}>
                                    <div className="cart-item-image">
                                        <img src={item.thumbnail} alt={item.nom_produit} loading="lazy" />
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-title">{item.nom_produit}</div>
                                        <div className="cart-item-price">{item.prix_unitaire_produit} FCFA</div>
                                        <div className="cart-item-actions">
                                            <div className="quantity-control" aria-label="Quantité">
                                                <button className="quantity-btn" aria-label="Diminuer la quantité" onClick={() => decreaseQty(item.identifiant_produit)}><i className="fas fa-minus" /></button>
                                                <div className="quantity" aria-live="polite">{item.quantite_produit}</div>
                                                <button className="quantity-btn" aria-label="Augmenter la quantité" onClick={() => increaseQty(item.identifiant_produit)}><i className="fas fa-plus" /></button>
                                            </div>
                                            <button className="remove-item" aria-label="Supprimer l'article" onClick={() => removeFromCart(item.identifiant_produit)}><i className="fas fa-trash-alt" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    }

                </div>

                <div className="cart-summary">
                    <div className="summary-total"><span className="label">Total</span><span className="total-amount">{(total).toLocaleString()} FCFA</span></div>
                </div>

                <div className="cart-actions">
                    {
                        cart.length > 0  ? (
                            <button className="btn btn-primary" id="checkoutButton" onClick={validerPanier} >Passer à la caisse</button>
                        ) : (
                            <button className="btn btn-primary" disabled id="checkoutButton" onClick={onClose} >Passer à la caisse</button>
                        )
                    }
                    <button className="btn btn-outline" id="continueShopping" onClick={onClose}><Link to="/products">Continuer les achats</Link></button>
                </div>
            </aside>
            {
                alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} duration={3000}></Alert>
            }
        </>
    );
};