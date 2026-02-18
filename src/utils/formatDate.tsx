export function formatDate(isoDate:string) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
         " à " +
         date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

