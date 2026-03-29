import React from 'react';
import '../styles/skeletons/FooterSkeleton.css';

const FooterSkeleton = () => {
  return (
    <footer className="main-footer-skeleton" aria-label="Chargement du pied de page">
      <div className="container">
        <div className="footer-grid-skeleton">
          <div className="footer-newsletter-skeleton">
            <div className="logo-skeleton skeleton"></div>
            <div className="text-skeleton skeleton" style={{ width: '60%', height: '20px' }}></div>
            <div className="form-skeleton">
              <div className="input-skeleton skeleton"></div>
              <div className="button-skeleton skeleton"></div>
            </div>
            <div className="contact-info-skeleton">
              <div className="text-skeleton skeleton" style={{ width: '70%' }}></div>
              <div className="text-skeleton skeleton" style={{ width: '50%' }}></div>
              <div className="text-skeleton skeleton" style={{ width: '60%' }}></div>
            </div>
            <div className="social-links-skeleton">
              <div className="social-link-skeleton skeleton"></div>
              <div className="social-link-skeleton skeleton"></div>
              <div className="social-link-skeleton skeleton"></div>
              <div className="social-link-skeleton skeleton"></div>
            </div>
          </div>
        </div>
        <div className="footer-bottom-skeleton">
          <div className="text-skeleton skeleton" style={{ width: '80%', height: '15px' }}></div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSkeleton;
