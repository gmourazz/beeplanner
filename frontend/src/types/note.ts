export interface Note {
  id: string;
  user_id: string;
  page_id?: string;
  title: string;
  body: string;
  color: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateNoteDTO {
  title: string;
  body: string;
  color?: string;
  tags?: string[];
  page_id?: string;
}