import {
  ProduitCard,
  PromoCard,
  CommandeRow,
  CommandeDetails,
  ProfilCard,
} from "./cards";

/**
 * Renders structured backend data returned alongside a bot reply.
 * Returns null when `data` is absent or unrecognised.
 */
export function ChatDataBlock({ data }: { data?: unknown }) {
  if (!data) return null;
  const d = data as Record<string, unknown>;

  // Produits (recherche / détails / catégorie / recommandations)
  const produits = (d.produits ?? d.recommandations) as Array<Record<string, unknown>> | undefined;
  if (produits && produits.length > 0) {
    return (
      <div className="chat-data-block">
        {d.categorie != null && (
          <div className="chat-section-label">Catégorie : {String(d.categorie)}</div>
        )}
        <div className="chat-cards-scroll">
          {produits.map((p, i) => (
            <ProduitCard key={i} p={p as Record<string, unknown>} />
          ))}
        </div>
      </div>
    );
  }

  // Promotions
  const promotions = d.promotions as Array<Record<string, unknown>> | undefined;
  if (promotions && promotions.length > 0) {
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">🎉 Promotions en cours</div>
        <div className="chat-cards-scroll">
          {promotions.map((p, i) => (
            <PromoCard key={i} p={p as Record<string, unknown>} />
          ))}
        </div>
      </div>
    );
  }

  // Liste de commandes
  const commandes = d.commandes as Array<Record<string, unknown>> | undefined;
  if (commandes) {
    if (commandes.length === 0) {
      return (
        <div className="chat-data-block chat-empty">Aucune commande récente.</div>
      );
    }
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">Vos commandes récentes</div>
        {commandes.map((c, i) => (
          <CommandeRow key={i} c={c as Record<string, unknown>} />
        ))}
      </div>
    );
  }

  // Détails d'une commande
  if (d.commande_details) {
    return (
      <div className="chat-data-block">
        <CommandeDetails d={d.commande_details as Record<string, unknown>} />
      </div>
    );
  }
  if (d.commande) {
    return (
      <div className="chat-data-block">
        <CommandeRow c={d.commande as Record<string, unknown>} />
      </div>
    );
  }

  // Profil utilisateur
  if (d.profil) {
    return (
      <div className="chat-data-block">
        <ProfilCard p={d.profil as Record<string, unknown>} />
      </div>
    );
  }

  // Catégories disponibles
  const cats = d.categories_disponibles as string[] | undefined;
  if (cats && cats.length > 0) {
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">Catégories disponibles</div>
        <div className="chat-tags">
          {cats.map((c, i) => (
            <span key={i} className="chat-tag">
              {String(c)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Zones de livraison
  const zones = d.zones as Array<Record<string, unknown>> | undefined;
  if (zones && zones.length > 0) {
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">📍 Zones de livraison</div>
        {zones.map((z, i) => {
          const zn = z as Record<string, unknown>;
          const nom = String(zn.nom_zone ?? '');
          const frais = zn.frais_livraison != null ? Number(zn.frais_livraison) : null;
          return (
            <div key={i} className="chat-zone-row">
              <span>{nom}</span>
              {frais != null && (
                <span className="chat-zone-frais">
                  {frais.toLocaleString("fr-FR")} FCFA
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
