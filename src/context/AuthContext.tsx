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
  const navigate = useNavigate();
  const [loadingSession, setLoadingSession] = useState(true);

  // Vérifie la session au montage
  useEffect(() => {
    ( async () => {
        await checkSession();
        setLoadingSession(false);
    })()
  }, []);

  // Déconnexion
  const logout = async () => {
    try {
      await api.get("/authentification/logout/");
    } catch (error: any) {
      // Log server error but still perform client-side cleanup and redirect
      console.error("Erreur lors de la déconnexion:", error.message || "Erreur survenue");
    } finally {
      setUser(null);
      localStorage.removeItem("africart_cart");
      sessionStorage.removeItem("identifiant_commande");
      try {
        navigate("/", { replace: true });
      } catch (e) {
        // navigation may fail in non-router contexts; ignore safely
      }
    }
  };

  // Vérification de session via cookie HttpOnly
  const checkSession = async () => {
    try {
      const response = await api.get("/authentification/check_session/", {
        withCredentials: true
      });
      if (response.data.authenticated) {
        await fetchUserInfo(); // Récupère les infos utilisateur si authentifié
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  // Récupération des infos utilisateur
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

  return (
    <AuthContext.Provider value={{ user, setUser, logout, checkSession, fetchUserInfo, loadingSession }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return context;
}
