import "../styles/AccountPage.css";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Alert } from "../components/Alert";
import type { Commande } from "../interfaces/Commande";
import { formatDate } from "../utils/formatDate";
import { validateEmail } from "../utils/emailChecking";
import { validationNumeroCI } from "../utils/validerNumero";
import AccountSkeleton from "../skeletons/AccountSkeleton";
import { useNavigate } from "react-router-dom";
import { AccountSidebar } from "../components/AccountSidebar";

export const AccountPage = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const { user, setUser, logout, loadingSession } = useAuth()
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [commandes, setCommandes] = useState<Commande[]>([])
    const [ancienMdp, setAncienMdp] = useState("")
    const [nouveauMdp, setNouveauMdp] = useState("")
    const [confirmMdp, setConfirmMdp] = useState("")
    const [nomUser, setNomUser] = useState("")
    const [emailUser, setEmailUser] = useState("")
    const [numUser, setNumUser] = useState("")
    const [isProfileModified, setIsProfileModified] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingPassword, setIsLoadingPassword] = useState(false)
    const navigate = useNavigate();


    // Live password criteria
    const isLengthValid = nouveauMdp.length >= 6;
    const hasUpper = /[A-Z]/.test(nouveauMdp);
    const hasLower = /[a-z]/.test(nouveauMdp);
    const hasSymbol = /[^A-Za-z0-9]/.test(nouveauMdp);
    const hasDigit = /[0-9]/.test(nouveauMdp);
    const isPasswordValidLive = isLengthValid && hasUpper && hasLower && hasSymbol && hasDigit;
    // Enable change password when criteria satisfied, confirmation matches and old password provided
    const isChangePasswordEnabled = isPasswordValidLive && nouveauMdp === confirmMdp && ancienMdp.trim() !== "";

    // Initialiser les champs avec les données de l'utilisateur
    useEffect(() => {
        if (user) {
            setNomUser(user.nom_utilisateur || "")
            setEmailUser(user.email_utilisateur || "")
            setNumUser(user.numero_telephone_utilisateur || "")
            setIsProfileModified(false) // Réinitialiser le flag de modification
        }
    }, [user])

    // Vérifier si le profil a été modifié
    useEffect(() => {
        if (user) {
            const isModified =
                nomUser !== (user.nom_utilisateur || "") ||
                emailUser !== (user.email_utilisateur || "") ||
                numUser !== (user.numero_telephone_utilisateur || "")
            setIsProfileModified(isModified)
        }
    }, [nomUser, emailUser, numUser, user])



    const voirRecu = (id: string) => {
        navigate(`/receipt/${id}`);
    }

    const ListeCommandeClient = async () => {
        setIsLoading(true)
        try {
            const response = await api.get(`/commandes/list/${user?.email_utilisateur}/`)

            if (response.status === 200) {
                console.log(response.data.data);
                setCommandes(response.data.data)
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
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateProfile = async () => {
        if (!nomUser.trim() || !emailUser.trim() || !numUser.trim()) {
            setAlert({ message: "Veuillez remplir tous les champs.", type: "error" });
            return;
        }

        if (!validateEmail(emailUser)) {
            setAlert({ message: "Email invalide.", type: "error" });
            return;
        }

        if (!validationNumeroCI(numUser)) {
            setAlert({ message: "Le numéro doit respecter le format ivoirien.", type: "error" });
            return;
        }

        setIsLoadingProfile(true);
        try {
            const response = await api.put(`/utilisateurs/detail/`, {
                nom_utilisateur: nomUser,
                email_utilisateur: emailUser,
                numero_telephone_utilisateur: numUser,
                role: 'client',
            });

            if (response.status === 200) {
                setUser(response.data.data)
                setAlert({ message: "Profil mis à jour avec succès.", type: "success" });
            }
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                if (status === 400) {
                    setAlert({ message: "Erreur de saisie.", type: "error" });
                } else if (status === 500) {
                    setAlert({ message: "Erreur survenue au serveur.", type: "error" });
                } else {
                    setAlert({ message: "Erreur lors de la mise à jour.", type: "error" });
                }
            }
        } finally {
            setIsLoadingProfile(false);
        }
    }

    const handleUpdatePassword = async () => {
        if (!ancienMdp.trim() || !nouveauMdp.trim() || !confirmMdp.trim()) {
            setAlert({ message: "Veuillez remplir tous les champs de mot de passe.", type: "error" });
            return;
        }

        if (nouveauMdp !== confirmMdp) {
            setAlert({ message: "Les nouveaux mots de passe ne correspondent pas.", type: "error" });
            return;
        }

        if (nouveauMdp === ancienMdp) {
            setAlert({ message: "Le nouveau mot de passe doit être différent de l'actuel mot de passe.", type: "error" });
            return;
        }

        setIsLoadingPassword(true);
        try {
            const response = await api.post(`/authentification/changer_mot_de_passe/`, {
                ancien_mot_de_passe: ancienMdp,
                nouveau_mot_de_passe: nouveauMdp
            });

            if (response.status === 200) {
                setAlert({ message: "Mot de passe mis à jour avec succès.", type: "success" });
                setAncienMdp("");
                setNouveauMdp("");
                setConfirmMdp("");
            }
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                if (status === 400) {
                    setAlert({ message: "Mot de passe actuel incorrect.", type: "error" });
                } else if (status === 500) {
                    setAlert({ message: "Erreur survenue au serveur.", type: "error" });
                } else {
                    setAlert({ message: "Erreur lors de la mise à jour.", type: "error" });
                }
            }
        } finally {
            setIsLoadingPassword(false);
        }
    }

    useEffect(() => {
        // Only fetch orders when we know the session has been resolved and user exists
        if (loadingSession) return;
        if (!user) return;
        ListeCommandeClient();
    }, [user, loadingSession])

    // Afficher le skeleton tant que la vérification de session ou le chargement profil/commandes est en cours
    if (loadingSession || isLoading) {
        return (
            <section className="page active" id="account-page">
                <div className="container account-page">
                    <AccountSkeleton />
                </div>
            </section>
        );
    }

    // Si la session est résolue et qu'il n'y a pas d'utilisateur connecté, inviter à se connecter
    if (!user) {
        return (
            <section className="page active" id="account-page">
                <div className="container account-page">
                    <div className="not-logged">
                        <h2>Vous n'êtes pas connecté</h2>
                        <p>Veuillez vous connecter pour accéder à votre compte et à vos commandes.</p>
                        <a href="/login" className="btn btn-primary">Se connecter</a>
                    </div>
                </div>
            </section>
        );
    }



    return (
        <section className="page active" id="account-page">
            <div className="container account-page">
                <h1 className="section-title">Mon Compte</h1>
                <div className="account-container">
                    {/* Sidebar */}
                    <AccountSidebar />

                    {/* Contenu */}
                    <div className="account-content">
                        {activeTab === "profile" && (
                            <div className="account-tab active">
                                {/* contenu profil */}
                                <div className="account-tab active" id="profile-tab">
                                    <h3>Mon profil</h3>
                                    <p className="mt-2">Gérez vos informations personnelles</p>
                                    <div className="form-group mt-4">
                                        <label>Nom et prénoms</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="profileName"
                                            value={nomUser}
                                            onChange={(e) => setNomUser(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-row mt-3">
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                id="profileEmail"
                                                value={emailUser}
                                                onChange={(e) => setEmailUser(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Téléphone</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                id="profilePhone"
                                                value={numUser}
                                                onChange={(e) => setNumUser(e.target.value)}

                                            />
                                        </div>
                                    </div>


                                    <button
                                        className="btn btn-primary mt-4"
                                        onClick={handleUpdateProfile}
                                        disabled={!isProfileModified || isLoadingProfile}
                                        style={{ opacity: (isProfileModified && !isLoadingProfile) ? 1 : 0.5, cursor: (isProfileModified && !isLoadingProfile) ? 'pointer' : 'not-allowed' }}
                                    >
                                        {isLoadingProfile ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="loader-btn"></span>
                                                Mise à jour en cours...
                                            </span>
                                        ) : (
                                            "Mettre à jour le profil"
                                        )}
                                    </button>
                                </div>
                                <br />
                                <div className="account-tab active" id="profile-tab">
                                    <h3>Modifier le mot de passe</h3>
                                    <div className="form-row mt-3">
                                        <div className="form-group">
                                            <label>Mot de passe actuel</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="oldPassword"
                                                value={ancienMdp}
                                                onChange={(e) => setAncienMdp(e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Nouveau mot de passe</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="newPassword"
                                                value={nouveauMdp}
                                                onChange={(e) => setNouveauMdp(e.target.value)}
                                                aria-invalid={nouveauMdp.length > 0 && !isPasswordValidLive}

                                            />
                                        </div>
                                    </div>
                                    <div className="form-group mt-4">
                                        <label>Confirmer le nouveau mot de passe</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="confirmPassword"
                                            value={confirmMdp}
                                            onChange={(e) => setConfirmMdp(e.target.value)}
                                            aria-invalid={confirmMdp.length > 0 && !isPasswordValidLive}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary mt-4"
                                        onClick={handleUpdatePassword}
                                        disabled={!isChangePasswordEnabled || isLoadingPassword}
                                        aria-disabled={!isChangePasswordEnabled || isLoadingPassword}
                                        style={{ opacity: (!isChangePasswordEnabled || isLoadingPassword) ? 0.5 : 1, cursor: (!isChangePasswordEnabled || isLoadingPassword) ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isLoadingPassword ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="loader-btn"></span>
                                                Mise à jour en cours...
                                            </span>
                                        ) : (
                                            "Changer de mot de passe"
                                        )}
                                    </button>
                                    <div id="password-criteria" className="password-criteria">
                                        <p className="criteria-title">Le mot de passe doit contenir :</p>
                                        <ul>
                                            <li className={isLengthValid ? "valid" : "invalid"}>Au moins 6 caractères</li>
                                            <li className={hasUpper ? "valid" : "invalid"}>Une lettre majuscule</li>
                                            <li className={hasLower ? "valid" : "invalid"}>Une lettre minuscule</li>
                                            <li className={hasDigit ? "valid" : "invalid"}>Au moins un chiffre</li>
                                            <li className={hasSymbol ? "valid" : "invalid"}>Au moins un symbole</li>
                                        </ul>
                                    </div>
                                </div>
                                <button className="btn mt-4" style={{ backgroundColor: "#d32f2f", color: "white" }} onClick={logout}>
                                    Se deconnecter
                                </button>
                            </div>
                        )}

                        

                        {activeTab === "wishlist" && (
                            <div className="account-tab active">
                                {/* contenu wishlist */}
                                <h3>Mes favoris</h3>
                                <p className="mt-2">Produits que vous avez aimé</p>
                                <div className="products-grid mt-4" id="wishlistGrid">
                                    {/* Produit 1 */}
                                    <div className="product-card fade-in" data-id={5}>
                                        <div className="product-image">
                                            <img
                                                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1099&q=80"
                                                alt="Montre intelligente FitPro 5"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="product-info">
                                            <div className="product-category">Électronique</div>
                                            <h3 className="product-title">
                                                Montre intelligente FitPro 5
                                            </h3>
                                            <div className="product-price">
                                                <span className="current-price">65 000 FCFA</span>
                                            </div>
                                            <div className="product-rating">
                                                <div className="stars">
                                                    <i className="fas fa-star" />
                                                    <i className="fas fa-star" />
                                                    <i className="fas fa-star" />
                                                    <i className="fas fa-star" />
                                                    <i className="fas fa-star-half-alt" />
                                                </div>
                                                <div className="rating-count">(312)</div>
                                            </div>
                                            <div className="product-actions">
                                                <button className="add-to-cart" data-id={5}>
                                                    <i className="fas fa-cart-plus" /> Ajouter
                                                </button>
                                                <button className="wishlist-btn" data-id={5}>
                                                    <i
                                                        className="fas fa-heart"
                                                        style={{ color: "#ff6b6b" }}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Produit 2 */}
                                    <div className="product-card fade-in" data-id={8}>
                                        <div className="product-image">
                                            <img
                                                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
                                                alt="Sac à dos élégant en cuir"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="product-info">
                                            <div className="product-category">Mode</div>
                                            <h3 className="product-title">Sac à dos élégant en cuir</h3>
                                            <div className="product-price">
                                                <span className="current-price">42 000 FCFA</span>
                                                <span className="original-price">48 000 FCFA</span>
                                            </div>
                                            <div className="product-rating">
                                                <div className="stars">
                                                    <i className="fas fa-star" />
                                                    <i className="fas fa-star" />
                                                    <i className="fas fa-star" />
                                                    <i className="fas fa-star" />
                                                    <i className="far fa-star" />
                                                </div>
                                                <div className="rating-count">(45)</div>
                                            </div>
                                            <div className="product-actions">
                                                <button className="add-to-cart" data-id={8}>
                                                    <i className="fas fa-cart-plus" /> Ajouter
                                                </button>
                                                <button className="wishlist-btn" data-id={8}>
                                                    <i
                                                        className="fas fa-heart"
                                                        style={{ color: "#ff6b6b" }}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {
                    alert && (
                        <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} duration={3000} />
                    )
                }
            </div>
        </section>
    );
};
