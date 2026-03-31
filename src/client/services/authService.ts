import api from './api';

/**
 * Authentification — appels API
 */

export const login = (email: string, password: string) =>
  api.post('/authentification/login/', { email_utilisateur: email, password });

export interface RegisterPayload {
  nom_utilisateur: string;
  email_utilisateur: string;
  password: string;
  numero_telephone_utilisateur: string;
  role: string;
}

export const register = (data: RegisterPayload) =>
  api.post('/utilisateurs/create/', data, { withCredentials: false });

export const checkSessionApi = () =>
  api.get('/authentification/check_session/', { withCredentials: true });

export const logoutApi = () =>
  api.post('/authentification/logout/', {}, { withCredentials: true });

export const changePassword = (ancienMdp: string, nouveauMdp: string) =>
  api.post('/authentification/changer_mot_de_passe/', {
    ancien_mot_de_passe: ancienMdp,
    nouveau_mot_de_passe: nouveauMdp,
  });
