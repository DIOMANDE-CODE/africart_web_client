
import React, { useState } from "react";
import "../../styles/Register.css";
import { Alert } from "../../components/Alert";
import { validateEmail } from "../../utils/emailChecking";
import api from "../../services/api";
import { validationNumeroCI } from "../../utils/validerNumero";

export const Register = () => {
  const [nom, setnom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [numTel,setNumTel] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const Inscription = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifier que tous les champs sont remplis
    if (nom.trim() === "" || email.trim() === "" || password.trim() === "" || confirmPassword.trim() === "" || numTel.trim() === "") {
      setAlert({ message: "Veuillez remplir tous les champs.", type: "error" });
      return;
    }

    // Valider le numero de téléphone saisi
    if (!validationNumeroCI(numTel)){
      setAlert({ message: "Le numero saisi doit correspondre au format ivoirien.", type: "error" });
      return;
    }

    // Valider le format de l'email
    if (!validateEmail(email)) {
      setAlert({ message: "Veuillez entrer une adresse e-mail valide.", type: "error" });
      return;
    }

    // Validation mot de passe
    if (password !== confirmPassword) {
      setAlert({ message: "Les mots de passe ne correspondent pas.", type: "error" });
      return;
    }

    setLoading(true);
    setAlert(null);
    try {
      const response = await api.post("/utilisateurs/create/", {
        "nom_utilisateur": nom,
        "email_utilisateur": email,
        "password": password,
        "numero_telephone_utilisateur":numTel,
        "role": "client"
      });
      if (response.status === 201) {
        setAlert({ message: "Inscription terminée! connectez-vous pour passer votre commande.", type: "success" });
        setnom("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setNumTel("")
      }
    }
    catch (error: any) {
      if (error.response) {
        const status = error.response.status;

        if (status === 400) {
          setAlert({ message: "Erreur de saisie.", type: "error" });
        } else if (status === 500) {
          setAlert({ message: "Erreur survenue au serveur.", type: "error" });
        } else if (status === 401) {
          setAlert({ message: "Accès non autorisé.", type: "error" });
        } else {
          setAlert({ message: "Erreur inconnue.", type: "error" });
        }
      }
    }
    setLoading(false);
  };



  return (
    <div className="register-page-bg">
      <div className="register-form-container register-animate-fadein">
        <div className="register-form-content register-animate-slideup">
          <div className="login-visual">
            <img src="/src/assets/Logo_AfriCart_sans_fond.png" alt="Logo AfriCart" className="login-logo" />
          </div>

          <form className="login-form" onSubmit={Inscription} autoComplete="on">
            <label htmlFor="nom" className="login-label">Nom et Prénoms</label>
            <input
              id="nom"
              type="text"
              className="login-input"
              placeholder="Votre nom et prénoms"
              value={nom}
              onChange={e => setnom(e.target.value)}
              required
              autoFocus
            />

            <label htmlFor="nom" className="login-label">Numéro de Téléphone</label>
            <input
              id="nom"
              type="text"
              className="login-input"
              placeholder="ex: 07XXXXXXXX"
              value={numTel}
              onChange={e => setNumTel(e.target.value)}
              required
            />


            <label htmlFor="email" className="login-label">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="ex: nom@africart.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password" className="login-label">Mot de passe</label>
            <div className="login-password-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Votre mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-show-password"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                <i className={`fas fa-eye${showPassword ? "-slash" : ""}`}></i>
              </button>
            </div>

            <label htmlFor="confirmPassword" className="login-label">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />

            <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
              {loading ? <span className="loader-btn"></span> : "S'inscrire"}
            </button>

            <div className="login-links">
              <a href="/login" className="login-link">Déjà un compte ? Se connecter</a>
            </div>
          </form>

          {alert && (
            <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
          )}
        </div>
      </div>
    </div>
  );
};
