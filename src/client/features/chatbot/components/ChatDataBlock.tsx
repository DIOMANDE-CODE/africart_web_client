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
export function ChatDataBlock({ data }: { data: any }) {
  if (!data) return null;

  // Produits (recherche / détails / catégorie / recommandations)
  const produits: any[] | null = data.produits ?? data.recommandations ?? null;
  if (produits?.length) {
    return (
      <div className="chat-data-block">
        {data.categorie && (
          <div className="chat-section-label">Catégorie : {data.categorie}</div>
        )}
        <div className="chat-cards-scroll">
          {produits.map((p: any, i: number) => (
            <ProduitCard key={i} p={p} />
          ))}
        </div>
      </div>
    );
  }

  // Promotions
  if (data.promotions?.length) {
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">🎉 Promotions en cours</div>
        <div className="chat-cards-scroll">
          {data.promotions.map((p: any, i: number) => (
            <PromoCard key={i} p={p} />
          ))}
        </div>
      </div>
    );
  }

  // Liste de commandes
  if (data.commandes) {
    if (data.commandes.length === 0) {
      return (
        <div className="chat-data-block chat-empty">Aucune commande récente.</div>
      );
    }
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">Vos commandes récentes</div>
        {data.commandes.map((c: any, i: number) => (
          <CommandeRow key={i} c={c} />
        ))}
      </div>
    );
  }

  // Détails d'une commande
  if (data.commande_details) {
    return (
      <div className="chat-data-block">
        <CommandeDetails d={data.commande_details} />
      </div>
    );
  }
  if (data.commande) {
    return (
      <div className="chat-data-block">
        <CommandeRow c={data.commande} />
      </div>
    );
  }

  // Profil utilisateur
  if (data.profil) {
    return (
      <div className="chat-data-block">
        <ProfilCard p={data.profil} />
      </div>
    );
  }

  // Catégories disponibles
  if (data.categories_disponibles?.length) {
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">Catégories disponibles</div>
        <div className="chat-tags">
          {data.categories_disponibles.map((c: string, i: number) => (
            <span key={i} className="chat-tag">
              {c}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Zones de livraison
  if (data.zones?.length) {
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">📍 Zones de livraison</div>
        {data.zones.map((z: any, i: number) => (
          <div key={i} className="chat-zone-row">
            <span>{z.nom_zone}</span>
            {z.frais_livraison != null && (
              <span className="chat-zone-frais">
                {Number(z.frais_livraison).toLocaleString("fr-FR")} FCFA
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
