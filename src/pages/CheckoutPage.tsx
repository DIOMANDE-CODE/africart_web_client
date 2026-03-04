import "../styles/CheckoutPage.css";
import { useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Alert } from "../components/Alert";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import MapDelivery from "../components/MapDelivery";
import L from 'leaflet';
import CheckoutSkeleton from "../skeletons/CheckoutSkeleton";

interface Zone {
    identifiant_zone: string;
    nom_zone: string;
    frais_livraison: number;
    latitude: number;
    longitude: number;
    rayon_metres: number;
}

export const CheckoutPage = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // États du formulaire
    const [ville, setVille] = useState("");
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Correction du type NodeJS.Timeout
    const geocodeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [zones, setZones] = useState<Zone[]>([]);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [coords, setCoords] = useState<[number, number] | null>(null);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingZones, setIsLoadingZones] = useState(true);

    // 1. Charger les zones au montage
    useEffect(() => {
        const fetchZones = async () => {
            setIsLoadingZones(true);
            try {
                const response = await api.get("/commandes/zone_livraison/list/");
                console.log(response.data.data);
                setZones(response.data.data)
            } catch (error) {
                console.error("Erreur zones:", error);
            } finally {
                setIsLoadingZones(false);
            }
        };
        fetchZones();
    }, []);

    // 2. Géocodage des suggestions (quand l'utilisateur tape)
    useEffect(() => {
        if (!ville.trim() || isFetchingAddress) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);

        geocodeTimeout.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ville)}&countrycodes=ci`
                );
                const data = await response.json();
                if (data && data.length > 0) {
                    setSuggestions(data);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Erreur géocodage:", err);
            }
        }, 800); // Augmenté à 800ms pour économiser l'API Nominatim

        return () => { if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current); };
    }, [ville, isFetchingAddress]);

    // 3. Mise à jour automatique de la zone sélectionnée lorsque le lieu de livraison change
    useEffect(() => {
        if (ville.trim() && zones.length > 0) {
            const matchingZone = zones.find(zone => ville.toLowerCase().includes(zone.nom_zone.toLowerCase()));
            if (matchingZone) {
                setSelectedZone(matchingZone);
                setCoords([matchingZone.latitude, matchingZone.longitude]);
            }
        }
    }, [ville, zones]);

    // 4. Mise à jour automatique du lieu de livraison lorsque la zone est sélectionnée
    useEffect(() => {
        if (selectedZone) {
            setVille(selectedZone.nom_zone);
            setCoords([selectedZone.latitude, selectedZone.longitude]);
        }
    }, [selectedZone]);

    // 5. Calculs financiers
    const sousTotal = useMemo(() => {
        return cart.reduce((sum, item) => {
            const prix = parseFloat(item.prix_unitaire_produit.toString().replace(/\s/g, ''));
            return sum + (isNaN(prix) ? 0 : prix * (item.quantite_produit || 1));
        }, 0);
    }, [cart]);

    const fraisLivraison = selectedZone ? Number(selectedZone.frais_livraison) : 2000;
    const totalTTC = sousTotal + fraisLivraison;

    // 6. Fonction pour récupérer l'adresse textuelle depuis les coordonnées
    const reverseGeocode = async (lat: number, lon: number) => {
        setIsFetchingAddress(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            if (data && data.display_name) {
                setVille(data.display_name);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetchingAddress(false);
            setShowSuggestions(false);
        }
    };

    const validezCommande = async () => {
        if (!ville.trim()) {
            setAlert({ message: "Veuillez préciser le lieu de livraison", type: "error" });
            return;
        }

        if (!coords) {
            setAlert({ message: "Veuillez sélectionner un point de livraison sur la carte.", type: "error" });
            return;
        }

        setLoading(true);
        const commande = {
            client: {
                nom_client: user?.nom_utilisateur,
                numero_telephone_client: user?.numero_telephone_utilisateur
            },
            items: cart,
            total_ht: sousTotal,
            lieu_livraison: ville,
            identifiant_zone: selectedZone?.identifiant_zone || null,
            latitude_client: coords?.[0] || null,
            longitude_client: coords?.[1] || null
        };

        try {
            const response = await api.post("/commandes/creer/", commande, { withCredentials: true });
            if (response.status === 200 || response.status === 201) {
                console.log(response.data);

                clearCart();
                sessionStorage.setItem("identifiant_commande", response.data.reference_commande);
                localStorage.removeItem("africart_cart");
                navigate("/confirmation");
            }
        } catch (error) {
            setAlert({ message: "Erreur lors de la validation.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // Afficher le skeleton pendant la vérification de session ou le chargement des zones
    if (isLoadingZones) {
        return <CheckoutSkeleton />;
    }

    return (
        <section className="page active" id="checkout-page">
            <div className="container checkout-page">
                <h1 className="section-title">Finaliser votre commande</h1>
                <div className="checkout-container">
                    <div className="checkout-form">
                        <h3 className="mb-3">Informations de livraison</h3>
                        <div className="form-section">
                            {/* ... (Nom et Email restent inchangés) ... */}

                            <div className="form-group mb-4">
                                <label className="mb-2">Localisez votre position de livraison</label>
                                        <MapDelivery
                                            zones={zones}
                                            onLocationSelected={(zone, latlng) => {
                                                setSelectedZone(zone);
                                                setCoords(latlng);
                                                // On ne déclenche le reverse geocoding que si le clic vient de la carte
                                                if (!isFetchingAddress) reverseGeocode(latlng[0], latlng[1]);
                                            }}
                                        />
                                        <div style={{ marginTop: 8 }}>
                                            {!coords && (
                                                <small className="text-error">Sélectionnez votre position sur la carte pour continuer.</small>
                                            )}
                                            {coords && !selectedZone && (
                                                <small className="text-warning">Aucune zone de livraison spécifique trouvée pour ce point. Des frais par défaut peuvent s'appliquer.</small>
                                            )}
                                        </div>
                                {selectedZone && (
                                    <small className="text-success">
                                        Zone détectée : <strong>{selectedZone.nom_zone}</strong> (Frais : {selectedZone.frais_livraison} FCFA)
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Lieu de livraison</label>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex: Riviera Palmeraie, Rue Ministre"
                                        onChange={e => {
                                            setVille(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        value={ville}
                                        required
                                        autoComplete="address-line1"
                                        style={{ flex: 1 }}
                                        onFocus={() => ville && suggestions.length > 0 && setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    />

                                    {showSuggestions && suggestions.length > 0 && (
                                        <ul style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            zIndex: 10,
                                            background: '#fff',
                                            border: '1px solid #ddd',
                                            borderTop: 'none',
                                            maxHeight: 200,
                                            overflowY: 'auto',
                                            margin: 0,
                                            padding: 0,
                                            listStyle: 'none',
                                        }}>
                                                    {suggestions.map((s, idx) => (
                                                        <li
                                                            key={s.place_id || idx}
                                                            style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                                            onMouseDown={() => {
                                                                const lat = parseFloat(s.lat);
                                                                const lon = parseFloat(s.lon);
                                                                setVille(s.display_name);
                                                                setCoords([lat, lon]);
                                                                // Déterminer la zone correspondante côté parent
                                                                const matched = zones.find(z => {
                                                                    const dist = L.latLng(lat, lon).distanceTo(L.latLng(z.latitude, z.longitude));
                                                                    return dist <= z.rayon_metres;
                                                                }) || null;
                                                                setSelectedZone(matched);
                                                                setShowSuggestions(false);
                                                            }}
                                                        >
                                                            {s.display_name}
                                                        </li>
                                                    ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section Paiement à la livraison */}
                        <div className="payment-methods mt-4">
                            <label className="payment-option selected">
                                <div className="payment-icon"><i className="fas fa-truck" /></div>
                                <div>
                                    <div className="option-title">Paiement à la livraison</div>
                                    <div className="option-desc">Payez {totalTTC.toLocaleString()} FCFA à la réception.</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="order-summary">
                        <h3 className="mb-3">Récapitulatif</h3>
                        <div id="orderSummaryItems">
                            {cart.map((article) => (
                                <div className="summary-item" key={article.identifiant_produit}>
                                    <span>{article.nom_produit}</span>
                                    <span>{article.prix_unitaire_produit} x {article.quantite_produit}</span>
                                </div>
                            ))}
                            <div className="summary-item mt-2 pt-2 border-top">
                                <span>Frais de livraison</span>
                                <span>{fraisLivraison.toLocaleString()} FCFA</span>
                            </div>
                        </div>
                        <div className="summary-item summary-total">
                            <span>Total à payer</span>
                            <span id="orderTotal">{totalTTC.toLocaleString()} FCFA</span>
                        </div>
                        <button
                            className="btn btn-primary btn-large mt-4"
                            onClick={validezCommande}
                            disabled={loading || cart.length === 0 || !coords}
                        >
                            {loading ? "Traitement..." : "Passer la commande"}
                        </button>
                    </div>
                </div>
            </div>
            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </section>
    );
};