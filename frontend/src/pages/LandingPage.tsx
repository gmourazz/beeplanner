import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Calendar, FileText, Sprout, Star, CheckCircle, ChevronRight, Zap, Shield, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const DEMO_EVENTS = [
  { time: '9:00', title: 'Daily Standup', color: '#F4A5B8', col: 1, duration: 1 },
  { time: '10:00', title: 'Wireframe review', color: '#7EC8E3', col: 1, duration: 2 },
  { time: '9:30', title: '1:1 com a equipe', color: '#A8E6C0', col: 2, duration: 1 },
  { time: '11:00', title: 'Design Sprint', color: '#C3A8F0', col: 2, duration: 2 },
  { time: '12:00', title: 'Almoço 🍱', color: '#F9C784', col: 3, duration: 1 },
  { time: '14:00', title: 'Revisão de PRs', color: '#F4A5B8', col: 3, duration: 1 },
];

function CalendarPreview({ dark }: { dark: boolean }) {
  const today = new Date();
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  const bg = dark ? '#1C1C1C' : '#FFFFFF';
  const bg2 = dark ? '#252525' : '#F8F8F8';
  const border = dark ? '#2A2A2A' : '#F0F0F0';
  const text = dark ? '#F0EAE8' : '#333';
  const muted = dark ? '#666' : '#AAA';

  return (
    <div style={{ background: bg, borderRadius: '20px', overflow: 'hidden', boxShadow: `0 32px 80px ${dark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)'}`, border: `1px solid ${border}`, width: '100%', maxWidth: '560px' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: bg2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#F4A5B8,#F9C784)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🐝</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: text }}>Beeplanner</div>
            <div style={{ fontSize: '11px', color: muted }}>Semana atual</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF5F57' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28CA40' }} />
        </div>
      </div>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(5, 1fr)', borderBottom: `1px solid ${border}` }}>
        <div style={{ padding: '10px', background: bg2 }} />
        {days.map((d, i) => {
          const dt = new Date(); dt.setDate(today.getDate() - today.getDay() + 1 + i);
          const isToday = dt.toDateString() === today.toDateString();
          return (
            <div key={d} style={{ padding: '10px 8px', textAlign: 'center', background: bg2 }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: muted, fontWeight: 600 }}>{d}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: isToday ? '#E8799A' : text, marginTop: '2px', fontFamily: '"Cormorant Garamond", serif' }}>{dt.getDate()}</div>
              {isToday && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#E8799A', margin: '2px auto 0' }} />}
            </div>
          );
        })}
      </div>
      {/* Time grid */}
      {['9am', '10am', '11am', '12pm', '1pm'].map((time, ri) => (
        <div key={time} style={{ display: 'grid', gridTemplateColumns: '48px repeat(5, 1fr)', borderBottom: `1px solid ${border}`, height: '52px' }}>
          <div style={{ padding: '4px 8px', fontSize: '10px', color: muted, textAlign: 'right', paddingTop: '6px' }}>{time}</div>
          {[1,2,3,4,5].map(col => {
            const ev = DEMO_EVENTS.find(e => parseInt(e.time) === ri + 9 && e.col === (col > 2 ? col - 2 : col) && ((col <= 2) === (col <= 2)));
            const ev2 = col <= 3 ? DEMO_EVENTS.find(e => parseInt(e.time) === ri + 9 && e.col === col) : null;
            return (
              <div key={col} style={{ padding: '2px', position: 'relative' }}>
                {ev2 && (
                  <div style={{ background: ev2.color + '30', borderLeft: `3px solid ${ev2.color}`, borderRadius: '6px', padding: '4px 6px', fontSize: '10.5px', fontWeight: 600, color: text, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {ev2.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const FEATURES = [
  { icon: <Calendar size={22} />, title: 'Calendário Semanal', desc: 'Visualize e planeje toda sua semana com arrastar e soltar tarefas.' },
  { icon: <FileText size={22} />, title: 'Notas & Páginas', desc: 'Organize tudo em pastas e páginas, como o Notion mas mais fofo.' },
  { icon: <Sprout size={22} />, title: 'Rastreador de Hábitos', desc: 'Acompanhe seus hábitos diários com visualização dos últimos 7 dias.' },
  { icon: <Star size={22} />, title: 'Datas Importantes', desc: 'Aniversários, eventos e lembretes nunca mais serão esquecidos.' },
  { icon: <Zap size={22} />, title: 'Temas por Profissão', desc: 'Dev, Medicina, Direito, Design — temas feitos para o seu universo.' },
  { icon: <Shield size={22} />, title: 'Seus Dados, Sempre', desc: 'Login seguro com JWT. Seus dados ficam salvos no seu banco PostgreSQL.' },
];

const THEMES_PREVIEW = [
  { name: 'Rosa Mel', gradient: 'linear-gradient(135deg,#F4A5B8,#F9C784)' },
  { name: 'Lilás', gradient: 'linear-gradient(135deg,#C3A8F0,#F4C2FF)' },
  { name: 'Azul Claro', gradient: 'linear-gradient(135deg,#7EC8E3,#B3E5FC)' },
  { name: 'Verde Sage', gradient: 'linear-gradient(135deg,#6DC88A,#A8E6C0)' },
  { name: 'Pêssego', gradient: 'linear-gradient(135deg,#FFAB76,#FFD0A8)' },
  { name: 'Roxo', gradient: 'linear-gradient(135deg,#B56EFF,#FF79C6)' },
  { name: 'Azul Marinho', gradient: 'linear-gradient(135deg,#4A90D9,#64B5F6)' },
  { name: 'Dark Neon', gradient: 'linear-gradient(135deg,#FF6B9D,#00D4FF)' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode, toggleDark } = useTheme();
  const [hovered, setHovered] = useState<number | null>(null);

  const bg = darkMode ? '#0F0F0F' : '#FFF8F5';
  const surface = darkMode ? '#1C1C1C' : '#FFFFFF';
  const text = darkMode ? '#F0EAE8' : '#2A1A1A';
  const muted = darkMode ? '#777' : '#9B7575';
  const border = darkMode ? '#2A2A2A' : '#F5D5DC';

  return (
    <div style={{ background: bg, color: text, minHeight: '100vh', fontFamily: '"DM Sans", sans-serif', transition: 'background 0.3s, color 0.3s' }}>
      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(16px)', background: darkMode ? 'rgba(15,15,15,0.85)' : 'rgba(255,248,245,0.85)', borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px', animation: 'beePulse 3s infinite', display: 'inline-block' }}>🐝</span>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: '#E8799A', fontStyle: 'italic' }}>Beeplanner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Dark mode toggle */}
            <button onClick={toggleDark} style={{ width: '52px', height: '28px', borderRadius: '14px', background: darkMode ? '#E8799A' : '#E0E0E0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }} title={darkMode ? 'Modo claro' : 'Modo escuro'}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: darkMode ? '27px' : '3px', transition: 'left 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                {darkMode ? <Moon size={11} color="#E8799A" /> : <Sun size={11} color="#F9C784" />}
              </div>
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '8px 16px', background: 'transparent', border: `1.5px solid ${border}`, borderRadius: '10px', color: text, cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
              Entrar
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #F4A5B8, #E8799A)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 14px rgba(244,165,184,0.4)' }}>
              Começar grátis
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: darkMode ? '#252525' : '#FFF0EC', border: `1px solid ${border}`, borderRadius: '20px', fontSize: '13px', color: '#E8799A', marginBottom: '28px', fontWeight: 500 }}>
            <span>✨</span> Planner minimalista e fofo
          </div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(42px, 5vw, 68px)', lineHeight: 1.1, marginBottom: '20px', animation: 'slideUp 0.6s ease forwards' }}>
            Organize sua vida<br />
            <span style={{ color: '#E8799A', fontStyle: 'italic' }}>com doçura</span> 🍯
          </h1>
          <p style={{ fontSize: '18px', color: muted, lineHeight: 1.7, marginBottom: '36px', maxWidth: '440px', animation: 'slideUp 0.7s ease forwards' }}>
            Planeje sua semana, acompanhe hábitos, salve datas importantes e organize tudo em pastas — tudo em um lugar só, bonito e rápido.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', animation: 'slideUp 0.8s ease forwards' }}>
            <button onClick={() => navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'linear-gradient(135deg, #F4A5B8, #E8799A)', border: 'none', borderRadius: '14px', color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 700, boxShadow: '0 8px 24px rgba(244,165,184,0.45)', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
              Começar grátis <ChevronRight size={18} />
            </button>
            <button onClick={() => navigate('/login')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', background: 'transparent', border: `1.5px solid ${border}`, borderRadius: '14px', color: text, cursor: 'pointer', fontSize: '15px', fontWeight: 500 }}>
              Ver demonstração
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '28px', fontSize: '13px', color: muted }}>
            <CheckCircle size={15} color="#6DC88A" />
            <span>Grátis para sempre</span>
            <span style={{ margin: '0 4px' }}>·</span>
            <CheckCircle size={15} color="#6DC88A" />
            <span>Sem cartão de crédito</span>
            <span style={{ margin: '0 4px' }}>·</span>
            <CheckCircle size={15} color="#6DC88A" />
            <span>Open source</span>
          </div>
        </div>

        {/* Calendar preview */}
        <div style={{ position: 'relative', animation: 'slideUp 0.9s ease forwards' }}>
          {/* Floating decorations */}
          <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '40px', animation: 'float 5s ease-in-out infinite', zIndex: 2 }}>🐝</div>
          <div style={{ position: 'absolute', bottom: '20px', left: '-20px', fontSize: '28px', animation: 'float 7s ease-in-out infinite 1s', zIndex: 2 }}>🌸</div>
          <div style={{ position: 'absolute', top: '40%', right: '-30px', fontSize: '24px', animation: 'float 6s ease-in-out infinite 2s', zIndex: 2 }}>✨</div>
          {/* Glow blob */}
          <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(244,165,184,0.3) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(20px)' }} />
          <CalendarPreview dark={darkMode} />
        </div>
      </section>

      {/* THEMES SHOWCASE */}
      <section style={{ background: darkMode ? '#151515' : '#FDF3F5', padding: '80px 24px', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '40px', marginBottom: '12px', fontStyle: 'italic' }}>
            🎨 Temas para cada momento
          </h2>
          <p style={{ color: muted, fontSize: '16px', marginBottom: '48px' }}>Pasteis fofos, tons profissionais ou dark mode — você escolhe</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {THEMES_PREVIEW.map((t, i) => (
              <div key={t.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => { setHovered(i); (e.currentTarget as HTMLElement).style.transform = 'scale(1.08) translateY(-4px)'; }}
                onMouseLeave={e => { setHovered(null); (e.currentTarget as HTMLElement).style.transform = 'scale(1) translateY(0)'; }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: t.gradient, boxShadow: hovered === i ? `0 8px 20px rgba(0,0,0,0.2)` : `0 3px 10px rgba(0,0,0,0.1)`, transition: 'box-shadow 0.2s', border: `3px solid ${hovered === i ? 'white' : 'transparent'}` }} />
                <span style={{ fontSize: '11px', color: muted, fontWeight: 500 }}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '44px', marginBottom: '12px', fontStyle: 'italic' }}>
            Tudo que você precisa
          </h2>
          <p style={{ color: muted, fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>
            Um planner completo que cresce com você, sem complexidade desnecessária.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: surface, borderRadius: '20px', padding: '28px', border: `1px solid ${border}`, transition: 'all 0.25s', cursor: 'default' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(244,165,184,0.15)'; (e.currentTarget as HTMLElement).style.borderColor = '#F4A5B8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = border; }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: darkMode ? '#252525' : '#FFF0EC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#E8799A' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: muted, fontSize: '14px', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROFESSIONS */}
      <section style={{ background: darkMode ? '#151515' : '#FDF3F5', padding: '80px 24px', borderTop: `1px solid ${border}` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '40px', marginBottom: '12px', fontStyle: 'italic' }}>
            Feito para o seu universo 🌍
          </h2>
          <p style={{ color: muted, fontSize: '16px', marginBottom: '48px' }}>Temas automáticos por área de atuação</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['💻 Dev / Tech', '🩺 Medicina', '⚖️ Direito', '⚙️ Engenharia', '🐾 Veterinária', '🧠 Psicologia', '🎨 Design', '📊 Negócios'].map((p) => (
              <div key={p} style={{ padding: '10px 20px', background: surface, border: `1px solid ${border}`, borderRadius: '100px', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #F4A5B8, #E8799A)'; (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = surface; (e.currentTarget as HTMLElement).style.color = text; (e.currentTarget as HTMLElement).style.borderColor = border; }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, #F4A5B8 0%, #E8799A 50%, #F9C784 100%)', borderRadius: '28px', padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '20px', fontSize: '80px', opacity: 0.15 }}>🐝</div>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '42px', color: 'white', marginBottom: '16px' }}>
            Pronta para começar?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '17px', marginBottom: '36px' }}>
            Crie sua conta grátis e organize sua vida hoje mesmo 🌸
          </p>
          <button onClick={() => navigate('/login')} style={{ padding: '16px 40px', background: 'white', border: 'none', borderRadius: '14px', color: '#E8799A', fontSize: '16px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.03)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'}>
            Criar conta grátis 🐝
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>🐝</span>
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '20px', color: '#E8799A', fontStyle: 'italic' }}>Beeplanner</span>
        </div>
        <p style={{ fontSize: '13px', color: muted }}>Feito com 🍯 e muito carinho • {new Date().getFullYear()}</p>
      </footer>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes beePulse { 0%,100% { transform: scale(1) rotate(-5deg); } 50% { transform: scale(1.08) rotate(5deg); } }
        @keyframes float { 0%,100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-18px) rotate(2deg); } }
      `}</style>
    </div>
  );
}
