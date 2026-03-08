import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Calendar, CalendarDays, FileText, Star, Sprout,
  ChevronRight, ChevronDown, Plus, Settings, LogOut,
  FolderOpen, Trash2, Palette, Code2, Activity, BookOpen,
  Cog, Heart, Cpu, Pen, BarChart2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, THEMES, PROFESSIONS } from '../contexts/ThemeContext';
import { Workspace, Page, ThemeName, ProfessionTheme } from '../types';
import api from '../services/api';

const PAGE_ICONS: Record<string, React.ReactNode> = {
  note: <FileText size={14} />, weekly: <Calendar size={14} />, monthly: <CalendarDays size={14} />,
  habits: <Sprout size={14} />, dates: <Star size={14} />, kanban: <BarChart2 size={14} />,
};

const PROF_ICONS: Record<ProfessionTheme, React.ReactNode> = {
  default: '🐝', dev: <Code2 size={15} />, medicina: <Activity size={15} />,
  direito: <BookOpen size={15} />, engenharia: <Cog size={15} />,
  veterinaria: <Heart size={15} />, psicologia: <Cpu size={15} />,
  design: <Pen size={15} />, admin: <BarChart2 size={15} />,
};

interface SidebarProps { onPageSelect: (page: Page) => void; selectedPageId?: string; }

