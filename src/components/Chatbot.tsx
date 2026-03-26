import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

type MessageUI = { sender: "bot" | "user"; text: string; id: string; data?: any };

// ─── Couleurs d'état de commande ────────────────────────────────────────────
const ETAT_COLOR: Record<string, string> = {
  en_attente:  "#f59e0b",
  confirmee:   "#3b82f6",
  en_cours:    "#8b5cf6",
  livree:      "#16a34a",
  annulee:     "#ef4444",
};

function EtatBadge({ etat }: { etat: string }) {
  const color = ETAT_COLOR[etat?.toLowerCase()] ?? "#64748b";
  return <span className="chat-badge" style={{ background: color }}>{etat}</span>;
}

function ProduitCard({ p }: { p: any }) {
  const prix = p.prix_promo ?? p.prix ?? p.prix_unitaire;
  const enStock = (p.quantite_disponible ?? 1) > 0;
  return (
    <div className="chat-card">
      {p.thumbnail && <img src={p.thumbnail} alt={p.nom_produit} className="chat-card-img" />}
      <div className="chat-card-body">
        <div className="chat-card-name">{p.nom_produit}</div>
        {p.categorie && <div className="chat-card-cat">{p.categorie}</div>}
        <div className="chat-card-row">
          <span className="chat-card-price">{Number(prix).toLocaleString("fr-FR")} FCFA</span>
          {p.prix_promo && p.prix_unitaire && p.prix_promo < p.prix_unitaire && (
            <span className="chat-card-old-price">{Number(p.prix_unitaire).toLocaleString("fr-FR")} FCFA</span>
          )}
        </div>
        <span className={`chat-dispo ${enStock ? "en-stock" : "rupture"}`}>
          {enStock ? "✓ En stock" : "✗ Rupture"}
        </span>
        {p.description && <p className="chat-card-desc">{p.description}</p>}
      </div>
    </div>
  );
}

function PromoCard({ p }: { p: any }) {
  return (
    <div className="chat-card chat-card--promo">
      {p.thumbnail && <img src={p.thumbnail} alt={p.nom_produit} className="chat-card-img" />}
      <div className="chat-card-body">
        {p.pourcentage_promo && (
          <span className="chat-promo-badge">-{Math.round(p.pourcentage_promo)}%</span>
        )}
        <div className="chat-card-name">{p.nom_produit}</div>
        {p.categorie && <div className="chat-card-cat">{p.categorie}</div>}
        <div className="chat-card-row">
          {p.prix_promo && <span className="chat-card-price">{Number(p.prix_promo).toLocaleString("fr-FR")} FCFA</span>}
          <span className="chat-card-old-price">{Number(p.prix_normal).toLocaleString("fr-FR")} FCFA</span>
        </div>
        {p.economie_fcfa && (
          <div className="chat-economie">Économie : {Number(p.economie_fcfa).toLocaleString("fr-FR")} FCFA</div>
        )}
      </div>
    </div>
  );
}

function CommandeRow({ c }: { c: any }) {
  return (
    <div className="chat-commande-row">
      <div className="chat-commande-ref">{c.identifiant}</div>
      <div className="chat-commande-meta">
        <EtatBadge etat={c.etat} />
        {c.date && <span className="chat-commande-date">{String(c.date).split("T")[0]}</span>}
      </div>
      {c.total_ttc != null && (
        <div className="chat-commande-total">{Number(c.total_ttc).toLocaleString("fr-FR")} FCFA</div>
      )}
    </div>
  );
}

