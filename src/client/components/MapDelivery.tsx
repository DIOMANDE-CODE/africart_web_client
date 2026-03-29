import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import { Alert } from './Alert';

// Fix pour les icônes Leaflet par défaut
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Interface calquée sur ton modèle Django
interface Zone {
    identifiant_zone: string; // UUID du backend
    nom_zone: string;
    frais_livraison: number;
    latitude: number;
    longitude: number;
    rayon_metres: number;
}

const MapAutoCenter = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(coords, 13);
    }, [coords, map]);
    return null;
};

export default function MapDelivery({ zones, onLocationSelected }: { 
    zones: Zone[], 
    onLocationSelected: (zone: Zone | null, coords: [number, number]) => void 
}) {
    // Par défaut null, on attend la géoloc
    const [pos, setPos] = useState<[number, number] | null>(null);
    const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Fonction pour trouver la zone (Yakro ou Intérieur par défaut)
    const findAppropriateZone = (lat: number, lng: number): Zone | null => {
        // 1. On cherche d'abord si le point est dans un rayon précis (ex: Yakro)
        const specificZone = zones.find(z => {
            const distance = L.latLng(lat, lng).distanceTo(L.latLng(z.latitude, z.longitude));
            return distance <= z.rayon_metres;
        });

        if (specificZone) return specificZone;

        // 2. Si on est en dehors des cercles, on cherche la zone "Intérieur" dans la liste
        return zones.find(z => z.nom_zone.toLowerCase().includes("intérieur")) || null;
    };

    // Détecter la zone Yamoussoukro si fournie par le backend
    const yamoZone = zones.find(z => z.nom_zone && z.nom_zone.toLowerCase().includes('yamoussoukro')) || null;
    const yamoCenter: [number, number] = yamoZone ? [yamoZone.latitude, yamoZone.longitude] : [6.8276, -5.2767];
    const yamoRadius = yamoZone ? yamoZone.rayon_metres : 30000; // fallback 30km

    // Calcul des bounds (approx) pour limiter le déplacement sur la carte
    const computeBounds = (center: [number, number], radiusMeters: number) => {
        const lat = center[0];
        const dLat = radiusMeters / 111000; // ~deg latitude
        const dLon = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));
        const southWest: [number, number] = [lat - dLat, center[1] - dLon];
        const northEast: [number, number] = [lat + dLat, center[1] + dLon];
        return [southWest, northEast];
    };
    const yamoBounds = computeBounds(yamoCenter, yamoRadius);

    useEffect(() => {
        if (pos === null && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
                    // n'accepter la géoloc que si elle est dans Yamoussoukro
                    const distanceToYamo = L.latLng(newCoords[0], newCoords[1]).distanceTo(L.latLng(yamoCenter[0], yamoCenter[1]));
                    if (distanceToYamo <= yamoRadius) {
                        setPos(newCoords);
                        const zone = findAppropriateZone(newCoords[0], newCoords[1]);
                        onLocationSelected(zone, newCoords);
                    } else {
                        // fallback vers Yamoussoukro et informer l'utilisateur
                        setPos(yamoCenter);
                        const zone = findAppropriateZone(yamoCenter[0], yamoCenter[1]);
                        onLocationSelected(zone, yamoCenter);
                        // petit avertissement console (UI légère évitée ici)
                        console.warn('Votre position est en dehors de la zone autorisée (Yamoussoukro). La localisation a été centrée sur Yamoussoukro.');
                    }
                },
                () => {
                    // Si refusé, fallback Yamoussoukro
                    setPos(yamoCenter);
                },
                { enableHighAccuracy: true }
            );
        }
    }, [zones, pos]);

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                // Vérifier si le clic est dans Yamoussoukro
                const distanceToYamo = L.latLng(lat, lng).distanceTo(L.latLng(yamoCenter[0], yamoCenter[1]));
                if (distanceToYamo <= yamoRadius) {
                    setPos([lat, lng]);
                    const zone = findAppropriateZone(lat, lng);
                    onLocationSelected(zone, [lat, lng]);
                } else {
                    // avertir et ignorer la sélection — utiliser le composant Alert
                    setAlert({ message: "La zone doit être à Yamoussoukro.", type: 'error' });
                }
            },
        });
        if (!pos) return null;
        return <Marker position={pos} />;
    };

    return (
        <div style={{ 
            height: '350px', 
            width: '100%', 
            marginBottom: '20px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '2px solid #eee' 
        }}>
            {pos && (
                <MapContainer center={pos} zoom={12} style={{ height: '100%', width: '100%' }}
                    // limiter la navigation et le pannage à Yamoussoukro
                    maxBounds={yamoBounds as any}
                    maxBoundsViscosity={0.9}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapAutoCenter coords={pos} />
                    {/* On n'affiche que les zones "physiques" (cercles de moins de 100km) */}
                    {zones.filter(z => z.rayon_metres < 100000).map(z => (
                        <Circle 
                            key={z.identifiant_zone} 
                            center={[z.latitude, z.longitude]} 
                            radius={z.rayon_metres}
                            pathOptions={{ 
                                color: '#2ecc71', 
                                fillColor: '#2ecc71', 
                                fillOpacity: 0.2,
                                weight: 1 
                            }}
                        />
                    ))}
                    {/* Cercle visible de la zone Yamoussoukro (limite d'autorisation) */}
                    <Circle center={yamoCenter} radius={yamoRadius} pathOptions={{ color: '#ff6b6b', weight: 1, dashArray: '6', fillOpacity: 0 }} />
                    <LocationMarker />
                </MapContainer>
            )}
            {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} duration={3500} />}
        </div>
    );
}