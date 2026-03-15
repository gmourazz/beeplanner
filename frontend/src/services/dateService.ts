import api from './api';
import { ENDPOINTS } from './endpoints';
import type { ImportantDate, CreateDateDTO } from '../types/date';

export const dateService = {
  getAll: async (): Promise<ImportantDate[]> => {
    const r = await api.get<ImportantDate[]>(ENDPOINTS.dates.getAll);
    return r.data;
  },

  create: async (data: CreateDateDTO): Promise<ImportantDate> => {
    const r = await api.post<ImportantDate>(ENDPOINTS.dates.create, data);
    return r.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.dates.delete(id));
  },
};