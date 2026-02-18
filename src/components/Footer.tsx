import { useState } from "react";

export const Footer = () => {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!re.test(email)) {
            setMsg("Veuillez saisir une adresse email valide.");
            return;
        }
        // Ici vous pouvez appeler votre API pour ajouter l'email à la newsletter
        setMsg("Merci ! Vous êtes inscrit(e) à la newsletter.");
        setEmail("");
        setTimeout(() => setMsg(""), 4000);
    };

    const year = new Date().getFullYear();

    return (
        <footer className="main-footer" aria-label="Pied de page AfriCart">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-newsletter">
                        <div className="logo" style={{ marginBottom: "var(--space-xl)" }}>
                            <div className="logo-text">Afri<span style={{ color: "white" }}>Cart</span></div>
                        </div>
                        <p style={{ color: "var(--neutral-400)", marginBottom: "var(--space-lg)" }}>
                            Souscrire à la newsletter
                        </p>

                        <form className="newsletter-form" onSubmit={handleSubscribe} aria-label="Formulaire newsletter">
                            <label htmlFor="footer-email" className="visually-hidden">Email</label>
                            <input
                                id="footer-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="Votre email"
                                aria-label="Votre email"
                                style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)", color: "white" }}
                            />
                            <button type="submit" className="btn btn-primary" aria-label="S'abonner">
                                <i className="fas fa-paper-plane" />
                            </button>
                        </form>
                        {msg && <p className="small-note" role="status">{msg}</p>}

                        <div className="contact-info" style={{ marginTop: "var(--space-md)" }}>
                            <p><i className="fas fa-map-marker-alt" /> Abidjan, Côte d'Ivoire</p>
                            <p><i className="fas fa-phone" /> +225 01 23 45 67</p>
                            <p><i className="fas fa-envelope" /> support@africart.io</p>
                        </div>

                        <div className="social-links" aria-hidden={false}>
                            <a href="#" className="social-link" aria-label="Facebook">
                                <i className="fab fa-facebook-f" />
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <i className="fab fa-twitter" />
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <i className="fab fa-instagram" />
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <i className="fab fa-linkedin-in" />
                            </a>
                        </div>
                    </div>

                    {/* <div>
                        <h3>Boutique</h3>
                        <br />
                        <ul className="footer-links">
                            <li><a href="/products"><i className="fas fa-chevron-right" /> Produits</a></li>
                            <li><a href="/account"><i className="fas fa-chevron-right" /> Mon compte</a></li>
                        </ul>
                    </div> */}
                </div>

                <div className="footer-bottom">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <p>© {year} AfriCart. Tous droits réservés. | Développé par Diomande Droh Martial</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};