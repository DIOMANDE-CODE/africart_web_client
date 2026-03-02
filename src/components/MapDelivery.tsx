import { MapContainer, TileLayer, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import L from 'leaflet';

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

    useEffect(() => {
        if (pos === null && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setPos(newCoords);
                    const zone = findAppropriateZone(newCoords[0], newCoords[1]);
                    onLocationSelected(zone, newCoords);
                },
                () => {
                    // Si refusé, fallback Yamoussoukro
                    setPos([6.8276, -5.2767]);
                },
                { enableHighAccuracy: true }
            );
        }
    }, [zones, pos]);

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPos([lat, lng]);
                const zone = findAppropriateZone(lat, lng);
                onLocationSelected(zone, [lat, lng]);
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
                <MapContainer center={pos} zoom={12} style={{ height: '100%', width: '100%' }}>
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
                    <LocationMarker />
                </MapContainer>
            )}
        </div>
    );
}