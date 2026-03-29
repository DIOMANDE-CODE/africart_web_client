export function isNewArrival(dateString: string): boolean {
  if (!dateString) return false;
  
  const now = new Date();
  const dateCreation = new Date(dateString);

  if (isNaN(dateCreation.getTime())) return false;

  // Calcul de la différence en millisecondes
  const diffMs = now.getTime() - dateCreation.getTime();
  
  // Conversion en jours (1 jour = 86 400 000 ms)
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  // Vérifie si le produit a été créé entre aujourd'hui et il y a exactement 48 heures
  return diffDays >= 0 && diffDays <= 2;
}