import React from "react";
import "../styles/skeletons/CheckoutSkeleton.css";

const CheckoutSkeleton: React.FC = () => {
    return (
        <section className="page active" id="checkout-page">
            <div className="container checkout-page">
                <div className="skeleton-title-main"></div>
                
                <div className="checkout-skeleton-container">
                    {/* Colonne gauche - Formulaire */}
                    <div className="checkout-skeleton-form">
                        <div className="skeleton-subtitle"></div>
                        
                        {/* Section carte */}
                        <div className="skeleton-map-section">
                            <div className="skeleton-label"></div>
                            <div className="skeleton-map"></div>
                            <div className="skeleton-text-small"></div>
                        </div>
                        
                        {/* Champ lieu de livraison */}
                        <div className="skeleton-form-group">
                            <div className="skeleton-label"></div>
                            <div className="skeleton-input"></div>
                        </div>
                        
                        {/* Section paiement */}
                        <div className="skeleton-payment-section">
                            <div className="skeleton-payment-option"></div>
                        </div>
                    </div>
                    
                    {/* Colonne droite - Récapitulatif */}
                    <div className="checkout-skeleton-summary">
                        <div className="skeleton-subtitle"></div>
                        
                        {/* Items de commande */}
                        <div className="skeleton-summary-items">
                            <div className="skeleton-summary-item"></div>
                            <div className="skeleton-summary-item"></div>
                            <div className="skeleton-summary-item"></div>
                            <div className="skeleton-divider"></div>
                            <div className="skeleton-summary-item"></div>
                        </div>
                        
                        {/* Total */}
                        <div className="skeleton-total-section">
                            <div className="skeleton-total-line"></div>
                        </div>
                        
                        {/* Bouton */}
                        <div className="skeleton-button-large"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckoutSkeleton;
