import "../styles/AccountPage.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Alert } from "../components/Alert";
import type { Commande } from "../interfaces/Commande";
import { formatDate } from "../utils/formatDate";
import AccountSkeleton from "../skeletons/AccountSkeleton";
import { useNavigate } from "react-router-dom";
import { AccountSidebar } from "../components/AccountSidebar";

const CommandesPage = () => {
    const { user, loadingSession } = useAuth();
    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const voirRecu = (id: string) => {
        navigate(`/receipt/${id}`);
    }

    const fetchCommandes = async () => {
        setIsLoading(true);
        try {
            if (!user) return;
            const response = await api.get(`/commandes/list/${user.email_utilisateur}/`);
            if (response.status === 200) {
                setCommandes(response.data.data);
            }
        } catch (error: any) {
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
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (loadingSession) return;
        if (!user) return;
        fetchCommandes();
    }, [user, loadingSession]);

    if (loadingSession || isLoading) {
        return (
            <section className="page active" id="account-page">
                <div className="container account-page">
                    <AccountSkeleton />
                </div>
            </section>
        );
    }

    if (!user) {
        return (
            <section className="page active" id="account-page">
                <div className="container account-page">
                    <div className="not-logged">
                        <h2>Vous devez être connecté pour voir vos commandes</h2>
                        <p>Veuillez vous connecter pour accéder à cette page.</p>
                        <a href="/login" className="btn btn-primary">Se connecter</a>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page active" id="account-page">
            <div className="container account-page">

                {
                    commandes.length === 0 ? (
                        <div className="account-content">
                            <h1 className="section-title">Mes commandes</h1>
                            <div className="account-container">
                                {/* Sidebar */}
                                <AccountSidebar />
                                {/* Contenu */}
                                <div className="order-history mt-4">
                                    <div className="order-card" >
                                        <div className="order-header">
                                            <div>
                                                <h5>Aucune commande</h5>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="account-content">
                            <h1 className="section-title">Mes commandes</h1>
                            <div className="account-container">
                                {/* Sidebar */}
                                <AccountSidebar />

                                {/* Contenu */}
                                <div className="order-history mt-4">
                                    {commandes && commandes.map((comm) => {
                                        const rawEtat = (comm.etat_commande || '').toString();
                                        const normalizedEtat = rawEtat
                                            .toLowerCase()
                                            .normalize('NFD')
                                            .replace(/\p{Diacritic}/gu, '')
                                            .replace(/[^a-z0-9_]+/gi, '_');

                                        let displayEtat = rawEtat;
                                        switch (normalizedEtat) {
                                            case 'en_cours':
                                                displayEtat = 'En cours';
                                                break;
                                            case 'valide':
                                                displayEtat = 'En Livraison...';
                                                break;
                                            case 'livre':
                                                displayEtat = 'Livrée';
                                                break;
                                            case 'annule':
                                            case 'annulee':
                                            case 'annulee_':
                                                displayEtat = 'Annulée';
                                                break;
                                            default:
                                                displayEtat = rawEtat;
                                        }

                                        return (
                                            <div className="order-card" key={comm.identifiant_commande}>
                                                <div className="order-header">
                                                    <div>
                                                        <h5>{comm.identifiant_commande}</h5>
                                                        <small style={{ fontWeight: "bold" }}>Date et Heure : </small>
                                                        <small>{formatDate(comm.date_commande)}</small>
                                                    </div>
                                                    {comm.etat_commande && (
                                                        <div className={`order-status status-${normalizedEtat}`}>
                                                            {displayEtat}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="order-items">
                                                    {comm.details_commandes?.map((detail) => (
                                                        <div className="order-item-img" key={detail.produit.thumbnail}>
                                                            <img src={detail.produit.thumbnail} alt={detail.produit.nom_produit} loading="lazy" />
                                                            <div> x {detail.quantite} </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="order-footer">
                                                    <div className="summary-item">
                                                        <span>Total</span>
                                                        <strong>{(
                                                            parseFloat(comm.total_ht) + (comm.frais_livraison_appliques ? parseFloat(comm.frais_livraison_appliques) : 0)
                                                        ).toLocaleString()} FCFA</strong>
                                                    </div>
                                                    <button className="btn-receipt" onClick={() => voirRecu(comm.identifiant_commande)}>
                                                        <i className="fas fa-receipt"></i> Voir le reçu
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
                        </div>
                    )
                }


            </div>
        </section>
    );
}

export default CommandesPage;
