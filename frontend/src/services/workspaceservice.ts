import api from './api';
import { ENDPOINTS } from '@/api/endpoints';
import type { Workspace, Page } from '../types';

export const workspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    const r = await api.get(ENDPOINTS.workspaces.getAll);
    return r.data;
  },

  create: async (data: Partial<Workspace>): Promise<Workspace> => {
    const r = await api.post(ENDPOINTS.workspaces.create, data);
    return r.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.workspaces.delete(id));
  },
};

export const pageService = {
  create: async (data: Partial<Page>): Promise<Page> => {
    const r = await api.post(ENDPOINTS.pages.create, data);
    return r.data;
  },

  update: async (id: string, data: Partial<Page>): Promise<Page> => {
    const r = await api.put(ENDPOINTS.pages.update(id), data);
    return r.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.pages.delete(id));
  },
};