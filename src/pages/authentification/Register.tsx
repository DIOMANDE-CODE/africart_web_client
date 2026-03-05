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
  const [numTel, setNumTel] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Live password criteria
  const isLengthValid = password.length >= 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const isPasswordValidLive = isLengthValid && hasUpper && hasLower && hasSymbol && hasDigit;

  // Live form validity (client-side)
  const isEmailValid = validateEmail(email);
  const isPhoneValid = validationNumeroCI(numTel);
  const isConfirmMatch = password === confirmPassword && password.length > 0;

  // Enable register when all client-side criteria are satisfied
  const isRegisterEnabled =
    nom.trim() !== "" &&
    isEmailValid &&
    isPhoneValid &&
    isPasswordValidLive &&
    isConfirmMatch &&
    !loading;


  const Inscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nom.trim() === "" || email.trim() === "" || password.trim() === "" || confirmPassword.trim() === "" || numTel.trim() === "") {
      setAlert({ message: "Veuillez remplir tous les champs.", type: "error" });
      return;
    }

    const cleanedNumTel = numTel.replace(/\s/g, '');

    if (!validationNumeroCI(cleanedNumTel)) {
      setAlert({ message: "Le numero saisi doit correspondre au format ivoirien.", type: "error" });
      return;
    }

    if (!validateEmail(email)) {
      setAlert({ message: "Veuillez entrer une adresse e-mail valide.", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ message: "Les mots de passe ne correspondent pas.", type: "error" });
      return;
    }

    if (!isPasswordValidLive) {
      setAlert({ message: "Le mot de passe ne respecte pas les critères.", type: "error" });
      return;
    }

    setLoading(true);
    setAlert(null);
    try {
      const response = await api.post("/utilisateurs/create/", {
        "nom_utilisateur": nom,
        "email_utilisateur": email,
        "password": password,
        "numero_telephone_utilisateur": cleanedNumTel,
        "role": "client"
      });
      if (response.status === 201) {
        setAlert({ message: "Inscription terminée! Veuillez-vous cpnnecter", type: "success" });
        setnom("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setNumTel("");
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;

        if (status === 400) {
          setAlert({ message: "Erreur de saisie.", type: "error" });
        } else if (status === 500) {
          setAlert({ message: "Erreur serveur. Veuillez réessayer plus tard.", type: "error" });
        } else if (status === 401) {
          setAlert({ message: "Identifiants invalides.", type: "error" });
        } else if (status === 404) {
          setAlert({ message: "Compte inexistant", type: "error" })
        }
        else if (status === 409) {
          setAlert({ message: "Compte existe déjà", type: "error" })
        }

        else {
          setAlert({ message: error.message || "Erreur survenue.", type: "error" });
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="register-page-bg">
      <div className="register-split register-animate-fadein">
        <div className="register-form-container register-animate-slideup">
          <div className="register-form-content">
            <div className="page-header">
              <div className="logo-text">
                Afri<span>Cart</span>
              </div>
              <strong><p className="page-subtitle">Créez votre compte AfriCart pour faire votre marché</p></strong>
            </div>
            <br />
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
              />

              <label htmlFor="tel" className="login-label">Numéro de Téléphone</label>
              <input
                id="tel"
                type="text"
                className="login-input"
                placeholder="ex: 07XXXXXXXX"
                value={numTel}
                onChange={e => setNumTel(e.target.value)}
                required
                aria-invalid={numTel.length > 0 && !isPhoneValid}
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
                aria-invalid={email.length > 0 && !isEmailValid}
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
                  aria-invalid={password.length > 0 && !isPasswordValidLive}
                />
                <button
                  type="button"
                  className="login-show-password"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
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
                aria-invalid={confirmPassword.length > 0 && !isConfirmMatch}
              />

              <div id="password-criteria" className="password-criteria">
                <p className="criteria-title">Le mot de passe doit contenir :</p>
                <ul>
                  <li className={isLengthValid ? "valid" : "invalid"}>Au moins 6 caractères</li>
                  <li className={hasUpper ? "valid" : "invalid"}>Une lettre majuscule</li>
                  <li className={hasLower ? "valid" : "invalid"}>Une lettre minuscule</li>
                  <li className={hasDigit ? "valid" : "invalid"}>Au moins un chiffre</li>
                  <li className={hasSymbol ? "valid" : "invalid"}>Au moins un symbole</li>
                </ul>
              </div>

              <button
                className="btn btn-primary login-btn"
                type="submit"
                disabled={loading || !isRegisterEnabled}
                aria-disabled={loading || !isRegisterEnabled}
                style={{ opacity: (loading || !isRegisterEnabled) ? 0.6 : 1, cursor: (loading || !isRegisterEnabled) ? 'not-allowed' : 'pointer' }}
              >
                {loading ? <span className="loader-btn"></span> : "S'inscrire"}
              </button>

              <div className="login-links">
                <a href="/login" className="login-link">Déjà un compte ? Se connecter</a>
              </div>
            </form>

            {alert && (
              <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
            )}
          </div> {/* Fin register-form-content */}
        </div> {/* Fin register-form-container */}
      </div> {/* Fin register-split */}
    </div> /* Fin register-page-bg */
  );
};