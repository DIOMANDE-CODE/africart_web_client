import api from './api';
import { useQuery } from '@tanstack/react-query';

/**
 * Recommandations & suivi de vues — appels API
 */

export const getPersonalRecommendations = () =>
  api.get('/produits/recommendations/?type=personal');

export const getPopularRecommendations = () =>
  api.get('/recommandations/', { params: { type: 'personnalise' } });

export const getSimilarCategoryProducts = (productId: string) =>
  api.get('/recommandations/', { params: { type: 'similar_categorie', produit_id: productId } });

export const getCoPurchaseProducts = (productId: string) =>
  api.get('/recommandations/', { params: { type: 'co_achat', produit_id: productId } });

export const trackView = (productId: string) =>
  api.post('/recommandations/vue/', { produit_id: productId }, { withCredentials: true });


// HOOKS TANSTACK QUERY

export const usePersonalRecommendations = (enabled = true) => {
  return useQuery({
    queryKey: ['personalRecommendations'],
    queryFn: async () => {
      const { data } = await getPersonalRecommendations();
      return data;
    },
    placeholderData: (previousData) => previousData, // Affiche les données précédentes pendant le rechargement
    enabled,

  })
}

export const usePopularRecommendations = () => {
  return useQuery({
    queryKey: ['popularRecommendations'],
    queryFn: async () => {
      const { data } = await getPopularRecommendations();
      return data;
    },
    placeholderData: (previousData) => previousData, // Affiche les données précédentes pendant le rechargement
  });
}

export const useSimilarCategoryProducts = (productId: string) => {
  return useQuery({
    queryKey: ['similarCategoryProducts', productId],
    queryFn: async () => {
      const { data } = await getSimilarCategoryProducts(productId);
      return data;
    },
    placeholderData: (previousData) => previousData, // Affiche les données précédentes pendant le rechargement
  });
}

export const useCoPurchaseProducts = (productId: string) => {
  return useQuery({
    queryKey: ['coPurchaseProducts', productId],
    queryFn: async () => {
      const { data } = await getCoPurchaseProducts(productId);
      return data;
    },
    placeholderData: (previousData) => previousData, // Affiche les données précédentes pendant le rechargement
  });
}