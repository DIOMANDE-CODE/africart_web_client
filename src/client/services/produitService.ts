import api from './api';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

/**
 * Produits — appels API
 */


// Appel des API purs
export const fetchCategories = () => api.get('/produits/list/categorie/', { withCredentials: false });
export const fetchProducts = (params: Record<string, unknown>) => api.get('/produits/list/', { params, withCredentials: false });
export const fetchProductDetail = (id: string) => api.get(`/produits/detail/${id}/`, { withCredentials: false });
export const fetchAverageRating = (id: string) => api.get(`/produits/note_moyenne/${id}/`, { withCredentials: false });

// HOOK PERSONNALISÉS POUR LES PRODUITS AVEC TANSTACK QUERY
export interface GetProductsParams {
  limit: number;
  offset?: number;
  categorie?: string;
  tri_par?: string;
  search?: string;
}

export const useCategories = () =>{
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {data} = await fetchCategories();
      return data;
    },
    staleTime: 7 * 60 * 1000, // 7 minutes
    placeholderData:(previousData) => previousData
  })
}

// API pour charger les produits avec pagination infinie (infinite scroll)
export const useProducts = (params: GetProductsParams) => {
  return useInfiniteQuery({
    // La QueryKey déclenche une nouvelle recherche si la catégorie, le tri ou la recherche change
    queryKey: ['products', params.categorie, params.tri_par, params.search],
    
    queryFn: async ({ pageParam = 0 }) => {
      const requestParams = {
        ...params,
        offset: pageParam,
        limit: params.limit || 20,
      };
      
      const { data } = await fetchProducts(requestParams);
      // Important : Retourne 'data' tel quel, il contient généralement { results, next, count }
      return data;
    },

    // Détermine la valeur du prochain 'pageParam'
    getNextPageParam: (lastPage) => {
      // 1. On cherche le lien 'next' dans la réponse Django
      // Selon ta config DRF, c'est soit lastPage.next, soit lastPage.data.next
      const nextUrl = lastPage?.data?.next || lastPage?.next;

      if (!nextUrl) return undefined; // Plus de pages à charger

      // 2. On extrait l'offset de l'URL pour la prochaine requête
      try {
        const url = new URL(nextUrl);
        const nextOffset = url.searchParams.get('offset');
        return nextOffset ? parseInt(nextOffset) : undefined;
      } catch {
        return undefined;
      }
    },

    // Requis par TanStack Query v5
    initialPageParam: 0,

    // Garde les anciens produits à l'écran pendant qu'on change de catégorie/filtre
    placeholderData: (previousData) => previousData,
    
    // Évite de re-télécharger les données si l'utilisateur change d'onglet 2 secondes
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProductDetail = (id: string) =>{
  return useQuery({
    queryKey:['product', id],
    queryFn: async () => {
      const {data} = await fetchProductDetail(id);
      return data;
    },
    enabled: !!id, // n'exécute la requête que si l'id est défini
    placeholderData:(previousData) => previousData
  })
}

// Recuperation de la moyenne des note par produit
export const useAverageRating = (id: string) => {
  return useQuery({
    queryKey: ['averageRating', id],
    queryFn: async () => {
      const { data } = await fetchAverageRating(id);
      return data;
    },
    enabled: !!id, // n'exécute la requête que si l'id est défini
    placeholderData: (previousData) => previousData,
  });
}

export const noteProduct = (productId: string, note: number) =>
  api.post(`/produits/noter/${productId}/`, { note_produit: note });
