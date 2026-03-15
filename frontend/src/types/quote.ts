export interface Quote {
  id: string;
  text: string;
  reference: string;
  type: 'biblica' | 'motivacional';
  created_at?: string;
}