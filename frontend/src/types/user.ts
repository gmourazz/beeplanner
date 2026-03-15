export interface User {
  id: string;
  name: string;
  email: string;
  avatar_emoji: string;
  theme: string;
  profession: string;
  created_at: string;
}

export type ThemeName =
  | 'default' | 'dark' | 'rosa' | 'roxo'
  | 'azul-claro' | 'azul-escuro' | 'verde'
  | 'pastel-lilas' | 'dark-colorido';

export type ProfessionTheme =
  | 'default' | 'dev' | 'medicina' | 'direito'
  | 'engenharia' | 'veterinaria' | 'psicologia'
  | 'design' | 'admin';