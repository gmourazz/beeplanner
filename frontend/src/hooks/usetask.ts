import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import type { Task, CreateTaskDTO } from '../types/task';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  add: (data: CreateTaskDTO) => Promise<Task>;
  toggle: (task: Task) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useTasks(date?: string): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getAll(date);
      setTasks(data);
    } catch {
      setError('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const add = async (data: CreateTaskDTO): Promise<Task> => {
    const task = await taskService.create(data);
    setTasks(prev => [...prev, task]);
    return task;
  };

  const toggle = async (task: Task): Promise<void> => {
    const updated = await taskService.toggle(task);
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
  };

  const remove = async (id: string): Promise<void> => {
    await taskService.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return { tasks, loading, error, add, toggle, remove, reload: load };
}