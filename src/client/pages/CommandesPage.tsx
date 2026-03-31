import "../styles/AccountPage.css";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useUsersOrders } from "../services/commandeService";
import { Alert } from "../components/Alert";
import type { Commande } from "../interfaces/Commande";
import { formatDate } from "../utils/formatDate";
import AccountSkeleton from "../skeletons/AccountSkeleton";
import { useNavigate } from "react-router-dom";
import { AccountSidebar } from "../components/AccountSidebar";
import { SmallLoader } from "../components/Loader";

const CommandesPage = () => {
    const { user, loadingSession } = useAuth();
    const navigate = useNavigate();
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // --- HOOK TANSTACK QUERY ---
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isQueryLoading,
        isError,
        error: commandesError,
        refetch
    } = useUsersOrders(user?.email_utilisateur || "");

    // Aplatir les pages de commandes
    const allCommandes: Commande[] = data?.pages.flatMap(page => {
        // Adaptation selon la structure de ta réponse Django
        return page.data?.results || page.results || page.data || [];
    }) || [];

    // --- NAVIGATION ---
    const voirRecu = (id: string) => {
        navigate(`/receipt/${id}`);
    }

    // --- INFINITE SCROLL OBSERVER ---
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (sentinelRef.current) observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Gestion des erreurs (utilise l'erreur parsée attachée par le client API)
    const parseError = (err: unknown) => {
        if (!err || typeof err !== 'object') return { message: 'Erreur lors de la récupération des commandes.', status: null as number | null };
        const e = err as Record<string, unknown>;
        const parsed = e['parsed'] as Record<string, unknown> | undefined;
        const message = parsed && typeof parsed['message'] === 'string' ? parsed['message'] : (typeof e['message'] === 'string' ? e['message'] : 'Erreur lors de la récupération des commandes.');
        const resp = e['response'] as Record<string, unknown> | undefined;
        const status = resp && typeof resp['status'] === 'number' ? Number(resp['status']) : (resp && typeof resp['status'] === 'string' ? Number(resp['status']) : null);
        return { message, status };
    };
    const { message: parsedErrorMessage, status: errorStatus } = parseError(commandesError);

    useEffect(() => {
        if (isError) {
            if (allCommandes.length === 0) {
                // Si aucune donnée, on laisse le rendu afficher une page d'erreur complète (voir plus bas)
                if (errorStatus === 401) {
                    // avoid synchronous setState in effect
                    setTimeout(() => setAlert({ message: "Session expirée. Veuillez vous reconnecter.", type: "error" }), 0);
                    navigate('/login', { replace: true });
                }
            } else {
                // Si on a déjà des commandes affichées, afficher une alerte non bloquante
                setTimeout(() => setAlert({ message: parsedErrorMessage, type: "error" }), 0);
            }
        }
    }, [isError, errorStatus, parsedErrorMessage, allCommandes.length, navigate]);

    // --- ÉTATS DE CHARGEMENT & AUTH ---
    if (loadingSession || (isQueryLoading && allCommandes.length === 0)) {
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
                        <button onClick={() => navigate('/login')} className="btn btn-primary">Se connecter</button>
                    </div>
                </div>
            </section>
        );
    }

    // Si l'appel a échoué et qu'il n'y a aucune commande à afficher, montrer une page d'erreur avec possibilité de retry
    if (isError && allCommandes.length === 0) {
        return (
            <section className="page active" id="account-page">
                <div className="container account-page">
                    <div className="not-logged">
                        <h2>Erreur</h2>
                        <p>{parsedErrorMessage}</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <button onClick={() => { refetch(); setAlert(null); }} className="btn btn-primary">Réessayer</button>
                            {errorStatus === 401 && (
                                <button onClick={() => navigate('/login')} className="btn">Se reconnecter</button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="page active" id="account-page">
            <div className="container account-page">
                <div className="account-content">
                    <h1 className="section-title">Mes commandes</h1>
                    <div className="account-container">
                        <AccountSidebar />

                        <div className="order-history mt-4">
                            {allCommandes.length === 0 ? (
                                <div className="order-card">
                                    <div className="order-header">
                                        <h5>Aucune commande trouvée</h5>
                                    </div>
                                </div>
                            ) : (
                                allCommandes.map((comm) => {
                                    const rawEtat = (comm.etat_commande || '').toString();
                                    const normalizedEtat = rawEtat
                                        .toLowerCase()
                                        .normalize('NFD')
                                        .replace(/\p{Diacritic}/gu, '')
                                        .replace(/[^a-z0-9_]+/gi, '_');

                                    let displayEtat = rawEtat;
                                    switch (normalizedEtat) {
                                        case 'en_cours': displayEtat = 'En cours'; break;
                                        case 'valide': displayEtat = 'En Livraison...'; break;
                                        case 'livre': displayEtat = 'Livrée'; break;
                                        case 'annule': 
                                        case 'annulee': displayEtat = 'Annulée'; break;
                                    }

                                    return (
                                        <div className="order-card" key={comm.identifiant_commande}>
                                            <div className="order-header">
                                                <div>
                                                    <h5>{comm.identifiant_commande}</h5>
                                                    <small><strong>Date : </strong>{formatDate(comm.date_commande)}</small>
                                                </div>
                                                <div className={`order-status status-${normalizedEtat}`}>
                                                    {displayEtat}
                                                </div>
                                            </div>

                                            <div className="order-items">
                                                {comm.details_commandes?.map((detail, idx) => (
                                                    <div className="order-item-img" key={`${comm.identifiant_commande}-item-${idx}`}>
                                                        <img src={detail.produit.thumbnail} alt={detail.produit.nom_produit} loading="lazy" />
                                                        <div> x {detail.quantite} </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="order-footer">
                                                <div className="summary-item">
                                                    <span>Total</span>
                                                    <strong>{(
                                                        parseFloat(comm.total_ht || "0") + 
                                                        parseFloat(comm.frais_livraison_appliques || "0")
                                                    ).toLocaleString()} FCFA</strong>
                                                </div>
                                                <button className="btn-receipt" onClick={() => voirRecu(comm.identifiant_commande)}>
                                                    <i className="fas fa-receipt"></i> Voir le reçu
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            
                            {/* Sentinel pour le scroll infini */}
                            <div ref={sentinelRef} style={{ height: '20px' }} />
                            {isFetchingNextPage && <div className="text-center p-3"><SmallLoader /></div>}
                        </div>
                    </div>
                </div>
            </div>
            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </section>
    );
}

export default CommandesPage;