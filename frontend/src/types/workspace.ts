import type { Page } from '../types/page';

export interface Workspace {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  pages?: Page[];
}