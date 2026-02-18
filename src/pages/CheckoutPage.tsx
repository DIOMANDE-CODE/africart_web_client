import "../styles/CheckoutPage.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Alert } from "../components/Alert";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export const CheckoutPage = () => {

    const { cart, clearCart } = useCart()
    const { user } = useAuth()
    const [ville, setVille] = useState("")
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    // Rediriger vers l'accueil si le panier est vide (commande déjà validée)
    useEffect(() => {
        if (cart.length === 0) {
            navigate("/");
        }
    }, [navigate]);

    // Calcul dynamique du total du panier
    const total = cart.reduce((sum, item) => {
        const prix = parseFloat(item.prix_unitaire_produit.toString().replace(/\s/g, ''));
        return sum + (isNaN(prix) ? 0 : prix * (item.quantite_produit || 1));
    }, 0);

    // Validation de la commande
    const validezCommande = async () => {
        // Verifier que tous les champs sont rempli
        if (!ville.trim()) {
            setAlert({ message: "Veuillez saisir le lieu de livraison", type: "error" })
            return;
        }

        // Envoyez la commande
        setLoading(true)
        const commande = {
            client: {
                nom_client: user?.nom_utilisateur,
                numero_telephone_client: user?.numero_telephone_utilisateur
            },
            items: cart,
            total_ht: total,
            total_ttc: total,
            lieu_livraison: ville

        }
        console.log("Commande validé", commande);
        try {
            const response = await api.post("/commandes/creer/", commande, {
                withCredentials: true
            })

            if (response.status === 200 || response.status === 201) {
                clearCart()
                sessionStorage.setItem("identifiant_commande", response.data.reference_commande)
                localStorage.removeItem("africart_cart")
                navigate("/confirmation")
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
            setLoading(false)
        }

    }

    useEffect(() => {

        console.log(cart);

    }, [cart])


    return (
        <>
            {/* Page Checkout */}
            <section className="page active" id="checkout-page">
                <div className="container checkout-page">
                    <h1 className="section-title">Finaliser votre commande</h1>
                    <div className="checkout-container">
                        <div className="checkout-form">
                            <h3 className="mb-3">Informations de livraison</h3>
                            <div className="form-section">
                                <div className="form-group">
                                    <label>Nom complet</label>
                                    <div className="input-with-icon">
                                        <span className="input-icon"><i className="fas fa-user" /></span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="fullName"
                                            placeholder="Votre nom complet"
                                            value={user?.nom_utilisateur}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <div className="input-with-icon">
                                            <span className="input-icon"><i className="fas fa-envelope" /></span>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                placeholder="votre@email.com"
                                                value={user?.email_utilisateur}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Téléphone</label>
                                        <div className="input-with-icon">
                                            <span className="input-icon"><i className="fas fa-phone" /></span>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                id="phone"
                                                placeholder="+225 XX XX XX XX"
                                                value={user?.numero_telephone_utilisateur || ""}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Lieu de Livraison</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="city"
                                            placeholder="Votre ville"
                                            onChange={(e) => setVille(e.target.value)}
                                            value={ville}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <h3 className="mt-4 mb-3">Méthode de paiement</h3>
                            <div className="payment-methods" role="radiogroup" aria-label="Méthodes de paiement">
                                {/* <label className="payment-option selected" data-method="mobile" tabIndex={0}>
                                    <div className="payment-icon">
                                        <i className="fas fa-mobile-alt" />
                                    </div>
                                    <div>
                                        <div className="option-title">Mobile Money</div>
                                        <div className="option-desc">
                                            Orange Money, MTN Money, Moov Money
                                        </div>
                                    </div>

                                </label> */}
                                {/* <label className="payment-option" data-method="card" tabIndex={0}>
                                    <input type="radio" name="paymentMethod" className="visually-hidden" />
                                    <div className="payment-icon">
                                        <i className="fas fa-credit-card" />
                                    </div>
                                    <div>
                                        <div className="option-title">Carte bancaire</div>
                                        <div className="option-desc">Visa, Mastercard</div>
                                    </div>
                                    <div className="payment-check" aria-hidden="true"><i className="fas fa-check" /></div>
                                </label> */}
                                {/* <label className="payment-option" data-method="wave" tabIndex={0}>
                                    <input type="radio" name="paymentMethod" className="visually-hidden" />
                                    <div className="payment-icon">
                                        <i className="fas fa-wave-square" />
                                    </div>
                                    <div>
                                        <div className="option-title">Wave</div>
                                        <div className="option-desc">
                                            Paiement via l'application Wave
                                        </div>
                                    </div>
                                    <div className="payment-check" aria-hidden="true"><i className="fas fa-check" /></div>
                                </label> */}
                                <label className="payment-option disabled" data-method="delivery" aria-disabled="true">
                                    {/* <input type="radio" name="paymentMethod" className="visually-hidden" /> */}
                                    <div className="payment-icon">
                                        <i className="fas fa-truck" />
                                    </div>
                                    <div>
                                        <div className="option-title">Paiement à la livraison</div>
                                        <div className="option-desc">
                                            Payez quand vous recevez votre commande,
                                        </div>
                                        <div className="option-desc">
                                            + 2000 FCFA hors Yamoussoukro
                                        </div>
                                    </div>
                                    <div className="payment-check" aria-hidden="true"><i className="fas fa-check" /></div>
                                </label>
                            </div>
                            {/* <div className="form-group mt-4">
                                <label>Notes pour la livraison (optionnel)</label>
                                <textarea
                                    className="form-control"
                                    id="deliveryNotes"
                                    rows={3}
                                    placeholder="Instructions spéciales pour la livraison..."
                                    defaultValue={""}
                                />
                            </div> */}
                        </div>
                        <div className="order-summary">
                            <h3 className="mb-3">Récapitulatif de commande</h3>
                            <div id="orderSummaryItems">
                                {
                                    cart && cart.length > 0 && cart.map((article) => (
                                        <div className="summary-item" key={article.identifiant_produit}>
                                            <span>{article.nom_produit}</span>
                                            <span>{article.prix_unitaire_produit} X {article.quantite_produit}</span>
                                        </div>
                                    ))
                                }

                            </div>
                            <div className="summary-item summary-total">
                                <span>Total</span>
                                <span id="orderTotal">{(total).toLocaleString()} FCFA</span>
                            </div>
                            {
                                cart.length === 0 ? (
                                    <button className="btn btn-primary btn-large mt-4" id="placeOrder" disabled>
                                        Passer la commande
                                    </button>
                                ) : (
                                    <>
                                        {
                                            loading ? (
                                                <button className="btn btn-primary btn-large mt-4" id="placeOrder" disabled>
                                                    Passer la commande
                                                </button>
                                            ) : (<button className="btn btn-primary btn-large mt-4" onClick={validezCommande} id="placeOrder">
                                                Passer la commande
                                            </button>)
                                        }

                                    </>
                                )
                            }

                            <p
                                className="mt-3 text-center"
                                style={{ fontSize: 12, color: "#777" }}
                            >
                                En passant votre commande, vous acceptez nos{" "}
                                <a href="#" className="text-primary">
                                    conditions générales
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                {
                    alert && (
                        <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} duration={6000} />
                    )
                }
            </section>
        </>

    )
}