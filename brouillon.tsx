import "../styles/AccountPage.css";
import { useState } from "react";

export const AccountPage = () => {
    const [activeTab, setActiveTab] = useState("profile");

    const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: string) => { e.preventDefault(); 
    setActiveTab(tab); }
        
    return (
        <>
            {/* Page Compte */}
            <section className="page active" id="account-page">
                <div className="container account-page">
                    <h1 className="section-title">Mon Compte</h1>
                    <div className="account-container">
                        <div className="account-sidebar">
                            <ul className="account-nav">
                                <li>
                                    <a href="#" className="active">
                                        Mon profil
                                    </a>
                                </li>
                                <li>
                                    <a href="#orders-tab">Mes commandes</a>
                                </li>
                                <li>
                                    <a href="#">Mes adresses</a>
                                </li>
                                <li>
                                    <a href="#">Ma liste de souhaits</a>
                                </li>
                                <li>
                                    <a href="#">Paramètres</a>
                                </li>
                            </ul>
                        </div>
                        <div className="account-content">
                            {/* Onglet Profil */}
                            <div className="account-tab active" id="profile-tab">
                                <h3>Mon profil</h3>
                                <p className="mt-2">Gérez vos informations personnelles</p>
                                <div className="form-group mt-4">
                                    <label>Nom complet</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        defaultValue="Jean Dupont"
                                        id="profileName"
                                    />
                                </div>
                                <div className="form-row mt-3">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            defaultValue="jean.dupont@email.com"
                                            id="profileEmail"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Téléphone</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            defaultValue="+225 07 12 34 56 78"
                                            id="profilePhone"
                                        />
                                    </div>
                                </div>
                                <button className="btn btn-primary mt-4">
                                    Mettre à jour le profil
                                </button>
                            </div>
                            {/* Onglet Commandes */}
                            <div className="account-tab" id="orders-tab">
                                <h3>Historique des commandes</h3>
                                <p className="mt-2">
                                    Consultez l'état de vos commandes précédentes
                                </p>
                                <div className="order-history mt-4">
                                    {/* Commande 1 */}
                                    <div className="order-card">
                                        <div className="order-header">
                                            <div>
                                                <h5>Commande AC-2023-00122</h5>
                                                <small>8 Novembre 2023</small>
                                            </div>
                                            <div className="order-status status-delivered">Livrée</div>
                                        </div>
                                        <div className="order-items">
                                            <div className="order-item-img">
                                                <img
                                                    src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                                                    alt="Robe africaine en wax élégante"
                                                />
                                            </div>
                                            <div className="order-item-img">
                                                <img
                                                    src="https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1142&q=80"
                                                    alt="Parfum exclusif African Essence"
                                                />
                                            </div>
                                        </div>
                                        <div className="order-footer">
                                            <div className="summary-item">
                                                <span>Total</span>
                                                <strong>73 500 FCFA</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Onglet Adresses */}
                            <div className="account-tab" id="addresses-tab">
                                <h3>Mes adresses</h3>
                                <p className="mt-2">Gérez vos adresses de livraison</p>
                                <div className="mt-4">
                                    <div
                                        className="address-card"
                                        style={{
                                            backgroundColor: "var(--light)",
                                            padding: "var(--spacing-md)",
                                            borderRadius: "var(--border-radius)"
                                        }}
                                    >
                                        <h4>Adresse principale</h4>
                                        <p className="mt-2">Jean Dupont</p>
                                        <p>123 Avenue de la République</p>
                                        <p>Abidjan, Plateau</p>
                                        <p>Côte d'Ivoire</p>
                                        <p>Tél: +225 07 12 34 56 78</p>
                                        <div className="mt-3">
                                            <button className="btn btn-outline btn-small">
                                                Modifier
                                            </button>
                                            <button className="btn btn-outline btn-small ml-2">
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary mt-4">
                                        Ajouter une nouvelle adresse
                                    </button>
                                </div>
                            </div>
                            {/* Onglet Liste de souhaits */}
                            <div className="account-tab" id="wishlist-tab">
                                <h3>Ma liste de souhaits</h3>
                                <p className="mt-2">Produits que vous avez sauvegardés</p>
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
                            {/* Onglet Paramètres */}
                            <div className="account-tab" id="settings-tab">
                                <h3>Paramètres du compte</h3>
                                <p className="mt-2">
                                    Gérez vos préférences et paramètres de sécurité
                                </p>
                                <div className="mt-4">
                                    <h4>Notifications</h4>
                                    <div className="form-group mt-2">
                                        <label>
                                            <input type="checkbox" defaultChecked /> Recevoir des
                                            notifications par email
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            <input type="checkbox" defaultChecked /> Recevoir des
                                            notifications SMS
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            <input type="checkbox" /> Recevoir des offres promotionnelles
                                        </label>
                                    </div>
                                    <h4 className="mt-4">Sécurité</h4>
                                    <button className="btn btn-outline mt-2">
                                        Changer le mot de passe
                                    </button>
                                    <button className="btn btn-outline mt-2 ml-2">
                                        Activer l'authentification à deux facteurs
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>

    )
}