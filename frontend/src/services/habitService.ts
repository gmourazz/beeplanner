import api from './api';
import { ENDPOINTS } from './endpoints';
import type { Habit, CreateHabitDTO, ToggleHabitResponse } from '../types/habit';

export const habitService = {
  getAll: async (): Promise<Habit[]> => {
    const r = await api.get<Habit[]>(ENDPOINTS.habits.getAll);
    return r.data;
  },

  create: async (data: CreateHabitDTO): Promise<Habit> => {
    const r = await api.post<Habit>(ENDPOINTS.habits.create, data);
    return r.data;
  },

  toggle: async (id: string, date: string): Promise<ToggleHabitResponse> => {
    const r = await api.post<ToggleHabitResponse>(ENDPOINTS.habits.toggle(id), { date });
    return r.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.habits.delete(id));
  },
};