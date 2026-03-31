import React, { useState, useRef, useEffect } from "react";
import "../../styles/Login.css";
import { Alert } from "../../components/Alert";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/emailChecking";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export const Login = () => {
  const { checkSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error"; duration?: number } | null>(null);

  const emailRef = React.useRef<HTMLInputElement | null>(null);
  const passwordRef = React.useRef<HTMLInputElement | null>(null);


  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const ref = timeoutRef.current;
    return () => {
      if (ref) clearTimeout(ref);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    // Vérification des champs
    if (email.trim() === "" || password.trim() === "") {
      setAlert({ message: "Veuillez remplir tous les champs.", type: "error" });
      setLoading(false);
      return;
    }

    // Validation email
    if (!validateEmail(email)) {
      setAlert({ message: "Veuillez entrer une adresse e-mail valide.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const response = await login(email, password);

      if (Number(response.status) === 200) {
        checkSession(); // Met à jour le contexte global avec les infos utilisateur
        navigate("/");
      }
    } catch (error: unknown) {
      const errAny = error as Record<string, unknown>;
      const parsedObj = errAny?.parsed as Record<string, unknown> | undefined;
      const parsed = (typeof parsedObj?.message === 'string' ? parsedObj.message : null) || (typeof errAny?.message === 'string' ? errAny.message : null) || 'Erreur lors de la connexion.';
      const resp = errAny?.response as Record<string, unknown> | undefined;
      const status = resp?.status != null ? Number(resp.status) : null;

      if (status === 400) {
        setAlert({ message: parsed || 'Erreur de saisie.', type: 'error' });
        emailRef.current?.focus();
      } else if (status === 401) {
        setAlert({ message: parsed || 'Identifiants invalides.', type: 'error', duration: 4000 });
        passwordRef.current?.focus();
      } else if (status === 404) {
        setAlert({ message: parsed || 'Compte inexistant.', type: 'error' });
        emailRef.current?.focus();
      } else if (status === 429) {
        setAlert({ message: parsed || 'Trop de tentatives. Réessayez plus tard.', type: 'error' });
      } else if (status === 500) {
        setAlert({ message: parsed || 'Erreur serveur. Veuillez réessayer plus tard.', type: 'error' });
      } else {
        setAlert({ message: parsed, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-split-container login-animate-fadein">
        <div className="login-split-form login-animate-slideleft">
          <div className="login-visual">
            <img src="/src/client/assets/Logo_AfriCart_sans_fond.png" alt="Logo AfriCart" className="login-logo" />
          </div>

          <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
            <label htmlFor="email" className="login-label">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="ex: nom@africart.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              ref={emailRef}
              autoFocus
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
                ref={passwordRef}
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

            <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
              {loading ? <span className="loader-btn"></span> : "Se connecter"}
            </button>

            <div className="login-links">
              {/* <Link to="#" className="login-link">Mot de passe oublié ?</Link> */}
              <Link to="/register" className="login-link">Pas de compte? Créer un compte</Link>
            </div>
          </form>

          {alert && (
            <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />
          )}
        </div>

        <div className="login-split-image login-animate-slideright">
          <img
            src="https://images.unsplash.com/photo-1631021967261-c57ee4dfa9bb?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Produits vivriers"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};
