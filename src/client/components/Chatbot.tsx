import React from "react";
import ReactMarkdown from "react-markdown";
import { useChatbot } from "../features/chatbot/hooks/useChatbot";
import { ChatDataBlock } from "../features/chatbot/components/ChatDataBlock";

/**
 * Pure-UI chatbot widget.
 * All business logic and state are managed by the useChatbot hook.
 * Structured-data rendering is delegated to ChatDataBlock.
 */
const Chatbot: React.FC = () => {
  const {
    open,
    setOpen,
    messages,
    input,
    setInput,
    loading,
    loadingSession,
    user,
    messagesRef,
    handleSend,
  } = useChatbot();

  return (
    <>
      {/* Toggle button */}
      <div
        className={`chatbot-toggle${open ? " open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <i className={`fas ${open ? "fa-times" : "fa-robot"}`} />
      </div>

      {/* Chat panel */}
      <div className={`chatbot-container${open ? " active" : ""}`}>
        <div className="chatbot-header">
          <div className="chatbot-title">
            <i className="fas fa-robot chatbot-title-icon" />
            Assistant AfriCart IA
          </div>
          <button
            className="close-chatbot"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="chatbot-messages" ref={messagesRef}>
          {/* Auth-check skeleton */}
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
              {/* Welcome message */}
              <div className="msg-row msg-row--bot">
                <div className="msg-avatar msg-avatar--bot">
                  <i className="fas fa-robot" />
                </div>
                <div className="msg-content">
                  <div className="msg-bubble msg-bubble--bot">
                    {user
                      ? `Salut ${user.nom_utilisateur} ! `
                      : "Bienvenue sur AfriCart ! "}
                    Comment puis-je vous aider ?
                  </div>
                </div>
              </div>

              {/* Conversation history */}
              {messages.map((m) =>
                m.sender === "bot" ? (
                  <div key={m.id} className="msg-row msg-row--bot">
                    <div className="msg-avatar msg-avatar--bot">
                      <i className="fas fa-robot" />
                    </div>
                    <div className="msg-content">
                      <div className="msg-bubble msg-bubble--bot">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                      {m.data != null && <ChatDataBlock data={m.data} />}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="msg-row msg-row--user">
                    <div className="msg-content msg-content--user">
                      <div className="msg-bubble msg-bubble--user">{m.text}</div>
                    </div>
                    <div className="msg-avatar msg-avatar--user">
                      <i className="fas fa-user" />
                    </div>
                  </div>
                )
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="msg-row msg-row--bot">
                  <div className="msg-avatar msg-avatar--bot">
                    <i className="fas fa-robot" />
                  </div>
                  <div className="msg-content">
                    <div className="msg-bubble msg-bubble--bot typing">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input area */}
        <div className="chatbot-input">
          <input
            placeholder="Posez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            aria-label="Envoyer"
            disabled={loading || !input.trim()}
          >
            <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-paper-plane"}`} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
