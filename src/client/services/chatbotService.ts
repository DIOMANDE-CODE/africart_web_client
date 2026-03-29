import api from './api';

/**
 * Chatbot IA — appels API
 * Les deux endpoints (anonyme / connecté) sont résolus ici
 * afin que les composants n'aient pas à connaître les URLs.
 */

const ANON_URL = '/service-client/chatbot/';
const AUTH_URL = '/service-client/chatbot_user_connected/';

export type GeminiHistoryItem = {
  role: 'user' | 'model';
  parts: [{ text: string }];
};

export const getChatHistory = (isAuthenticated: boolean) =>
  api.get(isAuthenticated ? AUTH_URL : ANON_URL);

export const sendChatMessage = (
  isAuthenticated: boolean,
  message: string,
  history: GeminiHistoryItem[]
) =>
  api.post(isAuthenticated ? AUTH_URL : ANON_URL, { message, history });
