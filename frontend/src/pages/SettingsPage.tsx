import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, THEMES, PROFESSIONS } from '../contexts/ThemeContext';
import { ThemeName, ProfessionTheme } from '../types';
import api from '../services/api';

const AVATARS = ['🐝','✨','🌸','🦋','🌻','🎀','🍀','💫','🌙','⚡','🎯','💎','🦊','🐱','🐼'];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme, profession, setProfession } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar_emoji || '🐝');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    const r = await api.put('/users/profile', { name, avatar_emoji: avatar, theme, profession });
    updateUser(r.data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const themeOptions: [ThemeName, string, string][] = [
    ['default','Rosa Mel 🐝','linear-gradient(135deg,#F4A5B8,#F9C784)'],
    ['dark','Dark','linear-gradient(135deg,#1E1E1E,#F4A5B8)'],
    ['rosa','Rosa','linear-gradient(135deg,#FF6FA8,#FFB3CC)'],
    ['roxo','Roxo Escuro','linear-gradient(135deg,#1E0A2E,#B56EFF)'],
    ['azul-claro','Azul Claro','linear-gradient(135deg,#7EC8E3,#B3E5FC)'],
    ['azul-escuro','Azul Escuro','linear-gradient(135deg,#0A1628,#4A90D9)'],
    ['verde','Verde Pastel','linear-gradient(135deg,#6DC88A,#A8E6C0)'],
    ['pastel-lilas','Lilás Pastel','linear-gradient(135deg,#C3A8F0,#F4C2FF)'],
    ['dark-colorido','Dark Colorido','linear-gradient(135deg,#0D0D1A,#FF6B9D)'],
  ];

  const card = { background: 'var(--surface)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '20px' };
  const label = { display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '8px' };

  return (
    <div style={{ padding: '36px 40px', maxWidth: '700px', animation: 'fadeIn 0.35s ease' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontStyle: 'italic', marginBottom: '28px' }}>Configurações</h1>

      {/* Profile */}
      <div style={card}>
        <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '20px' }}>👤 Perfil</h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={label}>Nome</label>
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px 14px' }} />
        </div>
        <div>
          <label style={label}>Avatar</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AVATARS.map(a => (
              <div key={a} onClick={() => setAvatar(a)} style={{ width: '40px', height: '40px', borderRadius: '12px', border: `2px solid ${avatar === a ? 'var(--primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', background: avatar === a ? 'var(--surface2)' : 'transparent', transition: 'all 0.15s' }}>{a}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Theme */}
      <div style={card}>
        <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '20px' }}>🎨 Temas</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {themeOptions.map(([t, label2, bg]) => (
            <div key={t} onClick={() => setTheme(t)} style={{ padding: '12px 14px', borderRadius: '12px', border: `2px solid ${theme === t ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s', background: theme === t ? 'var(--surface2)' : 'var(--surface)' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: bg, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: theme === t ? 600 : 400 }}>{label2}</span>
              {theme === t && <Check size={13} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Profession */}
      <div style={card}>
        <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '20px' }}>💼 Área de Atuação</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {(Object.entries(PROFESSIONS) as [ProfessionTheme, { label: string; icon: string }][]).map(([k, v]) => (
            <div key={k} onClick={() => setProfession(k)} style={{ padding: '12px 14px', borderRadius: '12px', border: `2px solid ${profession === k ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s', background: profession === k ? 'var(--surface2)' : 'var(--surface)' }}>
              <span style={{ fontSize: '18px' }}>{v.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: profession === k ? 600 : 400 }}>{v.label}</span>
              {profession === k && <Check size={13} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: saved ? 'var(--primary)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', transition: 'all 0.3s' }}>
        {saved ? <><Check size={16} /> Salvo!</> : <><Save size={16} /> Salvar alterações</>}
      </button>
    </div>
  );
}
