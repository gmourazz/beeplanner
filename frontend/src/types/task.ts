export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  user_id: string;
  page_id?: string;
  text: string;
  done: boolean;
  priority: TaskPriority;
  scheduled_date?: string;
  created_at: string;
}

export interface CreateTaskDTO {
  text: string;
  priority?: TaskPriority;
  scheduled_date?: string;
  page_id?: string;
}

export interface UpdateTaskDTO {
  text?: string;
  done?: boolean;
  priority?: TaskPriority;
  scheduled_date?: string;
}