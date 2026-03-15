import api from './api';
import { ENDPOINTS } from './endpoints';
import type { User } from '../types';

interface AuthResponse { ok: boolean; token: string; user: User; }
interface MeResponse  { ok: boolean; user: User; }

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const r = await api.post<AuthResponse>(ENDPOINTS.auth.login, { email, password });
    return { token: r.data.token, user: r.data.user };
  },

  register: async (
    name: string,
    email: string,
    password: string,
    profession = 'default'
  ): Promise<{ token: string; user: User }> => {
    const r = await api.post<AuthResponse>(ENDPOINTS.auth.register, { name, email, password, profession });
    return { token: r.data.token, user: r.data.user };
  },

  me: async (): Promise<User> => {
    const r = await api.get<MeResponse>(ENDPOINTS.auth.me);
    return r.data.user;
  },
};