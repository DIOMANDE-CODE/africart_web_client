import React from "react";
import "../styles/skeletons/AccountSkeleton.css";

const AccountSkeleton: React.FC = () => {
  return (
    <div className="account-skeleton">
      <div className="container">
        <h1 className="section-title">Mon Compte</h1>
        <div className="account-container">
          <div className="account-sidebar">
            <ul className="account-nav">
              <li className="skeleton-line short" />
              <li className="skeleton-line medium" />
              <li className="skeleton-line short" />
            </ul>
          </div>

          <div className="account-content">
            <div className="skeleton-panel">
              <div className="skeleton-section">
                <div className="skeleton-title" />
                <div className="skeleton-field" />
                <div className="skeleton-field" />
                <div className="skeleton-field" />
                <div className="skeleton-button" />
              </div>
              <div className="skeleton-section small">
                <div className="skeleton-title" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSkeleton;
