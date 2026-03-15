export type PageType = 'note' | 'weekly' | 'monthly' | 'kanban' | 'habits' | 'dates';

export interface Page {
  id: string;
  workspace_id: string;
  user_id: string;
  parent_id?: string;
  title: string;
  icon: string;
  page_type: PageType;
  content: Record<string, unknown>;
  is_favorite: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}