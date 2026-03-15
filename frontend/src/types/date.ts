export interface ImportantDate {
  id: string;
  user_id: string;
  title: string;
  date: string;
  emoji: string;
  repeat_yearly: boolean;
}

export interface CreateDateDTO {
  title: string;
  date: string;
  emoji?: string;
  repeat_yearly?: boolean;
}