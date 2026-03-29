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

export function ProduitCard({ p }: { p: any }) {
  const prix    = p.prix_promo ?? p.prix ?? p.prix_unitaire;
  const enStock = (p.quantite_disponible ?? 1) > 0;

  return (
    <div className="chat-card">
      {p.thumbnail && (
        <img src={p.thumbnail} alt={p.nom_produit} className="chat-card-img" />
      )}
      <div className="chat-card-body">
        <div className="chat-card-name">{p.nom_produit}</div>
        {p.categorie && <div className="chat-card-cat">{p.categorie}</div>}
        <div className="chat-card-row">
          <span className="chat-card-price">
            {Number(prix).toLocaleString("fr-FR")} FCFA
          </span>
          {p.prix_promo && p.prix_unitaire && p.prix_promo < p.prix_unitaire && (
            <span className="chat-card-old-price">
              {Number(p.prix_unitaire).toLocaleString("fr-FR")} FCFA
            </span>
          )}
        </div>
        <span className={`chat-dispo ${enStock ? "en-stock" : "rupture"}`}>
          {enStock ? "✓ En stock" : "✗ Rupture"}
        </span>
        {p.description && (
          <p className="chat-card-desc">{p.description}</p>
        )}
      </div>
    </div>
  );
}

// ─── PromoCard ───────────────────────────────────────────────────────────────

export function PromoCard({ p }: { p: any }) {
  return (
    <div className="chat-card chat-card--promo">
      {p.thumbnail && (
        <img src={p.thumbnail} alt={p.nom_produit} className="chat-card-img" />
      )}
      <div className="chat-card-body">
        {p.pourcentage_promo && (
          <span className="chat-promo-badge">
            -{Math.round(p.pourcentage_promo)}%
          </span>
        )}
        <div className="chat-card-name">{p.nom_produit}</div>
        {p.categorie && <div className="chat-card-cat">{p.categorie}</div>}
        <div className="chat-card-row">
          {p.prix_promo && (
            <span className="chat-card-price">
              {Number(p.prix_promo).toLocaleString("fr-FR")} FCFA
            </span>
          )}
          <span className="chat-card-old-price">
            {Number(p.prix_normal).toLocaleString("fr-FR")} FCFA
          </span>
        </div>
        {p.economie_fcfa && (
          <div className="chat-economie">
            Économie : {Number(p.economie_fcfa).toLocaleString("fr-FR")} FCFA
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CommandeRow ─────────────────────────────────────────────────────────────

export function CommandeRow({ c }: { c: any }) {
  return (
    <div className="chat-commande-row">
      <div className="chat-commande-ref">{c.identifiant}</div>
      <div className="chat-commande-meta">
        <EtatBadge etat={c.etat} />
        {c.date && (
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

export function CommandeDetails({ d }: { d: any }) {
  return (
    <div className="chat-commande-details">
      <div className="chat-commande-details-header">
        <span className="chat-card-name">{d.identifiant}</span>
        <EtatBadge etat={d.etat} />
      </div>
      {d.date && (
        <div className="chat-commande-date">
          Date : {String(d.date).split("T")[0]}
        </div>
      )}
      {d.articles?.length > 0 && (
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
            {d.articles.map((a: any, i: number) => (
              <tr key={i}>
                <td>{a.produit}</td>
                <td>{a.quantite}</td>
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

export function ProfilCard({ p }: { p: any }) {
  return (
    <div className="chat-profil">
      {p.photo_profil && (
        <img
          src={p.photo_profil}
          alt="avatar"
          className="chat-profil-avatar"
        />
      )}
      <div className="chat-profil-info-block">
        <div className="chat-card-name">{p.nom_utilisateur}</div>
        {p.email_utilisateur && (
          <div className="chat-profil-info">{p.email_utilisateur}</div>
        )}
        {p.numero_telephone && (
          <div className="chat-profil-info">{p.numero_telephone}</div>
        )}
        {p.role && <div className="chat-profil-role">{p.role}</div>}
      </div>
    </div>
  );
}
