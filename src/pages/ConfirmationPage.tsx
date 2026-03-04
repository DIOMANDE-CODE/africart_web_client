import { useEffect, useState } from "react";
import "../styles/ConfirmationPage.css";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Alert } from "../components/Alert";
import { formatDate } from "../utils/formatDate";
import { ConfirmationSkeleton } from "../skeletons";
import { useAuth } from "../context/AuthContext";

export const ConfirmationPage = () => {
    const [copied, setCopied] = useState(false);
    const reference_commande = sessionStorage.getItem("identifiant_commande")
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [identifiantCommande, setIdentifiantCommande] = useState("")
    const [statusCommande, setStatusCommande] = useState("")
    const [dateCommande, setDateCommande] = useState("")
    const [totalPaye, setTotalPaye] = useState("")
    const [codeLivraison, setCodeLivraison] = useState("")
    const [lieuLivraison, setLieuLivraison] = useState("")
    const [nomClient, setNomClient] = useState("")
    const [numero, setNumero] = useState("")
    const { loadingSession } = useAuth();
    const [loading, setLoading] = useState(true)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeLivraison);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            console.error(err);
        }
    };

    const detail_commande = async () => {
        try {
            const response = await api.get(`/commandes/detail/${reference_commande}/`, {
                withCredentials: true
            })

            if (response.status === 200) {
                const detail = response.data.data
                console.log(response.data.data);
                setIdentifiantCommande(detail.identifiant_commande)
                setStatusCommande(detail.etat_commande)
                setDateCommande(formatDate(detail.date_commande))
                setTotalPaye(detail.total_ttc)
                setCodeLivraison(detail.code_livraison)
                setLieuLivraison(detail.lieu_livraison)
                setNomClient(detail.client.nom_client)
                setNumero(detail.client.numero_telephone_client)

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
        if (loadingSession) return; // wait for session check
        detail_commande()
    }, [reference_commande, loadingSession])

    if (loadingSession) return <ConfirmationSkeleton />;

    if (reference_commande === null || !identifiantCommande) {
        return (
            <>
                <section className="page active" id="confirmation-page">
                    <div className="container confirmation-page">
                        <div className="confirmation-card">
                            <div className="information-icon">
                                <i className="fas fa-info-circle text-info" />
                            </div>
                            <h1>Aucune Commande confirmée !</h1>
                            <p className="subtitle">Passez une nouvelle commande.</p>

                            <div className="mt-5 action-row">
                                <Link to="/products" className="btn btn-primary">Voir les produits</Link>
                                {/* <a href="/account/#orders" className="btn btn-outline ml-2">Voir mes commandes</a> */}
                            </div>

                            {/* <div className="support-line mt-3"><i className="fas fa-headset" /> Besoin d'aide ? Contactez le support au <strong><a href="#">pyth.os201@gmail.com</a></strong>.</div> */}
                        </div>
                    </div>
                </section>
            </>
        )
    }

    return (
        <>
            {/* Page Confirmation */}
            {loading ? (
                <ConfirmationSkeleton />
            ) : (
                <section className="page active" id="confirmation-page">
                    <div className="container confirmation-page">
                        <div className="confirmation-card">
                            <div className="success-icon">
                                <i className="fas fa-check-circle" />
                            </div>
                            <h1>Commande confirmée !</h1>
                            <p className="subtitle">Merci pour votre achat — nous préparons votre commande.</p>

                            <div className="order-details card-grid">
                                <div className="order-item">
                                    <div className="label">Numéro de commande</div>
                                    <div className="value"><strong id="orderNumber">{identifiantCommande}</strong></div>
                                </div>
                                <div className="order-item">
                                    <div className="label">Nom et Prénoms</div>
                                    <div className="value"><strong id="orderNumber">{nomClient}</strong></div>
                                </div>
                                <div className="order-item">
                                    <div className="label">Contact</div>
                                    <div className="value"><strong id="orderNumber">{numero}</strong></div>
                                </div>
                                <div className="order-item">
                                    <div className="label">Date et Heure de la commande</div>
                                    <div className="value" id="orderDate">{dateCommande}</div>
                                </div>
                                {/* <div className="order-item">
                                <div className="label">Méthode de paiement</div>
                                <div className="value" id="paymentMethod">Mobile Money</div>
                            </div> */}
                                <div className="order-item">
                                    <div className="label">Total payé</div>
                                    {
                                        totalPaye ? (
                                            <div className="value"><strong id="totalPaid">{totalPaye}
                                                FCFA</strong></div>
                                        ) : (
                                            <div className="value"><strong id="totalPaid"></strong></div>
                                        )
                                    }

                                </div>
                                <div className="order-item">
                                    <div className="label">Lieu de Livraison</div>
                                    <div className="value"><strong id="orderNumber">{lieuLivraison}</strong></div>
                                </div>
                                {/* <div className="order-item">
                                <div className="label">Livraison estimée</div>
                                <div className="value"><strong id="deliveryDate">{dateLivraison}</strong></div>
                            </div> */}
                            </div>

                            <div className="order-references single">
                                <div className="shipping-tracking centered">
                                    <div className="tracking-card">
                                        <h4>Code de Livraison</h4>
                                        <div className="tracking-line">
                                            <div className="tracking-number" id="trackingNumber">{codeLivraison}</div>
                                            <button className="btn btn-ghost ml-2 copy-btn" onClick={handleCopy}>Copier</button>
                                        </div>
                                        {copied && <div className="toast">Copié ✓</div>}

                                    </div>
                                </div>
                            </div>

                            <p className="mt-4">Ce code de Livraison vous sera demandé à livraison de vote commande.</p>

                            <div className="status-pill confirmed" role="status">Statut:
                                {
                                    statusCommande === "en_cours" && (
                                        <strong> En cours</strong>

                                    )
                                }

                            </div>

                            <div className="mt-5 action-row">
                                <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
                                {/* <a href="/account/#orders" className="btn btn-outline ml-2">Voir mes commandes</a> */}
                            </div>

                            {/* <div className="support-line mt-3"><i className="fas fa-headset" /> Besoin d'aide ? Contactez le support au <strong><a href="#">pyth.os201@gmail.com</a></strong>.</div> */}
                        </div>
                    </div>
                    {
                        alert && (
                            <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} duration={3000} />
                        )
                    }
                </section>
            )}
        </>

    )
}