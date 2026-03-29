import api from './api';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

/**
 * Commandes — appels API
 */

export const getDeliveryZones = () =>
  api.get('/commandes/zone_livraison/list/');

export interface CreateOrderPayload {
  client: {
    nom_client: string | null | undefined;
    numero_telephone_client: string | null | undefined;
  };
  items: any[];
  total_ht: number;
  lieu_livraison: string;
  identifiant_zone: string | null;
  latitude_client: number | null;
  longitude_client: number | null;
}

export const createOrder = (payload: CreateOrderPayload) =>
  api.post('/commandes/creer/', payload, { withCredentials: true });


// Recupérer les Detail de la commande
export const getOrderDetail = (reference: string) => {
  return useQuery({
    queryKey: ['orderDetail', reference],
    queryFn: async () => {
      const { data } = await api.get(`/commandes/detail/${reference}/`, { withCredentials: true });
      return data;
    },
    enabled: !!reference, // Ne pas lancer la requête si la référence est vide
    placeholderData: (previousData) => previousData
  });
}

// Service pour récupérer l'historique des commandes d'un utilisateur
export const getUsersOrders = (email: string) => {
  return useInfiniteQuery({
    // La clé dépend de l'email : si l'utilisateur change, le cache se vide
    queryKey: ['userOrders', email],

    queryFn: async ({ pageParam = 0 }) => {
      const requestParams = {
        offset: pageParam,
        limit: 10, // On peut rester sur 10 pour les commandes (plus léger)
      };

      // Utilisation de withCredentials pour valider la session Django/JWT
      const { data } = await api.get(`/commandes/list/${email}/`, {
        params: requestParams,
        withCredentials: true
      });

      return data;
    },

    // Requis par TanStack Query v5
    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      // Extraction de l'URL 'next' fournie par Django Rest Framework
      const nextUrl = lastPage?.data?.next || lastPage?.next;

      if (!nextUrl) return undefined;

      try {
        const url = new URL(nextUrl);
        const offset = url.searchParams.get('offset');
        return offset ? parseInt(offset, 10) : undefined;
      } catch (e) {
        return undefined;
      }
    },

    // On garde les commandes en cache 5 min pour éviter les rechargements inutiles
    staleTime: 1000 * 60 * 5,
  });
};