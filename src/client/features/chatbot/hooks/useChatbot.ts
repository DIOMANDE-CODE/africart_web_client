import { useEffect, useRef, useState } from "react";
import { getChatHistory, sendChatMessage } from "../../../services/chatbotService";
import type { GeminiHistoryItem } from "../../../services/chatbotService";
import { useAuth } from "../../../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageUI = {
  id: string;
  sender: "bot" | "user";
  text: string;
  data?: unknown;
};


// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useChatbot
 *
 * Encapsulates all chatbot state management and API communication.
 * The component (ChatWidget) stays as a pure presentation layer.
 */
export function useChatbot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<MessageUI[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const messagesRef             = useRef<HTMLDivElement | null>(null);

  const { user, loadingSession } = useAuth();

  // API endpoint changes depending on auth status
  const isAuth = !!user;

  // ── Load persistent history when the panel opens (authenticated users only) ──
  useEffect(() => {
    if (!user || !open) return;

    const loadHistory = async () => {
      try {
        const response = await getChatHistory(isAuth);
        if (!response.data.history) return;

        const historyMessages: MessageUI[] = response.data.history.map((h: unknown, i: number) => {
          const hh = h as Record<string, unknown>;
          const role = hh.role === 'user' ? 'user' : 'bot';
          const parts = Array.isArray(hh.parts) ? hh.parts as unknown[] : [];
          const firstText = parts[0] && typeof parts[0] === 'object' ? (parts[0] as Record<string, unknown>)['text'] as string | undefined : undefined;
          return {
            id: `h-${i}`,
            sender: role,
            text: firstText ?? "",
            data: hh.data ?? undefined,
          } as MessageUI;
        });

        // Attach top-level `data` to the last bot message (backend structure)
        if (response.data.data) {
          for (let j = historyMessages.length - 1; j >= 0; j--) {
            if (historyMessages[j].sender === "bot") {
              historyMessages[j].data = response.data.data;
              break;
            }
          }
        }

        setMessages(historyMessages);
      } catch (error) {
        console.error("[useChatbot] Failed to load history:", error);
      }
    };

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, open]);

  // ── Auto-scroll to latest message ──────────────────────────────────────────
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  // ── Send a message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: MessageUI = {
      sender: "user",
      text,
      id: `u-${Date.now()}`,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const historyForBackend: GeminiHistoryItem[] = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const response = await sendChatMessage(isAuth, text, historyForBackend);

      if (response.status !== 200) return;

      // Backend can return either a full `history` array or a single `reply`
      if (response.data.history && Array.isArray(response.data.history)) {
        const historyMessages: MessageUI[] = response.data.history.map((h: unknown, i: number) => {
          const hh = h as Record<string, unknown>;
          const role = hh.role === 'user' ? 'user' : 'bot';
          const parts = Array.isArray(hh.parts) ? hh.parts as unknown[] : [];
          const firstText = parts[0] && typeof parts[0] === 'object' ? (parts[0] as Record<string, unknown>)['text'] as string | undefined : undefined;
          return {
            id: `h-${i}-${Date.now()}`,
            sender: role,
            text: firstText ?? "",
            data: hh.data ?? undefined,
          } as MessageUI;
        });

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
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: "bot",
            text: response.data.reply || response.data.error || "Réponse reçue.",
            data: response.data.data ?? undefined,
          },
        ]);
      }
    } catch (error) {
      console.error("[useChatbot] Send error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          sender: "bot",
          text: "Désolé, l'assistant est temporairement indisponible.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
