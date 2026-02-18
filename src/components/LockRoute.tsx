import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RouteProps {
  children: React.ReactNode;
}

// Route protégée : accessible seulement si connecté
export const PrivateRoute = ({ children }: RouteProps) => {
  const { user, loadingSession } = useAuth();
  if (loadingSession) {
    return 
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Route publique : accessible seulement si NON connecté
export const PublicRoute = ({ children }: RouteProps) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};
