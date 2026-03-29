import { Link, useNavigate } from 'react-router-dom';
import '../styles/ErrorPages.css';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page error-page--404">
      {/* Blobs décoratifs */}
      <div className="error-blob error-blob--1" />
      <div className="error-blob error-blob--2" />
      <div className="error-blob error-blob--3" />

      <div className="error-card">

        <span className="error-icon">🛒</span>

        <div className="error-code error-code--404">404</div>

        <div className="error-dots">
          <div className="error-dot" style={{ background: 'var(--primary-400)' }} />
          <div className="error-dot" style={{ background: 'var(--secondary-400)' }} />
          <div className="error-dot" style={{ background: 'var(--tertiary-400)' }} />
        </div>

        <div className="error-divider" />

        <h1 className="error-title">Cette page s'est évaporée !</h1>

        <span className="error-detail error-detail--404">
          <i className="fas fa-map-marker-alt" />
          Page introuvable
        </span>

        <p className="error-message">
          Oups ! La page que vous recherchez n'existe plus ou a été déplacée.
          Pas de panique — le marché AfriCart regorge de merveilles.
          Revenez en arrière ou explorez nos produits.
        </p>

        <div className="error-actions">
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left" /> Retour
          </button>
          <Link to="/" className="btn btn-secondary">
            <i className="fas fa-home" /> Accueil
          </Link>
          <Link to="/products" className="btn btn-primary">
            <i className="fas fa-store" /> Explorer les produits
          </Link>
        </div>

        <div className="error-brand">
          <div className="error-brand-name">Afri<span>Cart</span></div>
        </div>
      </div>
    </div>
  );
};
