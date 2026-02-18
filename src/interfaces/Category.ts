interface Product {
    identifiant_produit: string;
    nom_produit: string;
    prix_unitaire_produit: string;
    quantite_produit_disponible: number;
    seuil_alerte_produit: number;
    thumbnail: string;
    image_produit: string;
}
export interface Category {
    identifiant_categorie: string;
    nom_categorie: string;
    produits: Product[];
}