export const Loader = () => {
    return (
        <div className="app-loader">
            <div className="loader-spinner"></div>
        </div>
    )
}

export const SmallLoader = () => (
    <div className="small-loader" aria-label="Chargement...">
        <div className="small-loader-spinner"></div>
        <span className="small-loader-text">Chargement...</span>
    </div>
);