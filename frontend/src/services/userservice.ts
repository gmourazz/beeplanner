import api from './api';
import { ENDPOINTS } from '@/api/endpoints';
import type { User } from '../types';

export const userService = {
  updateProfile: async (data: Partial<User> & { avatar_emoji?: string }): Promise<User> => {
    const r = await api.put(ENDPOINTS.users.profile, data);
    return r.data;
  },
};