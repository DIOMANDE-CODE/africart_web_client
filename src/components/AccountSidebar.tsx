import { Link } from "react-router-dom"
import "../styles/AccountPage.css";
import { useLocation } from "react-router-dom";

export const AccountSidebar = ({}) => {
    const location = useLocation();
 

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
    
                </ul>
            </div>
        </>
    )
}