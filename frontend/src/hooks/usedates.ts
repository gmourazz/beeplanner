import { useState, useEffect } from 'react';
import { dateService } from '../services/dateService';
import type { ImportantDate, CreateDateDTO } from '../types/date';

interface UseDatesReturn {
  dates: ImportantDate[];
  loading: boolean;
  error: string | null;
  add: (data: CreateDateDTO) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useDates(): UseDatesReturn {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dateService.getAll()
      .then(setDates)
      .catch(() => setError('Erro ao carregar datas'))
      .finally(() => setLoading(false));
  }, []);

  const add = async (data: CreateDateDTO): Promise<void> => {
    const d = await dateService.create(data);
    setDates(prev =>
      [...prev, d].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  };

  const remove = async (id: string): Promise<void> => {
    await dateService.delete(id);
    setDates(prev => prev.filter(d => d.id !== id));
  };

  return { dates, loading, error, add, remove };
}