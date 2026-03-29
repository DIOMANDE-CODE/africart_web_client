import React from "react";
import "../styles/skeletons/ReceiptSkeleton.css";

const ReceiptSkeleton: React.FC = () => {
    return (
        <section className="receipt-page">
            <div className="receipt-container">
                {/* Toolbar */}
                <div className="receipt-skeleton-toolbar">
                    <div className="skeleton-btn-back"></div>
                    <div className="skeleton-toolbar-actions">
                        <div className="skeleton-btn"></div>
                        <div className="skeleton-btn"></div>
                    </div>
                </div>

                {/* Receipt Card */}
                <div className="receipt-skeleton-card">
                    {/* Header */}
                    <div className="receipt-skeleton-header">
                        <div className="skeleton-logo-section">
                            <div className="skeleton-logo-icon"></div>
                            <div className="skeleton-logo-text">
                                <div className="skeleton-logo-title"></div>
                                <div className="skeleton-logo-subtitle"></div>
                            </div>
                        </div>
                        <div className="skeleton-title-section">
                            <div className="skeleton-receipt-title"></div>
                            <div className="skeleton-status-badge"></div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="skeleton-divider"></div>

                    {/* Info Grid */}
                    <div className="receipt-skeleton-info-grid">
                        <div className="skeleton-info-block">
                            <div className="skeleton-info-label"></div>
                            <div className="skeleton-info-value"></div>
                        </div>
                        <div className="skeleton-info-block">
                            <div className="skeleton-info-label"></div>
                            <div className="skeleton-info-value"></div>
                        </div>
                        <div className="skeleton-info-block">
                            <div className="skeleton-info-label"></div>
                            <div className="skeleton-info-value"></div>
                        </div>
                        <div className="skeleton-info-block">
                            <div className="skeleton-info-label"></div>
                            <div className="skeleton-info-value"></div>
                        </div>
                    </div>

                    {/* Customer Section */}
                    <div className="receipt-skeleton-section">
                        <div className="skeleton-section-title"></div>
                        <div className="skeleton-customer-grid">
                            <div className="skeleton-customer-detail">
                                <div className="skeleton-detail-label"></div>
                                <div className="skeleton-detail-value"></div>
                            </div>
                            <div className="skeleton-customer-detail">
                                <div className="skeleton-detail-label"></div>
                                <div className="skeleton-detail-value"></div>
                            </div>
                            <div className="skeleton-customer-detail">
                                <div className="skeleton-detail-label"></div>
                                <div className="skeleton-detail-value"></div>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="receipt-skeleton-section">
                        <div className="skeleton-section-title"></div>
                        <div className="skeleton-table">
                            <div className="skeleton-table-header">
                                <div className="skeleton-th"></div>
                                <div className="skeleton-th"></div>
                                <div className="skeleton-th"></div>
                                <div className="skeleton-th"></div>
                            </div>
                            <div className="skeleton-table-body">
                                <div className="skeleton-table-row">
                                    <div className="skeleton-product-cell">
                                        <div className="skeleton-product-img"></div>
                                        <div className="skeleton-product-name"></div>
                                    </div>
                                    <div className="skeleton-td"></div>
                                    <div className="skeleton-td"></div>
                                    <div className="skeleton-td"></div>
                                </div>
                                <div className="skeleton-table-row">
                                    <div className="skeleton-product-cell">
                                        <div className="skeleton-product-img"></div>
                                        <div className="skeleton-product-name"></div>
                                    </div>
                                    <div className="skeleton-td"></div>
                                    <div className="skeleton-td"></div>
                                    <div className="skeleton-td"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="receipt-skeleton-summary">
                        <div className="skeleton-summary-row"></div>
                        <div className="skeleton-summary-row"></div>
                        <div className="skeleton-summary-divider"></div>
                        <div className="skeleton-summary-total"></div>
                    </div>

                    {/* Footer */}
                    <div className="receipt-skeleton-footer">
                        <div className="skeleton-footer-note"></div>
                        <div className="skeleton-footer-contacts">
                            <div className="skeleton-contact"></div>
                            <div className="skeleton-contact"></div>
                            <div className="skeleton-contact"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReceiptSkeleton;
