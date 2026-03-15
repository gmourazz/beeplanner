import api from './api';
import { ENDPOINTS } from '@/api/endpoints';

export interface Quote {
  id: string;
  text: string;
  reference: string;
  type: 'biblica' | 'motivacional';
}

export const quoteService = {
  getToday: async (): Promise<Quote | null> => {
    const r = await api.get(ENDPOINTS.quotes.today);
    return r.data.quote;
  },
};