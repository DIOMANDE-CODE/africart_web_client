import api from './api';
import { useQuery } from '@tanstack/react-query';


// ─── Utilisateurs ───────────────────────────────
export const getUserInfo = () =>
  api.get('/utilisateurs/info_utilisateur/');

/**
 * HOOK Utilisateurs — appels API
 */

export interface UpdateProfilePayload {
  nom_utilisateur: string;
  email_utilisateur: string;
  numero_telephone_utilisateur: string;
  role: string;
}

export const useUserInfo = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const { data } = await getUserInfo();
      return data;
    },
    placeholderData: (previousData) => previousData, // Affiche les données précédentes pendant le rechargement
  });
}

export const updateProfile = (data: UpdateProfilePayload) =>
  api.put('/utilisateurs/detail/', data);
