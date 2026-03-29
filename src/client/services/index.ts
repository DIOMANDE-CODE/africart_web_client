/**
 * Barrel — ré-exporte tous les services en un seul point d'entrée.
 * Usage recommandé :
 *   import { login, getProducts, createOrder } from '../services';
 */

export * from './authService';
export * from './utilisateurService';
export * from './produitService';
export * from './recommandationService';
export * from './commandeService';
export * from './chatbotService';

// Ré-export de l'instance axios pour les cas exceptionnels
export { default as api } from './api';
