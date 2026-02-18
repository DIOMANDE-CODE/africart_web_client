export const Preloader = () => {
    return (
        <div className="app-loader" id="appLoader">
            <div className="loader-logo">
                <div className="loader-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="24" cy="24" r="22" stroke="#1E7F43" strokeWidth="4" opacity="0.15" />
                        <circle cx="24" cy="24" r="18" stroke="#F28C28" strokeWidth="4" strokeDasharray="90 90" strokeDashoffset="0">
                            <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1.2s" repeatCount="indefinite" />
                        </circle>
                        <text x="50%" y="54%" textAnchor="middle" fill="#1E7F43" fontSize="18" fontWeight="bold" dy=".3em">A</text>
                    </svg>
                </div>
                <div className="loader-text">Afri<span>Cart</span></div>
            </div>
        </div>
    )
}