interface Category {
    identifiant_categorie: string;
    nom_categorie: string;
}

export interface Product {
    identifiant_produit: string;
    nom_produit: string;
    prix_unitaire_produit: string;
    quantite_produit_disponible: number;
    seuil_alerte_produit: number;
    image_produit: string;
    thumbnail: string;
    image_produit_2?: string;
    thumbnail_2?: string;
    image_produit_3?: string;
    thumbnail_3?: string;
    categorie_produit?: Category;
    quantite_produit?: number; // Quantité ajoutée au panier
    description_produit?:string;
    caracteristiques_produit?:string;
}