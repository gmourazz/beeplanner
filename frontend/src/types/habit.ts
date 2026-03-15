export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  logs: string[];
  created_at: string;
}

export interface CreateHabitDTO {
  name: string;
  icon?: string;
  color?: string;
}

export interface ToggleHabitResponse {
  done: boolean;
  date: string;
}