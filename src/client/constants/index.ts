/**
 * Application-level constants.
 * Add new constants here; never scatter magic strings across components.
 */

/** Base URL for product/category images served by the backend. */
export const IMAGE_URL = import.meta.env.VITE_API_IMAGE_URL as string;

/** Custom DOM event dispatched when the cart must be cleared (e.g. after logout). */
export const CLEAR_CART_EVENT = 'africart:clear_cart' as const;

/** Key used to persist the cart in localStorage. */
export const CART_STORAGE_KEY = 'africart_cart' as const;

/** Key used to persist the pending order reference in sessionStorage. */
export const ORDER_SESSION_KEY = 'identifiant_commande' as const;
