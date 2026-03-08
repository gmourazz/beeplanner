import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeName, ProfessionTheme } from '../types';

interface ThemeCtx {
  theme: ThemeName;
  profession: ProfessionTheme;
  darkMode: boolean;
  setTheme: (t: ThemeName) => void;
  setProfession: (p: ProfessionTheme) => void;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeCtx>({} as ThemeCtx);

export const THEMES: Record<ThemeName, { name: string; gradient: string; vars: Record<string, string> }> = {
  default: { name: '🐝 Rosa Mel', gradient: 'linear-gradient(135deg,#F4A5B8,#F9C784)', vars: { '--primary':'#F4A5B8','--primary-dark':'#E8799A','--accent':'#F9C784','--surface2-light':'#FFF0EC','--border-light':'#F5D5DC','--shadow':'rgba(244,165,184,0.2)' } },
  rosa: { name: '🌸 Rosa', gradient: 'linear-gradient(135deg,#FF6FA8,#FFB3CC)', vars: { '--primary':'#FF6FA8','--primary-dark':'#E0547E','--accent':'#FFB3CC','--surface2-light':'#FFE4EE','--border-light':'#FFCCE0','--shadow':'rgba(255,111,168,0.2)' } },
  roxo: { name: '🔮 Roxo Pastel', gradient: 'linear-gradient(135deg,#B56EFF,#FF79C6)', vars: { '--primary':'#B56EFF','--primary-dark':'#9B4EEA','--accent':'#FF79C6','--surface2-light':'#EEE4FF','--border-light':'#E0D0FF','--shadow':'rgba(181,110,255,0.2)' } },
  'azul-claro': { name: '🌊 Azul Claro', gradient: 'linear-gradient(135deg,#7EC8E3,#B3E5FC)', vars: { '--primary':'#7EC8E3','--primary-dark':'#5AB4D3','--accent':'#B3E5FC','--surface2-light':'#E0F0FF','--border-light':'#C2E4F5','--shadow':'rgba(126,200,227,0.2)' } },
  'azul-escuro': { name: '🌙 Azul Marinho', gradient: 'linear-gradient(135deg,#4A90D9,#64B5F6)', vars: { '--primary':'#4A90D9','--primary-dark':'#2A70C2','--accent':'#64B5F6','--surface2-light':'#E0EEFF','--border-light':'#C2D8F5','--shadow':'rgba(74,144,217,0.2)' } },
  verde: { name: '🌿 Verde Sage', gradient: 'linear-gradient(135deg,#6DC88A,#A8E6C0)', vars: { '--primary':'#6DC88A','--primary-dark':'#4DAA6A','--accent':'#A8E6C0','--surface2-light':'#E0F5E5','--border-light':'#B8E8C5','--shadow':'rgba(109,200,138,0.2)' } },
  'pastel-lilas': { name: '💜 Lilás', gradient: 'linear-gradient(135deg,#C3A8F0,#F4C2FF)', vars: { '--primary':'#C3A8F0','--primary-dark':'#A888D8','--accent':'#F4C2FF','--surface2-light':'#EEE8FF','--border-light':'#E0D0FF','--shadow':'rgba(195,168,240,0.2)' } },
  pessego: { name: '🍑 Pêssego', gradient: 'linear-gradient(135deg,#FFAB76,#FFD0A8)', vars: { '--primary':'#FFAB76','--primary-dark':'#F08040','--accent':'#FFD0A8','--surface2-light':'#FFF0E0','--border-light':'#FFD8B8','--shadow':'rgba(255,171,118,0.2)' } },
  'dark-colorido': { name: '🌈 Dark Neon', gradient: 'linear-gradient(135deg,#FF6B9D,#00D4FF)', vars: { '--primary':'#FF6B9D','--primary-dark':'#E8508A','--accent':'#00D4FF','--surface2-light':'#FFF0F5','--border-light':'#FFD0E0','--shadow':'rgba(255,107,157,0.3)' } },
};

export const PROFESSIONS: Record<ProfessionTheme, { label: string; icon: string; theme: ThemeName }> = {
  default: { label: 'Geral', icon: '🐝', theme: 'default' },
  dev: { label: 'Dev / Tech', icon: '💻', theme: 'azul-escuro' },
  medicina: { label: 'Medicina', icon: '🩺', theme: 'verde' },
  direito: { label: 'Direito', icon: '⚖️', theme: 'azul-claro' },
  engenharia: { label: 'Engenharia', icon: '⚙️', theme: 'azul-claro' },
  veterinaria: { label: 'Veterinária', icon: '🐾', theme: 'pessego' },
  psicologia: { label: 'Psicologia', icon: '🧠', theme: 'pastel-lilas' },
  design: { label: 'Design', icon: '🎨', theme: 'rosa' },
  admin: { label: 'Adm / Negócios', icon: '📊', theme: 'azul-claro' },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => (localStorage.getItem('bp_theme') as ThemeName) || 'default');
  const [profession, setProfState] = useState<ProfessionTheme>(() => (localStorage.getItem('bp_profession') as ProfessionTheme) || 'default');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('bp_dark') === 'true');

  const applyTheme = (t: ThemeName, dark: boolean) => {
    const themeData = THEMES[t] || THEMES.default;
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.style.setProperty('--bg', '#0F0F0F');
      root.style.setProperty('--surface', '#1C1C1C');
      root.style.setProperty('--surface2', '#252525');
      root.style.setProperty('--text', '#F0EAE8');
      root.style.setProperty('--text-muted', '#777');
      root.style.setProperty('--sidebar', '#151515');
      root.style.setProperty('--border', '#2A2A2A');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--bg', '#FFF8F5');
      root.style.setProperty('--surface', '#FFFFFF');
      root.style.setProperty('--surface2', themeData.vars['--surface2-light'] || '#FFF0EC');
      root.style.setProperty('--text', '#3D2B2B');
      root.style.setProperty('--text-muted', '#9B7575');
      root.style.setProperty('--sidebar', '#FDF3F5');
      root.style.setProperty('--border', themeData.vars['--border-light'] || '#F5D5DC');
    }
    root.style.setProperty('--primary', themeData.vars['--primary']);
    root.style.setProperty('--primary-dark', themeData.vars['--primary-dark']);
    root.style.setProperty('--accent', themeData.vars['--accent']);
    root.style.setProperty('--shadow', themeData.vars['--shadow']);
  };

  useEffect(() => { applyTheme(theme, darkMode); }, []);

  const setTheme = (t: ThemeName) => { setThemeState(t); localStorage.setItem('bp_theme', t); applyTheme(t, darkMode); };
  const setProfession = (p: ProfessionTheme) => {
    setProfState(p); localStorage.setItem('bp_profession', p);
    const profTheme = PROFESSIONS[p]?.theme || 'default';
    setThemeState(profTheme); localStorage.setItem('bp_theme', profTheme); applyTheme(profTheme, darkMode);
  };
  const toggleDark = () => {
    const next = !darkMode; setDarkMode(next); localStorage.setItem('bp_dark', String(next)); applyTheme(theme, next);
  };

  return <ThemeContext.Provider value={{ theme, profession, darkMode, setTheme, setProfession, toggleDark }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
