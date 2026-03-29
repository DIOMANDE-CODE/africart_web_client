export interface User {
    identifiant_utilisateur: string;
    email_utilisateur: string;
    nom_utilisateur: string;
    numero_telephone_utilisateur: string | null;
    photo_profil_utilisateur: string;
    thumbnail: string;
    role: string;
}