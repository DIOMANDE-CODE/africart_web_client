/**
 * Barrel export of all domain types.
 * Always import from "@/types" (or "../../types") rather than individual interface files.
 *
 * Old paths (src/interfaces/*) re-export from here to preserve backward compatibility.
 */

export type { Cart }          from '../interfaces/Cart';
export type { Category }      from '../interfaces/Category';
export type { Client }        from '../interfaces/Client';
export type { Commande }      from '../interfaces/Commande';
export type { RecuCommande }  from '../interfaces/DetailCommande';
export type { Product }       from '../interfaces/Product';
export type { User }          from '../interfaces/User';
