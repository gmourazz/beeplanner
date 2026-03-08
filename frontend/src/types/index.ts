export interface User {
  id: string; name: string; email: string; avatar_emoji: string; theme: string; profession: string; created_at: string;
}
export interface Workspace {
  id: string; user_id: string; name: string; icon: string; color: string; position: number; pages?: Page[];
}
export interface Page {
  id: string; workspace_id: string; user_id: string; parent_id?: string; title: string; icon: string;
  page_type: 'note' | 'weekly' | 'monthly' | 'kanban' | 'habits' | 'dates'; content: Record<string, unknown>;
  is_favorite: boolean; position: number; created_at: string; updated_at: string;
}
export interface Task {
  id: string; user_id: string; page_id?: string; text: string; done: boolean; priority: 'low' | 'normal' | 'high'; scheduled_date?: string; created_at: string;
}
export interface Note {
  id: string; user_id: string; title: string; body: string; color: string; tags: string[]; created_at: string; updated_at: string;
}
export interface Habit {
  id: string; user_id: string; name: string; icon: string; color: string; logs: string[]; created_at: string;
}
export interface ImportantDate {
  id: string; user_id: string; title: string; date: string; emoji: string; repeat_yearly: boolean;
}
export type ThemeName = 'default' | 'rosa' | 'roxo' | 'azul-claro' | 'azul-escuro' | 'verde' | 'pastel-lilas' | 'pessego' | 'dark-colorido';
export type ProfessionTheme = 'default' | 'dev' | 'medicina' | 'direito' | 'engenharia' | 'veterinaria' | 'psicologia' | 'design' | 'admin';
