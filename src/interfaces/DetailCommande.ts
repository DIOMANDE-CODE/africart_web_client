interface Produit {
    thumbnail:string;
    nom_produit:string;
}

interface DetailCommande {
    produit : Produit;
    quantite: string;
    sous_total: string;
    prix_unitaire: string;
}

interface Client {
    nom_client: string;
    numero_telephone_client: string;
}

export interface RecuCommande {
    client: Client;
    identifiant_commande: string;
    code_livraison: string;
    date_commande: string;
    etat_commande: string;
    lieu_livraison: string;
    total_ht: string;
    total_ttc: string;
    details_commandes?: DetailCommande[];
    frais_livraison_appliques: string;
}