export default function Sidebar({ onPageSelect, selectedPageId }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme, profession, setProfession } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [expandedWS, setExpandedWS] = useState<Set<string>>(new Set());
  const [showThemes, setShowThemes] = useState(false);
  const [showProfessions, setShowProfessions] = useState(false);
  const [newWSName, setNewWSName] = useState('');
  const [addingWS, setAddingWS] = useState(false);

  useEffect(() => { loadWorkspaces(); }, []);

  const loadWorkspaces = async () => {
    try { const r = await api.get('/workspaces'); setWorkspaces(r.data); if (r.data[0]) setExpandedWS(new Set([r.data[0].id])); }
    catch {}
  };

  const createWorkspace = async () => {
    if (!newWSName.trim()) return;
    const r = await api.post('/workspaces', { name: newWSName });
    setWorkspaces(prev => [...prev, { ...r.data, pages: [] }]);
    setNewWSName(''); setAddingWS(false);
  };

  const createPage = async (wsId: string, type: Page['page_type'] = 'note') => {
    const r = await api.post('/pages', { workspace_id: wsId, title: 'Sem título', icon: '📄', page_type: type });
    setWorkspaces(prev => prev.map(w => w.id === wsId ? { ...w, pages: [...(w.pages || []), r.data] } : w));
    onPageSelect(r.data);
  };

  const deleteWorkspace = async (id: string) => {
    if (!confirm('Deletar este espaço?')) return;
    await api.delete(`/workspaces/${id}`);
    setWorkspaces(prev => prev.filter(w => w.id !== id));
  };

  const themeColors: [ThemeName, string][] = [
    ['default', 'linear-gradient(135deg,#F4A5B8,#F9C784)'], ['dark', 'linear-gradient(135deg,#1E1E1E,#F4A5B8)'],
    ['rosa', 'linear-gradient(135deg,#FF6FA8,#FFB3CC)'], ['roxo', 'linear-gradient(135deg,#1E0A2E,#B56EFF)'],
    ['azul-claro', 'linear-gradient(135deg,#7EC8E3,#B3E5FC)'], ['azul-escuro', 'linear-gradient(135deg,#0A1628,#4A90D9)'],
    ['verde', 'linear-gradient(135deg,#6DC88A,#A8E6C0)'], ['pastel-lilas', 'linear-gradient(135deg,#C3A8F0,#F4C2FF)'],
    ['dark-colorido', 'linear-gradient(135deg,#0D0D1A,#FF6B9D)'],
  ];

  const s = {
    sidebar: { width: '248px', minWidth: '248px', background: 'var(--sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' as const, height: '100vh', overflow: 'hidden' },
    logo: { padding: '20px 18px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)' },
    logoIcon: { fontSize: '24px', animation: 'beePulse 4s infinite' },
    logoText: { fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--primary-dark)', fontStyle: 'italic' as const },
    nav: { flex: 1, overflowY: 'auto' as const, padding: '12px 10px' },
    navItem: (active: boolean) => ({ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13.5px', color: active ? 'white' : 'var(--text-muted)', background: active ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'transparent', transition: 'all 0.15s', marginBottom: '2px', fontWeight: active ? 600 : 400 }),
    section: { marginBottom: '20px' },
    sectionLabel: { fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '1.2px', color: 'var(--text-muted)', padding: '0 10px', marginBottom: '6px' },
    wsRow: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text)', transition: 'all 0.15s' },
    pageRow: (active: boolean) => ({ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px 5px 30px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: active ? 'var(--primary-dark)' : 'var(--text-muted)', background: active ? 'var(--surface2)' : 'transparent', transition: 'all 0.15s' }),
    footer: { padding: '12px 10px', borderTop: '1px solid var(--border)' },
    userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '10px', marginBottom: '6px' },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 },
  };

  return (
    <aside style={s.sidebar}>
      <div style={s.logo}>
        <span style={s.logoIcon}>🐝</span>
        <span style={s.logoText}>Beeplanner</span>
      </div>

      <div style={s.nav}>
        {/* Main nav */}
        <div style={s.section}>
          {[
            { path: '/', label: 'Início', icon: <Home size={15} /> },
            { path: '/weekly', label: 'Semana', icon: <Calendar size={15} /> },
            { path: '/monthly', label: 'Mês', icon: <CalendarDays size={15} /> },
            { path: '/habits', label: 'Hábitos', icon: <Sprout size={15} /> },
            { path: '/dates', label: 'Datas Importantes', icon: <Star size={15} /> },
          ].map(({ path, label, icon }) => (
            <div key={path} style={s.navItem(location.pathname === path)} onClick={() => navigate(path)}
              onMouseEnter={e => { if (location.pathname !== path) (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { if (location.pathname !== path) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; } }}>
              {icon} <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Workspaces */}
        <div style={s.section}>
          <div style={{ ...s.sectionLabel, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Espaços</span>
            <button onClick={() => setAddingWS(!addingWS)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0 4px', fontSize: '16px', lineHeight: 1 }}>
              <Plus size={12} />
            </button>
          </div>

          {addingWS && (
            <div style={{ padding: '4px 10px 8px', display: 'flex', gap: '6px' }}>
              <input value={newWSName} onChange={e => setNewWSName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createWorkspace()} placeholder="Nome do espaço..." style={{ flex: 1, padding: '6px 10px', fontSize: '13px' }} autoFocus />
              <button onClick={createWorkspace} style={{ padding: '6px 10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px' }}>+</button>
            </div>
          )}

          {workspaces.map(ws => (
            <div key={ws.id}>
              <div style={s.wsRow}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span onClick={() => setExpandedWS(prev => { const n = new Set(prev); n.has(ws.id) ? n.delete(ws.id) : n.add(ws.id); return n; })} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  {expandedWS.has(ws.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <span>{ws.icon}</span>
                  <span style={{ fontWeight: 500 }}>{ws.name}</span>
                </span>
                <button onClick={() => createPage(ws.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '2px', opacity: 0, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                  className="ws-add-btn">
                  <Plus size={12} />
                </button>
                <button onClick={() => deleteWorkspace(ws.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '2px' }}>
                  <Trash2 size={11} />
                </button>
              </div>
              {expandedWS.has(ws.id) && (ws.pages || []).map(page => (
                <div key={page.id} style={s.pageRow(selectedPageId === page.id)} onClick={() => { onPageSelect(page); navigate(`/page/${page.id}`); }}>
                  <span>{PAGE_ICONS[page.page_type] || <FileText size={14} />}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.icon} {page.title}</span>
                </div>
              ))}
              {expandedWS.has(ws.id) && (ws.pages || []).length === 0 && (
                <div style={{ ...s.pageRow(false), opacity: 0.5, fontSize: '12px' }} onClick={() => createPage(ws.id)}>
                  <Plus size={12} /> <span>Nova página</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        {/* Theme picker */}
        <div style={{ marginBottom: '10px' }}>
          <button onClick={() => setShowThemes(!showThemes)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', padding: '4px 10px', width: '100%', borderRadius: '8px' }}>
            <Palette size={13} /> Temas {showThemes ? '▲' : '▼'}
          </button>
          {showThemes && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 10px' }}>
              {themeColors.map(([t, bg]) => (
                <div key={t} onClick={() => setTheme(t)} title={t} style={{ width: '22px', height: '22px', borderRadius: '50%', background: bg, cursor: 'pointer', border: theme === t ? '2.5px solid var(--text)' : '2px solid transparent', transition: 'all 0.15s', transform: theme === t ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Profession */}
        <div style={{ marginBottom: '10px' }}>
          <button onClick={() => setShowProfessions(!showProfessions)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', padding: '4px 10px', width: '100%', borderRadius: '8px' }}>
            <span style={{ fontSize: '13px' }}>{typeof PROF_ICONS[profession] === 'string' ? PROF_ICONS[profession] : PROF_ICONS[profession]}</span>
            <span>Área: {PROFESSIONS[profession].label}</span> {showProfessions ? '▲' : '▼'}
          </button>
          {showProfessions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 10px' }}>
              {(Object.entries(PROFESSIONS) as [ProfessionTheme, { label: string; icon: string }][]).map(([k, v]) => (
                <div key={k} onClick={() => { setProfession(k); setShowProfessions(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', color: profession === k ? 'var(--primary-dark)' : 'var(--text-muted)', background: profession === k ? 'var(--surface2)' : 'transparent' }}>
                  <span>{v.icon}</span> {v.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div style={s.userRow}>
          <div style={s.avatar}>{user?.avatar_emoji || '🐝'}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{PROFESSIONS[profession as ProfessionTheme]?.label || 'Planner'}</div>
          </div>
          <button onClick={() => { logout(); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '4px' }} title="Sair">
            <LogOut size={14} />
          </button>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '4px' }} title="Configurações">
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
