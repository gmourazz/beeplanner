import api from './api';
import { ENDPOINTS } from './endpoints';
import type { Note, CreateNoteDTO } from '../types/note';

export const noteService = {
  getAll: async (): Promise<Note[]> => {
    const r = await api.get<Note[]>(ENDPOINTS.notes.getAll);
    return r.data;
  },

  getByPage: async (pageId: string): Promise<Note[]> => {
    const all = await noteService.getAll();
    return all.filter((n: Note & { page_id?: string }) => n.page_id === pageId);
  },

  create: async (data: CreateNoteDTO): Promise<Note> => {
    const r = await api.post<Note>(ENDPOINTS.notes.create, data);
    return r.data;
  },

  update: async (id: string, data: Partial<CreateNoteDTO>): Promise<Note> => {
    const r = await api.put<Note>(ENDPOINTS.notes.update(id), data);
    return r.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.notes.delete(id));
  },
};