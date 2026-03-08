import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PROFESSIONS } from '../contexts/ThemeContext';
import { ProfessionTheme } from '../types';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [profession, setProfession] = useState<ProfessionTheme>('default');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isRegister) await register(name, email, pass, profession);
      else await login(email, pass);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Ocorreu um erro. Tente novamente.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      backgroundImage: 'radial-gradient(circle at 15% 20%, var(--primary) 0%, transparent 35%), radial-gradient(circle at 85% 80%, var(--accent) 0%, transparent 35%)' }}>
      <div style={{ background: 'var(--surface)', borderRadius: '24px', padding: '48px 40px', width: '420px', maxWidth: '100%',
        boxShadow: '0 24px 80px var(--shadow)', animation: 'fadeIn 0.4s ease' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '52px', animation: 'beePulse 3s infinite', display: 'inline-block', marginBottom: '8px' }}>🐝</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--primary-dark)', fontStyle: 'italic' }}>Beeplanner</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {isRegister ? 'Crie sua conta e organize tudo 🌸' : 'Bem-vinda de volta ✨'}
          </p>
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '6px' }}>Nome</label>
                <input style={{ width: '100%', padding: '12px 14px' }} value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome..." required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '6px' }}>Área de atuação</label>
                <select style={{ width: '100%', padding: '12px 14px' }} value={profession} onChange={e => setProfession(e.target.value as ProfessionTheme)}>
                  {(Object.entries(PROFESSIONS) as [ProfessionTheme, { label: string; icon: string }][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {v.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '6px' }}>E-mail</label>
            <input style={{ width: '100%', padding: '12px 14px' }} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '6px' }}>Senha</label>
            <input style={{ width: '100%', padding: '12px 14px' }} type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          {error && <p style={{ color: '#E87979', fontSize: '13px', padding: '8px 12px', background: '#FFF0F0', borderRadius: '8px', border: '1px solid #FFD0D0' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ padding: '14px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, marginTop: '4px' }}>
            {loading ? '...' : isRegister ? 'Criar conta 🐝' : 'Entrar ✨'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {isRegister ? 'Já tem conta? ' : 'Não tem conta? '}
          <span onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{ color: 'var(--primary-dark)', cursor: 'pointer', fontWeight: 600 }}>
            {isRegister ? 'Fazer login' : 'Criar grátis'}
          </span>
        </p>
      </div>
    </div>
  );
}
