import { Link } from 'react-router-dom';
import '../styles/ErrorPages.css';

export const ServerErrorPage = () => {
    const handleRetry = () => window.location.reload();

    return (
        <div className="error-page error-page--500">
            {/* Blobs décoratifs */}
            <div className="error-blob error-blob--1" />
            <div className="error-blob error-blob--2" />
            <div className="error-blob error-blob--3" />

            <div className="error-card">

                <span className="error-icon">⚙️</span>

                <div className="error-code error-code--500">500</div>

                <div className="error-dots">
                    <div className="error-dot" style={{ background: 'var(--secondary-400)' }} />
                    <div className="error-dot" style={{ background: 'var(--tertiary-400)' }} />
                    <div className="error-dot" style={{ background: 'var(--neutral-400)' }} />
                </div>

                <div className="error-divider" />

                <h1 className="error-title">Quelque chose s'est mal passé</h1>

                <span className="error-detail error-detail--500">
                    <i className="fas fa-server" />
                    Erreur serveur interne
                </span>

                <p className="error-message">
                    Nos équipes travaillent d'arrache-pied pour résoudre le problème.
                    Veuillez réessayer dans quelques instants ou contacter notre support
                    si l'erreur persiste.
                </p>

                <div className="error-actions">
                    <button className="btn btn-ghost" onClick={handleRetry}>
                        <i className="fas fa-redo" /> Réessayer
                    </button>
                    <Link to="/" className="btn btn-secondary">
                        <i className="fas fa-home" /> Accueil
                    </Link>
                    <a href="mailto:support@africart.io" className="btn btn-primary">
                        <i className="fas fa-envelope" /> Contacter le support
                    </a>
                </div>

                <div className="error-brand">
                    <div className="error-brand-name">Afri<span>Cart</span></div>
                </div>
            </div>
        </div>
    );
};
