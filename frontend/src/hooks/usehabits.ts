import { useState, useEffect } from 'react';
import { habitService } from '@/services';
import type { Habit, CreateHabitDTO } from '../types/habit';

interface UseHabitsReturn {
  habits: Habit[];
  loading: boolean;
  error: string | null;
  add: (data: CreateHabitDTO) => Promise<void>;
  toggle: (habit: Habit, date: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    habitService.getAll()
      .then(setHabits)
      .catch(() => setError('Erro ao carregar hábitos'))
      .finally(() => setLoading(false));
  }, []);

  const add = async (data: CreateHabitDTO): Promise<void> => {
    const habit = await habitService.create(data);
    setHabits(prev => [...prev, { ...habit, logs: [] }]);
  };

  const toggle = async (habit: Habit, date: string): Promise<void> => {
    const { done } = await habitService.toggle(habit.id, date);
    setHabits(prev => prev.map(h =>
      h.id === habit.id
        ? { ...h, logs: done ? [...h.logs, date] : h.logs.filter(l => l !== date) }
        : h
    ));
  };

  const remove = async (id: string): Promise<void> => {
    await habitService.delete(id);
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  return { habits, loading, error, add, toggle, remove };
}