import { useState } from "react";
import "../styles/Footer.css";

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

                    <div className="footer-column">
                        <h3 className="footer-title">Boutique</h3>
                        <ul className="footer-links">
                            <li><a href="/products"><i className="fas fa-chevron-right" /> Tous les produits</a></li>
                            <li><a href="/products?tri_par=nouveautes"><i className="fas fa-chevron-right" /> Nouveautés</a></li>
                            <li><a href="/products?categorie=Fruits%20et%20l%C3%A9gumes"><i className="fas fa-chevron-right" /> Fruits & légumes</a></li>
                            <li><a href="/products?categorie=C%C3%A9r%C3%A9ales"><i className="fas fa-chevron-right" /> Céréales</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3 className="footer-title">Aide</h3>
                        <ul className="footer-links">
                            <li><a href="#faq"><i className="fas fa-chevron-right" /> FAQ</a></li>
                            <li><a href="#"><i className="fas fa-chevron-right" /> Suivi de commande</a></li>
                            <li><a href="#"><i className="fas fa-chevron-right" /> Livraison & zones desservies</a></li>
                            <li><a href="#"><i className="fas fa-chevron-right" /> Retours & remboursements</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h3 className="footer-title">AfriCart</h3>
                        <ul className="footer-links">
                            <li><a href="#about"><i className="fas fa-chevron-right" /> À propos</a></li>
                            <li><a href="#"><i className="fas fa-chevron-right" /> Devenir partenaire</a></li>
                            <li><a href="#"><i className="fas fa-chevron-right" /> Conditions d'utilisation</a></li>
                            <li><a href="#"><i className="fas fa-chevron-right" /> Politique de confidentialité</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {year} AfriCart. Tous droits réservés. | Développé par Diomande Droh Martial</p>
                    <div className="footer-payments">
                        <span>Paiements sécurisés :</span>
                        <i className="fab fa-cc-visa" aria-hidden="true" />
                        <i className="fab fa-cc-mastercard" aria-hidden="true" />
                        <i className="fas fa-mobile-alt" aria-hidden="true" />
                    </div>
                </div>
            </div>
        </footer>
    );
};