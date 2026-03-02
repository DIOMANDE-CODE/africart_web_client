import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import type { RecuCommande } from "../interfaces/DetailCommande";
import { formatDate } from "../utils/formatDate";
import ReceiptSkeleton from "../skeletons/ReceiptSkeleton";
import "../styles/ReceiptPage.css";

export const ReceiptPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [commande, setCommande] = useState<RecuCommande | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCommande = async () => {
            if (!id) {
                setError("Identifiant de commande manquant");
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get(`/commandes/detail/${id}/`);
                
                if (response.status === 200) {
                    console.log(response.data.data);
                    setCommande(response.data.data);
                    
                }
            } catch (error: any) {
                console.error("Erreur lors de la récupération de la commande:", error);
                setError("Impossible de charger le reçu");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCommande();
    }, [id, user]);


    const getDeliveryFee = () => {
        if (!commande) return 0;
        // Utiliser frais_livraison_appliques de la base de données
        if (commande.frais_livraison_appliques) {
            return parseFloat(commande.frais_livraison_appliques);
        }
        // Fallback si le champ n'existe pas
        return commande.lieu_livraison.toLowerCase() !== 'yamoussoukro' ? 2000 : 0;
    };

    const calculateTotal = () => {
        if (!commande) return 0;
        const subtotal = parseFloat(commande.total_ht);
        const deliveryFee = getDeliveryFee();
        return subtotal + deliveryFee;
    };

    const normalizeEtat = (etat: string) => {
        const rawEtat = (etat || '').toString();
        const normalizedEtat = rawEtat
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-z0-9_]+/gi, '_');

        let displayEtat = rawEtat;
        let statusClass = '';

        switch (normalizedEtat) {
            case 'en_cours':
                displayEtat = 'En cours';
                statusClass = 'status-pending';
                break;
            case 'valide':
                displayEtat = 'En Livraison...';
                statusClass = 'status-shipping';
                break;
            case 'livre':
                displayEtat = 'Livrée';
                statusClass = 'status-delivered';
                break;
            case 'annule':
            case 'annulee':
            case 'annulee_':
                displayEtat = 'Annulée';
                statusClass = 'status-cancelled';
                break;
            default:
                displayEtat = rawEtat;
                statusClass = 'status-unknown';
        }

        return { displayEtat, statusClass };
    };

    if (isLoading) {
        return <ReceiptSkeleton />;
    }

    if (error || !commande) {
        return (
            <section className="receipt-page">
                <div className="receipt-container">
                    <div className="receipt-error">
                        <i className="fas fa-exclamation-circle"></i>
                        <h2>{error || "Commande introuvable"}</h2>
                        <button className="btn-back" onClick={() => navigate('/account')}>
                            <i className="fas fa-arrow-left"></i>
                            Retour au compte
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    const { displayEtat, statusClass } = normalizeEtat(commande.etat_commande);
    const deliveryFee = getDeliveryFee();
    const totalCalcule = calculateTotal();

    return (
        <section className="receipt-page">
            <div className="receipt-container">
                {/* Actions Toolbar */}
                <div className="receipt-toolbar no-print">
                    <button className="btn-back" onClick={() => navigate('/account')}>
                        <i className="fas fa-arrow-left"></i>
                        Retour
                    </button>
                    {/* <div className="toolbar-actions">
                        <button className="btn-print" onClick={handlePrint}>
                            <i className="fas fa-print"></i>
                            Imprimer
                        </button>
                        <button className="btn-download" onClick={handleDownload}>
                            <i className="fas fa-download"></i>
                            Télécharger
                        </button>
                    </div> */}
                </div>

                {/* Receipt Content */}
                <div className="receipt-card" ref={receiptRef}>
                    {/* Header */}
                    <div className="receipt-header">
                        <div className="receipt-logo">
                            <div className="logo-icon">
                                <i className="fas fa-shopping-bag"></i>
                            </div>
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

                    {/* Divider */}
                    <div className="receipt-divider"></div>

                    {/* Order Info */}
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
                                <i className="fas fa-map-marker-alt"></i>
                                {commande.lieu_livraison}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="receipt-section">
                        <h3 className="section-title">
                            <i className="fas fa-user"></i>
                            Informations client
                        </h3>
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

                    {/* Items Table */}
                    <div className="receipt-section">
                        <h3 className="section-title">
                            <i className="fas fa-box"></i>
                            Détails de la commande
                        </h3>
                        <div className="items-table-wrapper">
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th className="text-center">Quantité</th>
                                        <th className="text-right">Prix unitaire (FCFA)</th>
                                        <th className="text-right">Total(FCFA)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commande.details_commandes?.map((detail, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="product-cell">
                                                    <img 
                                                        src={detail.produit.thumbnail} 
                                                        alt={detail.produit.nom_produit}
                                                        className="product-thumbnail"
                                                    />
                                                    <span className="product-name">
                                                        {detail.produit.nom_produit}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="quantity-badge">
                                                    x {detail.quantite}
                                                </span>
                                            </td>
                                            <td className="text-right">{detail.prix_unitaire}</td>
                                            <td className="text-right">{detail.sous_total}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="receipt-summary">
                        <div className="summary-row">
                            <span>Sous-total</span>
                            <span>{parseFloat(commande.total_ht).toLocaleString()} FCFA</span>
                        </div>
                        {deliveryFee > 0 && (
                            <div className="summary-row">
                                <span>Frais de livraison</span>
                                <span>{deliveryFee.toLocaleString()} FCFA</span>
                            </div>
                        )}
                        <div className="summary-divider"></div>
                        <div className="summary-row summary-total">
                            <span>Total TTC</span>
                            <span className="total-amount">
                                {totalCalcule.toLocaleString()} FCFA
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="receipt-footer">
                        <div className="footer-note">
                            <i className="fas fa-info-circle"></i>
                            <p>
                                Merci pour votre commande ! Pour toute question, contactez notre service client.
                            </p>
                        </div>
                        <div className="footer-contact">
                            <div className="contact-item">
                                <i className="fas fa-phone"></i>
                                <span>+225 05 95 03 16</span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <span>support@africart.com</span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-globe"></i>
                                <span>www.africart.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
