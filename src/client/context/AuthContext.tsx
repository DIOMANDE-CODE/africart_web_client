/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { checkSessionApi, logoutApi } from "../services/authService";
import { getUserInfo as fetchUserInfoApi } from "../services/utilisateurService";
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
  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await fetchUserInfoApi();
      if (response.status === 200) {
        setUser(response.data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  // 2. Vérification de session via cookie HttpOnly
  const checkSession = useCallback(async () => {
    setLoadingSession(true);
    try {
      const response = await checkSessionApi();
      if (response.data.authenticated) {
        await fetchUserInfo();
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoadingSession(false);
    }
  }, [fetchUserInfo]);

  // 3. Fonction Logout
  const logout = useCallback(async () => {
    try {
      const response = await logoutApi();
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
    } catch (err) {
      console.error("Erreur lors de la déconnexion", err);
    }
  }, [navigate]);

  // Vérifie la session au montage du composant
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Écoute des erreurs globales d'API (ex: 401 non autorisé) émises par l'instance axios
  useEffect(() => {
    const handler = () => {
      try {
        // clear local user and navigate to login
        setUser(null);
        localStorage.removeItem('auth_token');
        window.dispatchEvent(new CustomEvent('africart:clear_cart'));
        navigate('/login', { replace: true });
      } catch (err) {
        console.error('Error handling unauthorized event', err);
      }
    };
    window.addEventListener('africart:unauthorized', handler as EventListener);
    return () => window.removeEventListener('africart:unauthorized', handler as EventListener);
  }, [navigate]);

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