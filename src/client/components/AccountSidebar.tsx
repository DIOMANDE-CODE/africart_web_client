import { Link } from "react-router-dom"
import "../styles/AccountPage.css";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export const AccountSidebar = ({ }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <>
            <div className="account-sidebar">
                <ul className="account-nav">

                    <li>
                        <Link to="/account" className={location.pathname === "/account" ? "active" : ""}>Mon profil</Link>
                    </li>
                    <li>
                        <Link to="/commandes" className={location.pathname === "/commandes" ? "active" : ""}>Mes commandes</Link>
                    </li>
                    <li>
                        <button className="btn mt-4" style={{ backgroundColor: "#d32f2f", color: "white" }} onClick={handleLogout} disabled={isLoggingOut}>
                            {isLoggingOut ? <span className="small-loader-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} aria-hidden="true" /> : 'Se deconnecter'}
                        </button>
                    </li>
                </ul>
            </div>
        </>
    )
}