import api from './api';
import { ENDPOINTS } from './endpoints';
import type { Task, CreateTaskDTO, UpdateTaskDTO } from '../types/task';

export const taskService = {
  getAll: async (date?: string): Promise<Task[]> => {
    const r = await api.get<Task[]>(ENDPOINTS.tasks.getAll(date));
    return r.data;
  },

  getByPage: async (pageId: string): Promise<Task[]> => {
    const r = await api.get<Task[]>(ENDPOINTS.tasks.getAll(), { params: { page_id: pageId } });
    return r.data;
  },

  create: async (data: CreateTaskDTO): Promise<Task> => {
    const r = await api.post<Task>(ENDPOINTS.tasks.create, data);
    return r.data;
  },

  update: async (id: string, data: UpdateTaskDTO): Promise<Task> => {
    const r = await api.put<Task>(ENDPOINTS.tasks.update(id), data);
    return r.data;
  },

  toggle: async (task: Task): Promise<Task> => {
    const r = await api.put<Task>(ENDPOINTS.tasks.update(task.id), {
      ...task,
      done: !task.done,
    });
    return r.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(ENDPOINTS.tasks.delete(id));
  },
};