function CommandeDetails({ d }: { d: any }) {
  return (
    <div className="chat-commande-details">
      <div className="chat-commande-details-header">
        <span className="chat-card-name">{d.identifiant}</span>
        <EtatBadge etat={d.etat} />
      </div>
      {d.date && <div className="chat-commande-date">Date : {String(d.date).split("T")[0]}</div>}
      {d.articles?.length > 0 && (
        <table className="chat-table">
          <thead>
            <tr><th>Produit</th><th>Qté</th><th>P.U. (FCFA)</th><th>S/T (FCFA)</th></tr>
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

function ProfilCard({ p }: { p: any }) {
  return (
    <div className="chat-profil">
      {p.photo_profil && <img src={p.photo_profil} alt="avatar" className="chat-profil-avatar" />}
      <div className="chat-profil-info-block">
        <div className="chat-card-name">{p.nom_utilisateur}</div>
        {p.email_utilisateur && <div className="chat-profil-info">{p.email_utilisateur}</div>}
        {p.numero_telephone  && <div className="chat-profil-info">{p.numero_telephone}</div>}
        {p.role && <div className="chat-profil-role">{p.role}</div>}
      </div>
    </div>
  );
}

function ChatDataBlock({ data }: { data: any }) {
  if (!data) return null;

  // Produits (recherche / détails / catégorie / recommandations)
  const produits: any[] | null = data.produits ?? data.recommandations ?? null;
  if (produits?.length) {
    return (
      <div className="chat-data-block">
        {data.categorie && <div className="chat-section-label">Catégorie : {data.categorie}</div>}
        <div className="chat-cards-scroll">
          {produits.map((p: any, i: number) => <ProduitCard key={i} p={p} />)}
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
          {data.promotions.map((p: any, i: number) => <PromoCard key={i} p={p} />)}
        </div>
      </div>
    );
  }

  // Liste de commandes
  if (data.commandes) {
    if (data.commandes.length === 0)
      return <div className="chat-data-block chat-empty">Aucune commande récente.</div>;
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">Vos commandes récentes</div>
        {data.commandes.map((c: any, i: number) => <CommandeRow key={i} c={c} />)}
      </div>
    );
  }

  // Détails d'une commande
  if (data.commande_details)
    return <div className="chat-data-block"><CommandeDetails d={data.commande_details} /></div>;
  if (data.commande)
    return <div className="chat-data-block"><CommandeRow c={data.commande} /></div>;

  // Profil utilisateur
  if (data.profil)
    return <div className="chat-data-block"><ProfilCard p={data.profil} /></div>;

  // Catégories disponibles
  if (data.categories_disponibles?.length) {
    return (
      <div className="chat-data-block">
        <div className="chat-section-label">Catégories disponibles</div>
        <div className="chat-tags">
          {data.categories_disponibles.map((c: string, i: number) => (
            <span key={i} className="chat-tag">{c}</span>
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
              <span className="chat-zone-frais">{Number(z.frais_livraison).toLocaleString("fr-FR")} FCFA</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return null;
}

type GeminiHistoryItem = {
  role: "user" | "model";
  parts: [{ text: string }];
};

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<MessageUI[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // On récupère l'utilisateur et l'état de vérification de session
  const { user, loadingSession } = useAuth();

  // Déterminer l'URL en fonction de la connexion
  const chatbotUrl = user ? "/service-client/chatbot_user_connected/" : "/service-client/chatbot/";

  // 1. Charger l'historique au démarrage (uniquement pour les connectés)
  useEffect(() => {
    const loadHistory = async () => {
      if (user && open) {
        try {
          const response = await api.get(chatbotUrl);
          if (response.data.history) {
            const historyMessages: MessageUI[] = response.data.history.map((h: any, i: number) => ({
              id: `h-${i}`,
              sender: h.role === "user" ? "user" : "bot",
              text: h.parts?.[0]?.text ?? "",
              data: h.data ?? undefined,
            }));

            // If server returned a top-level `data`, attach it to the last model message
            if (response.data.data) {
              // find last model message index
              for (let j = historyMessages.length - 1; j >= 0; j--) {
                if (historyMessages[j].sender === "bot") {
                  historyMessages[j].data = response.data.data;
                  break;
                }
              }
            }

            setMessages(historyMessages);
          }
        } catch (error) {
          console.error("Erreur lors du chargement de l'historique persisté", error);
        }
      }
    };
    loadHistory();
  }, [user, open, chatbotUrl]);

  // Scroll automatique
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: MessageUI = { sender: "user", text, id: `u-${Date.now()}` };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Préparation de l'historique pour Gemini
      const historyForBackend: GeminiHistoryItem[] = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      // Appel de l'API (l'URL change selon si 'user' existe)
      const response = await api.post(chatbotUrl, {
        message: text,
        history: historyForBackend
      });

      if (response.status === 200) {
        // If backend returns a saved `history`, render it to stay in sync
        if (response.data.history && Array.isArray(response.data.history)) {
          const historyMessages: MessageUI[] = response.data.history.map((h: any, i: number) => ({
            id: `h-${i}-${Date.now()}`,
            sender: h.role === "user" ? "user" : "bot",
            text: h.parts?.[0]?.text ?? "",
            data: h.data ?? undefined,
          }));

          // If server returned top-level data, attach it to the last model message in history
          if (response.data.data) {
            for (let j = historyMessages.length - 1; j >= 0; j--) {
              if (historyMessages[j].sender === "bot") {
                historyMessages[j].data = response.data.data;
                break;
              }
            }
          }

          setMessages(historyMessages);
        } else {
          const botMsg: MessageUI = {
            id: `b-${Date.now()}`,
            sender: "bot",
            text: response.data.reply || response.data.error || "Réponse reçue.",
            data: response.data.data ?? undefined,
          };
          setMessages((prev) => [...prev, botMsg]);
        }
      }
    } catch (error) {
      console.error("Erreur Chatbot:", error);
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, sender: "bot", text: "Désolé, l'assistant est temporairement indisponible." }
      ]);
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <div className={`chatbot-toggle${open ? " open" : ""}`} onClick={() => setOpen(!open)}>
        <i className={`fas ${open ? "fa-times" : "fa-robot"}`} />
      </div>

      <div className={`chatbot-container${open ? " active" : ""}`}>
        <div className="chatbot-header">
          <div className="chatbot-title">
            <i className="fas fa-robot chatbot-title-icon" />
            Assistant AfriCart IA
          </div>
          <button className="close-chatbot" onClick={() => setOpen(false)} aria-label="Fermer">
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="chatbot-messages" ref={messagesRef}>
          {/* Si on est en train de vérifier la session, afficher un squelette
              pour indiquer que l'app vérifie si l'utilisateur est connecté */}
          {loadingSession ? (
            <div className="chatbot-skeleton">
              <div className="skeleton-row">
                <div className="skeleton-avatar" />
                <div className="skeleton-lines">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                </div>
              </div>
              <div className="skeleton-row">
                <div className="skeleton-line" />
              </div>
            </div>
          ) : (
            <>
              {/* Message de bienvenue */}
              <div className="msg-row msg-row--bot">
                <div className="msg-avatar msg-avatar--bot"><i className="fas fa-robot" /></div>
                <div className="msg-content">
                  <div className="msg-bubble msg-bubble--bot">
                    {user ? `Salut ${user.nom_utilisateur} ! ` : "Bienvenue sur AfriCart ! "}
                    Comment puis-je vous aider ?
                  </div>
                </div>
              </div>

              {messages.map((m) =>
                m.sender === "bot" ? (
                  <div key={m.id} className="msg-row msg-row--bot">
                    <div className="msg-avatar msg-avatar--bot"><i className="fas fa-robot" /></div>
                    <div className="msg-content">
                      <div className="msg-bubble msg-bubble--bot">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                      {m.data && <ChatDataBlock data={m.data} />}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="msg-row msg-row--user">
                    <div className="msg-content msg-content--user">
                      <div className="msg-bubble msg-bubble--user">{m.text}</div>
                    </div>
                    <div className="msg-avatar msg-avatar--user"><i className="fas fa-user" /></div>
                  </div>
                )
              )}

              {loading && (
                <div className="msg-row msg-row--bot">
                  <div className="msg-avatar msg-avatar--bot"><i className="fas fa-robot" /></div>
                  <div className="msg-content">
                    <div className="msg-bubble msg-bubble--bot typing">
                      <span className="dot" /><span className="dot" /><span className="dot" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="chatbot-input">
          <input
            placeholder="Posez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button onClick={handleSend} aria-label="Envoyer" disabled={loading || !input.trim()}>
            <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-paper-plane"}`} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;