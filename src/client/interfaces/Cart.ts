export interface Cart {
    identifiant_produit: string;
    nom_produit: string;
    prix_unitaire_produit: number;
    quantite_produit_disponible: number;
    quantite_total_produit?: number;
}