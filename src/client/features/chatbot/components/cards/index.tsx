/**
 * Chatbot UI card components.
 *
 * Each card is a small, pure presentational component responsible for
 * rendering one type of structured data returned by the backend.
 * They are intentionally kept separate from business logic (useChatbot).
 */

// ─── État commande colour map ─────────────────────────────────────────────────

const ETAT_COLOR: Record<string, string> = {
  en_attente: "#f59e0b",
  confirmee:  "#3b82f6",
  en_cours:   "#8b5cf6",
  livree:     "#16a34a",
  annulee:    "#ef4444",
};

// ─── EtatBadge ───────────────────────────────────────────────────────────────

export function EtatBadge({ etat }: { etat: string }) {
  const color = ETAT_COLOR[etat?.toLowerCase()] ?? "#64748b";
  return (
    <span className="chat-badge" style={{ background: color }}>
      {etat}
    </span>
  );
}

// ─── ProduitCard ─────────────────────────────────────────────────────────────

export function ProduitCard({ p }: { p: Record<string, unknown> }) {
  const prix    = (p.prix_promo ?? p.prix ?? p.prix_unitaire) as number | string;
  const enStock = ((p.quantite_disponible as number) ?? 1) > 0;

  return (
    <div className="chat-card">
      {p.thumbnail != null && (
        <img src={String(p.thumbnail)} alt={String(p.nom_produit)} className="chat-card-img" />
      )}
      <div className="chat-card-body">
        <div className="chat-card-name">{String(p.nom_produit)}</div>
        {p.categorie != null && <div className="chat-card-cat">{String(p.categorie)}</div>}
        <div className="chat-card-row">
          <span className="chat-card-price">
            {Number(prix).toLocaleString("fr-FR")} FCFA
          </span>
          {p.prix_promo != null && p.prix_unitaire != null && Number(p.prix_promo) < Number(p.prix_unitaire) && (
            <span className="chat-card-old-price">
              {Number(p.prix_unitaire).toLocaleString("fr-FR")} FCFA
            </span>
          )}
        </div>
        <span className={`chat-dispo ${enStock ? "en-stock" : "rupture"}`}>
          {enStock ? "✓ En stock" : "✗ Rupture"}
        </span>
        {p.description != null && (
          <p className="chat-card-desc">{String(p.description)}</p>
        )}
      </div>
    </div>
  );
}

// ─── PromoCard ───────────────────────────────────────────────────────────────

export function PromoCard({ p }: { p: Record<string, unknown> }) {
  return (
    <div className="chat-card chat-card--promo">
      {p.thumbnail != null && (
        <img src={String(p.thumbnail)} alt={String(p.nom_produit)} className="chat-card-img" />
      )}
      <div className="chat-card-body">
        {p.pourcentage_promo != null && (
          <span className="chat-promo-badge">
            -{Math.round(Number(p.pourcentage_promo))}%
          </span>
        )}
        <div className="chat-card-name">{String(p.nom_produit)}</div>
        {p.categorie != null && <div className="chat-card-cat">{String(p.categorie)}</div>}
        <div className="chat-card-row">
          {p.prix_promo != null && (
            <span className="chat-card-price">
              {Number(p.prix_promo).toLocaleString("fr-FR")} FCFA
            </span>
          )}
          <span className="chat-card-old-price">
            {Number(p.prix_normal).toLocaleString("fr-FR")} FCFA
          </span>
        </div>
        {p.economie_fcfa != null && (
          <div className="chat-economie">
            Économie : {Number(p.economie_fcfa).toLocaleString("fr-FR")} FCFA
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CommandeRow ─────────────────────────────────────────────────────────────

export function CommandeRow({ c }: { c: Record<string, unknown> }) {
  return (
    <div className="chat-commande-row">
      <div className="chat-commande-ref">{String(c.identifiant)}</div>
      <div className="chat-commande-meta">
        <EtatBadge etat={String(c.etat)} />
        {c.date != null && (
          <span className="chat-commande-date">
            {String(c.date).split("T")[0]}
          </span>
        )}
      </div>
      {c.total_ttc != null && (
        <div className="chat-commande-total">
          {Number(c.total_ttc).toLocaleString("fr-FR")} FCFA
        </div>
      )}
    </div>
  );
}

// ─── CommandeDetails ─────────────────────────────────────────────────────────

export function CommandeDetails({ d }: { d: Record<string, unknown> }) {
  const articles = d.articles as Array<Record<string, unknown>> | undefined;
  return (
    <div className="chat-commande-details">
      <div className="chat-commande-details-header">
        <span className="chat-card-name">{String(d.identifiant)}</span>
        <EtatBadge etat={String(d.etat)} />
      </div>
      {d.date != null && (
        <div className="chat-commande-date">
          Date : {String(d.date).split("T")[0]}
        </div>
      )}
      {articles && articles.length > 0 && (
        <table className="chat-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Qté</th>
              <th>P.U. (FCFA)</th>
              <th>S/T (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a, i: number) => (
              <tr key={i}>
                <td>{String(a.produit)}</td>
                <td>{String(a.quantite)}</td>
                <td>{Number(a.prix_unitaire).toLocaleString("fr-FR")}</td>
                <td>{Number(a.sous_total).toLocaleString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="chat-totaux">
        {d.total_ht        != null && <div>Total HT : {Number(d.total_ht).toLocaleString("fr-FR")} FCFA</div>}
        {d.frais_livraison != null && <div>Livraison : {Number(d.frais_livraison).toLocaleString("fr-FR")} FCFA</div>}
        {d.total_ttc       != null && <div className="chat-total-ttc">Total TTC : {Number(d.total_ttc).toLocaleString("fr-FR")} FCFA</div>}
      </div>
    </div>
  );
}

// ─── ProfilCard ──────────────────────────────────────────────────────────────

export function ProfilCard({ p }: { p: Record<string, unknown> }) {
  return (
    <div className="chat-profil">
      {p.photo_profil != null && (
        <img
          src={String(p.photo_profil)}
          alt="avatar"
          className="chat-profil-avatar"
        />
      )}
      <div className="chat-profil-info-block">
        <div className="chat-card-name">{String(p.nom_utilisateur)}</div>
        {p.email_utilisateur != null && (
          <div className="chat-profil-info">{String(p.email_utilisateur)}</div>
        )}
        {p.numero_telephone != null && (
          <div className="chat-profil-info">{String(p.numero_telephone)}</div>
        )}
        {p.role != null && <div className="chat-profil-role">{String(p.role)}</div>}
      </div>
    </div>
  );
}
