import { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrderDetail } from "../services/commandeService";
import { formatDate } from "../utils/formatDate";
import ReceiptSkeleton from "../skeletons/ReceiptSkeleton";
import "../styles/ReceiptPage.css";

export const ReceiptPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, loadingSession } = useAuth();
    const receiptRef = useRef<HTMLDivElement>(null);

    // --- HOOK TANSTACK QUERY ---
    // On utilise directement le hook que tu as défini dans commandeService.ts
    const { 
        data: responseData, 
        isLoading: isQueryLoading, 
        isError 
    } = getOrderDetail(id || "");

    const commande = responseData?.data || responseData;

    // --- LOGIQUE DE CALCUL ---
    const getDeliveryFee = () => {
        if (!commande) return 0;
        if (commande.frais_livraison_appliques) {
            return parseFloat(commande.frais_livraison_appliques);
        }
        return commande.lieu_livraison?.toLowerCase() !== 'yamoussoukro' ? 2000 : 0;
    };

    const calculateTotal = () => {
        if (!commande) return 0;
        const subtotal = parseFloat(commande.total_ht || "0");
        const deliveryFee = getDeliveryFee();
        return subtotal + deliveryFee;
    };

    const normalizeEtat = (etat: string) => {
        const rawEtat = (etat || '').toString();
        const normalized = rawEtat
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-z0-9_]+/gi, '_');

        const states: Record<string, { label: string, class: string }> = {
            'en_cours': { label: 'En cours', class: 'status-pending' },
            'valide': { label: 'En Livraison...', class: 'status-shipping' },
            'livre': { label: 'Livrée', class: 'status-delivered' },
            'annule': { label: 'Annulée', class: 'status-cancelled' },
            'annulee': { label: 'Annulée', class: 'status-cancelled' },
        };

        return states[normalized] || { label: rawEtat, class: 'status-unknown' };
    };

    // --- GESTION DES ÉTATS ---
    if (loadingSession || isQueryLoading) {
        return <ReceiptSkeleton />;
    }

    if (isError || !commande || !user) {
        return (
            <section className="receipt-page">
                <div className="receipt-container">
                    <div className="receipt-error text-center">
                        <i className="fas fa-exclamation-circle fa-3x mb-3" style={{color: '#e74c3c'}}></i>
                        <h2>{!user ? "Veuillez vous connecter" : "Reçu introuvable"}</h2>
                        <p className="mb-4">Désolé, nous ne parvenons pas à charger les détails de cette commande.</p>
                        <button className="btn-back" onClick={() => navigate('/commandes')}>
                            <i className="fas fa-arrow-left"></i> Retour aux commandes
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    const { label: displayEtat, class: statusClass } = normalizeEtat(commande.etat_commande);
    const totalCalcule = calculateTotal();

    return (
        <section className="receipt-page">
            <div className="receipt-container">
                <div className="receipt-toolbar no-print">
                    <button className="btn-back" onClick={() => navigate('/commandes')}>
                        <i className="fas fa-arrow-left"></i> Retour
                    </button>
                    <div className="toolbar-actions">
                        <button className="btn-print" onClick={() => window.print()}>
                            <i className="fas fa-print"></i> Imprimer
                        </button>
                    </div>
                </div>

                <div className="receipt-card" ref={receiptRef}>
                    <div className="receipt-header">
                        <div className="receipt-logo">
                            <div className="logo-text">
                                <h1>Afri<span>Cart</span></h1>
                            </div>
                        </div>
                        <div className="receipt-title">
                            <h2>REÇU DE COMMANDE</h2>
                            <div className={`receipt-status ${statusClass}`}>
                                {displayEtat}
                            </div>
                        </div>
                    </div>

                    <div className="receipt-divider"></div>

                    <div className="receipt-info-grid">
                        <div className="info-block">
                            <label>Numéro de commande</label>
                            <p className="info-value">{commande.identifiant_commande}</p>
                        </div>
                        <div className="info-block">
                            <label>Date de commande</label>
                            <p className="info-value">{formatDate(commande.date_commande)}</p>
                        </div>
                        <div className="info-block">
                            <label>Code de livraison</label>
                            <p className="info-value code-livraison">{commande.code_livraison}</p>
                        </div>
                        <div className="info-block">
                            <label>Lieu de livraison</label>
                            <p className="info-value">
                                <i className="fas fa-map-marker-alt"></i> {commande.lieu_livraison}
                            </p>
                        </div>
                    </div>

                    <div className="receipt-section">
                        <h3 className="section-title"><i className="fas fa-user"></i> Informations client</h3>
                        <div className="customer-info">
                            <div className="customer-detail">
                                <label>Nom</label>
                                <p>{user?.nom_utilisateur || "Client"}</p>
                            </div>
                            <div className="customer-detail">
                                <label>Email</label>
                                <p>{user?.email_utilisateur || "N/A"}</p>
                            </div>
                            <div className="customer-detail">
                                <label>Téléphone</label>
                                <p>{user?.numero_telephone_utilisateur || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="receipt-section">
                        <h3 className="section-title"><i className="fas fa-box"></i> Détails</h3>
                        <div className="items-table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th className="text-center">Qté</th>
                                        <th className="text-right">Prix (FCFA)</th>
                                        <th className="text-right">Total (FCFA)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commande.details_commandes?.map((detail: any, index: number) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="product-cell">
                                                    <img src={detail.produit.thumbnail} alt={detail.produit.nom_produit} className="product-thumbnail" />
                                                    <span className="product-name">{detail.produit.nom_produit}</span>
                                                </div>
                                            </td>
                                            <td className="text-center">x {detail.quantite}</td>
                                            <td className="text-right">{parseFloat(detail.prix_unitaire).toLocaleString()}</td>
                                            <td className="text-right">{parseFloat(detail.sous_total).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="receipt-summary">
                        <div className="summary-row">
                            <span>Sous-total</span>
                            <span>{parseFloat(commande.total_ht || "0").toLocaleString()} FCFA</span>
                        </div>
                        {getDeliveryFee() > 0 && (
                            <div className="summary-row">
                                <span>Frais de livraison</span>
                                <span>{getDeliveryFee().toLocaleString()} FCFA</span>
                            </div>
                        )}
                        <div className="summary-divider"></div>
                        <div className="summary-row summary-total">
                            <span>Total TTC</span>
                            <span className="total-amount">{totalCalcule.toLocaleString()} FCFA</span>
                        </div>
                    </div>

                    <div className="receipt-footer">
                        <div className="footer-note">
                            <i className="fas fa-info-circle"></i>
                            <p>Merci de votre confiance en <strong>AfriCart</strong>. À bientôt !</p>
                        </div>
                        <div className="footer-contact">
                            <span><i className="fas fa-phone"></i> +225 05 95 03 16 94</span>
                            <span><i className="fas fa-globe"></i> www.africart.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};