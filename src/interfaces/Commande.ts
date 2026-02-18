interface Produit {
    thumbnail:string;
    nom_produit:string;
}

interface DetailCommande {
    produit : Produit;
    quantite: string;
}

export interface Commande {
    identifiant_commande: string;
    code_livraison: string;
    date_commande: string;
    etat_commande: string;
    lieu_livraison: string;
    total_ht: string;
    total_ttc: string;
    details_commandes?: DetailCommande[];
}