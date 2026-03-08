import { Moon, Sun, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps { title?: string; }

export default function AppHeader({ title }: HeaderProps) {
  const { darkMode, toggleDark } = useTheme();

  return (
    <div style={{ height: '56px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', paddingLeft: '32px', paddingRight: '24px', gap: '16px', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
      {title && <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontStyle: 'italic', color: 'var(--text)', fontWeight: 600 }}>{title}</span>}
      <div style={{ flex: 1 }} />

      {/* Search hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-muted)' }}>
        <Search size={13} />
        <span>Pesquisar...</span>
        <span style={{ marginLeft: '8px', fontSize: '11px', padding: '1px 6px', background: 'var(--border)', borderRadius: '4px' }}>⌘K</span>
      </div>

      {/* Dark mode toggle */}
      <button onClick={toggleDark} title={darkMode ? 'Modo claro' : 'Modo escuro'} style={{ width: '56px', height: '30px', borderRadius: '15px', background: darkMode ? 'var(--primary)' : '#E8E0DC', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: darkMode ? '29px' : '3px', transition: 'left 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
          {darkMode ? <Moon size={12} color="var(--primary)" /> : <Sun size={12} color="#F9C784" />}
        </div>
      </button>
    </div>
  );
}
