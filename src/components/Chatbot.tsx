import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

type MessageUI = { sender: "bot" | "user"; text: string; id: string; data?: any };

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

  const renderData = (data: any) => {
    if (!data) return null;

    if (data.produits && Array.isArray(data.produits)) {
      return (
        <div className="chatbot-products">
          {data.produits.slice(0, 6).map((p: any, idx: number) => (
            <div key={idx} className="chatbot-product">
              <div className="prod-name">{p.nom_produit}</div>
              <div className="prod-meta">{p.prix ? `${p.prix} FCFA` : p.prix_unitaire ? `${p.prix_unitaire} FCFA` : ''} — {p.quantite_disponible ?? ''} en stock</div>
              {p.description && <div className="prod-desc">{p.description}</div>}
            </div>
          ))}
        </div>
      );
    }

    if (data.commande) {
      const c = data.commande;
      return (
        <div className="chatbot-commande">
          <div><strong>Référence :</strong> {c.identifiant}</div>
          <div><strong>État :</strong> {c.etat}</div>
          <div><strong>Total :</strong> {c.total_ttc ? `${c.total_ttc} FCFA` : 'N/A'}</div>
          <div><strong>Date :</strong> {c.date ?? 'N/A'}</div>
        </div>
      );
    }

    if (data.commandes && Array.isArray(data.commandes)) {
      return (
        <div className="chatbot-commandes">
          {data.commandes.map((c: any, i: number) => (
            <div key={i} className="chatbot-commande-item">
              <div>{c.identifiant} — {c.etat} — {c.total_ttc ? `${c.total_ttc} FCFA` : 'N/A'}</div>
            </div>
          ))}
        </div>
      );
    }

    if (data.zones && Array.isArray(data.zones)) {
      return (
        <div className="chatbot-zones">
          {data.zones.map((z: any, i: number) => (
            <div key={i} className="chatbot-zone">
              <div><strong>{z.nom_zone}</strong></div>
              <div>Frais de livraison: {z.frais_livraison}</div>
            </div>
          ))}
        </div>
      );
    }

    if (data.nom_zone && data.frais_livraison !== undefined) {
      return (
        <div className="chatbot-frais">
          <div>Zone: {data.nom_zone}</div>
          <div>Frais de livraison: {data.frais_livraison} FCFA</div>
        </div>
      );
    }

    if (data.profil) {
      const p = data.profil;
      return (
        <div className="chatbot-profil">
          <div><strong>{p.nom_utilisateur}</strong> — {p.role}</div>
          <div>{p.email_utilisateur}</div>
          <div>{p.numero_telephone}</div>
        </div>
      );
    }

    return <pre className="chatbot-json">{JSON.stringify(data, null, 2)}</pre>;
  };

  return (
    <>
      <div className={`chatbot-toggle${open ? " open" : ""}`} onClick={() => setOpen(!open)}>
        <i className={`fas ${open ? "fa-times" : "fa-robot"}`} />
      </div>

      <div className={`chatbot-container${open ? " active" : ""}`}>
        <div className="chatbot-header">
          <div className="chatbot-title">Service client AfriCart - 0711399567</div>
          <button className="close-chatbot" onClick={() => setOpen(false)}>×</button>
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
              <div className="message message-bot">
                {user ? `Salut ${user.nom_utilisateur} !` : "Bienvenue sur AfriCart !"} Comment puis-je vous aider ?
              </div>


              {messages.map((m) => (
                <div key={m.id} className={`message message-${m.sender}`}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>

                  {m.data && (
                    <div className="chatbot-data">
                      {renderData(m.data)}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="message message-bot typing">
                  <span className="dot" /><span className="dot" /><span className="dot" />
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
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-paper-plane"}`} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;