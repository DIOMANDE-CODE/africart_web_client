import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import type { User } from "../interfaces/User";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  fetchUserInfo: () => Promise<void>;
  loadingSession: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true); // Initialisé à true pour le check initial
  const navigate = useNavigate();

  // 1. Récupération des infos utilisateur
  const fetchUserInfo = async () => {
    try {
      const response = await api.get("/utilisateurs/info_utilisateur/");
      if (response.status === 200) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  // 2. Vérification de session via cookie HttpOnly
  const checkSession = async () => {
    setLoadingSession(true);
    try {
      const response = await api.get("/authentification/check_session/", {
        withCredentials: true,
      });
      if (response.data.authenticated) {
        await fetchUserInfo();
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoadingSession(false);
    }
  };

  // 3. Fonction Logout
  const logout = async () => {
    try {
      const response = await api.post("/authentification/logout/", {}, { withCredentials: true });
      if (response.status === 200) {
        // Nettoyage local quoi qu'il arrive
        setUser(null);
        localStorage.removeItem("africart_cart");
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("identifiant_commande");
        sessionStorage.clear();

        // Dispatch d'événements personnalisés
        window.dispatchEvent(new CustomEvent('africart:clear_cart'));

        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    } finally {

    }
  };

  // Vérifie la session au montage du composant
  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, checkSession, fetchUserInfo, loadingSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return context;
}