export const Categories = () => {
    return (
        <>
            {/* Catégories */}
            <div className="categories-section" id="categories">
                <div className="container">
                    <div className="section-header">
                        <span className="section-subtitle">Parcourir</span>
                        <h2 className="section-title">Catégories populaires</h2>
                        <p className="section-description">
                            Découvrez nos principales catégories de produits sélectionnés avec
                            soin
                        </p>
                    </div>
                    <div className="categories-grid">
                        <div className="category-card">
                            <div
                                className="category-icon"
                                style={{
                                    background: "var(--primary-50)",
                                    color: "var(--primary-500)"
                                }}
                            >
                                <i className="fas fa-laptop" />
                            </div>
                            <h3 className="category-name">Électronique</h3>
                            <p className="category-count">1,250 produits</p>
                        </div>
                        <div className="category-card">
                            <div
                                className="category-icon"
                                style={{
                                    background: "var(--secondary-50)",
                                    color: "var(--secondary-500)"
                                }}
                            >
                                <i className="fas fa-tshirt" />
                            </div>
                            <h3 className="category-name">Mode &amp; Accessoires</h3>
                            <p className="category-count">890 produits</p>
                        </div>
                        <div className="category-card">
                            <div
                                className="category-icon"
                                style={{ background: "#f3e5f5", color: "#9b59b6" }}
                            >
                                <i className="fas fa-home" />
                            </div>
                            <h3 className="category-name">Maison &amp; Jardin</h3>
                            <p className="category-count">750 produits</p>
                        </div>
                        <div className="category-card">
                            <div
                                className="category-icon"
                                style={{ background: "#ffebee", color: "#e74c3c" }}
                            >
                                <i className="fas fa-spa" />
                            </div>
                            <h3 className="category-name">Beauté &amp; Santé</h3>
                            <p className="category-count">620 produits</p>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};
