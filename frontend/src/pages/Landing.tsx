// src/pages/Landing.tsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const THEMES = {
  default:  { p: '#F4A5B8', pd: '#E8799A', a: '#F9C784' },
  rosa:     { p: '#FF6FA8', pd: '#E0547E', a: '#FFB3CC' },
  roxo:     { p: '#B56EFF', pd: '#9B4EEA', a: '#FF79C6' },
  azul:     { p: '#7EC8E3', pd: '#5AB4D3', a: '#B3E5FC' },
  navy:     { p: '#4A90D9', pd: '#2A70C2', a: '#64B5F6' },
  verde:    { p: '#6DC88A', pd: '#4DAA6A', a: '#A8E6C0' },
  lilas:    { p: '#C3A8F0', pd: '#A888D8', a: '#F4C2FF' },
  pessego:  { p: '#FFAB76', pd: '#F08040', a: '#FFD0A8' },
  neon:     { p: '#FF6B9D', pd: '#E8508A', a: '#00D4FF' },
};

type ThemeKey = keyof typeof THEMES;

const THEME_LABELS: Record<ThemeKey, string> = {
  default: 'Rosa Mel 🐝', rosa: 'Rosa 🌸', roxo: 'Roxo 🔮',
  azul: 'Azul 🌊', navy: 'Navy 🌙', verde: 'Verde 🌿',
  lilas: 'Lilás 💜', pessego: 'Pêssego 🍑', neon: 'Neon 🌈',
};

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const calRef = useRef<HTMLDivElement>(null);

  // Fill calendar dates
  useEffect(() => {
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById('ld' + i);
      if (el) {
        const d = new Date(now);
        d.setDate(now.getDate() - now.getDay() + i);
        el.textContent = String(d.getDate());
      }
    }
  }, []);

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  function applyThemePreview(key: ThemeKey) {
    const t = THEMES[key];
    const r = document.documentElement;
    r.style.setProperty('--primary', t.p);
    r.style.setProperty('--primary-dark', t.pd);
    r.style.setProperty('--accent', t.a);
    localStorage.setItem('bp_theme', key);
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px',
        backdropFilter: 'blur(20px) saturate(160%)',
        background: 'rgba(255,248,245,.82)',
        borderBottom: '1px solid rgba(245,213,220,.55)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <span style={{ fontSize: 24, animation: 'beePulse 4s ease-in-out infinite', display: 'inline-block' }}>🐝</span>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontStyle: 'italic', color: 'var(--primary-dark)' }}>Beeplanner</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isAuthenticated
            ? <button onClick={() => navigate('/app')} style={navBtnStyle(true)}>Ir para o app →</button>
            : <>
                <button onClick={() => navigate('/auth')} style={navBtnStyle(false)}>Entrar</button>
                <button onClick={() => navigate('/auth?mode=register')} style={navBtnStyle(true)}>Começar grátis</button>
              </>
          }
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center',
        padding: '80px 60px 60px', position: 'relative', overflow: 'hidden',
      }}>
        {/* background glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 55% 45% at 80% 25%, rgba(244,165,184,.22) 0%, transparent 60%), radial-gradient(ellipse 40% 40% at 15% 80%, rgba(249,199,132,.14) 0%, transparent 55%)',
        }}/>

        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', position: 'relative', zIndex: 1, width: '100%' }}>

          {/* Left */}
          <div className="reveal">
            {/* Eyebrow */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px 5px 10px',
              background: 'rgba(244,165,184,.12)', border: '1px solid rgba(244,165,184,.35)',
              borderRadius: 99, fontSize: 13, color: 'var(--primary-dark)', fontWeight: 500,
              marginBottom: 26,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-dark)', display: 'inline-block', animation: 'blink 2.5s ease-in-out infinite' }}/>
              Planner minimalista &amp; fofo
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(50px, 5.5vw, 78px)',
              fontWeight: 400, lineHeight: 1.04, letterSpacing: '-.5px',
              marginBottom: 22,
            }}>
              Organize sua vida<br/>
              <em style={{ color: 'var(--primary-dark)', fontStyle: 'italic' }}>com doçura</em> 🍯
            </h1>

            <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.78, marginBottom: 38, maxWidth: 430, fontWeight: 300 }}>
              Planeje semanas, acompanhe hábitos, salve datas especiais e organize tudo em pastas — num lugar bonito, rápido e que você vai amar usar.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
              <button onClick={() => navigate('/auth?mode=register')} style={{ ...navBtnStyle(true), fontSize: 16, padding: '14px 30px', borderRadius: 13 }}>
                Criar conta grátis
              </button>
              <button onClick={() => navigate('/auth?mode=demo')} style={{ ...navBtnStyle(false), fontSize: 15, padding: '14px 24px', borderRadius: 13 }}>
                Ver demo 👀
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--muted)' }}>
              <div style={{ display: 'flex' }}>
                {['🐝','🌸','✨','🦋'].map((e,i) => (
                  <span key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, marginLeft: i ? -8 : 0 }}>{e}</span>
                ))}
              </div>
              Grátis · Sem cartão · Login com Google
            </div>
          </div>

          {/* Right: Calendar mock */}
          <div style={{ position: 'relative' }} className="reveal" data-delay="150">
            <span style={{ position: 'absolute', top: -24, right: -10, fontSize: 38, zIndex: 2, animation: 'float 5s ease-in-out infinite', pointerEvents: 'none' }}>🐝</span>
            <span style={{ position: 'absolute', bottom: 20, left: -24, fontSize: 24, zIndex: 2, animation: 'float 7s ease-in-out infinite 1.5s', pointerEvents: 'none' }}>🌸</span>

            <div ref={calRef} style={{
              background: 'var(--surface)', borderRadius: 22,
              border: '1px solid var(--border)', overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(244,165,184,.06), 0 24px 60px -8px rgba(61,43,43,.14), 0 4px 20px rgba(244,165,184,.12)',
              transform: 'perspective(1000px) rotateY(-3deg) rotateX(1deg)',
              transition: 'transform .4s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'perspective(1000px) rotateY(-3deg) rotateX(1deg)')}
            >
              {/* Cal header */}
              <div style={{ padding: '13px 18px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🐝</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Minha Semana</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Beeplanner</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {['#FF5F57','#FFBD2E','#28CA40'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'block' }}/>)}
                </div>
              </div>

              {/* Cal columns header */}
              <div style={{ display: 'grid', gridTemplateColumns: '48px repeat(5,1fr)', borderBottom: '1px solid var(--border)' }}>
                <div style={calColH(false)}/>
                {[['Seg','ld1',false],['Ter','ld2',true],['Qua','ld3',false],['Qui','ld4',false],['Sex','ld5',false]].map(([d,id,tod]) => (
                  <div key={id as string} style={calColH(tod as boolean)}>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--muted)' }}>{d}</span>
                    <span id={id as string} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: tod ? 'var(--primary-dark)' : 'var(--text)', display: 'block', marginTop: 1 }}/>
                  </div>
                ))}
              </div>

              {/* Cal rows */}
              {[
                { time: '9h',  cols: [null, {t:'☀️ Daily',c:'#F4A5B8'}, null, {t:'🎨 Design',c:'#7EC8E3'}, null] },
                { time: '10h', cols: [{t:'📐 UX',c:'#C3A8F0'}, null, null, null, {t:'1:1 Ana',c:'#A8E6C0'}] },
                { time: '12h', cols: [null, {t:'🍱 Almoço',c:'#F9C784'}, {t:'🍱 Almoço',c:'#F9C784'}, null, null] },
                { time: '14h', cols: [null, null, {t:'💻 Review',c:'#F4A5B8'}, null, {t:'🚀 Deploy',c:'#B56EFF'}] },
              ].map((row, ri) => (
                <div key={ri} style={{ display: 'grid', gridTemplateColumns: '48px repeat(5,1fr)', borderBottom: ri < 3 ? '1px solid var(--border)' : 'none', minHeight: 50 }}>
                  <div style={{ padding: '6px 7px 0', textAlign: 'right', fontSize: 10, color: 'var(--muted)' }}>{row.time}</div>
                  {row.cols.map((chip, ci) => (
                    <div key={ci}>
                      {chip && (
                        <div style={{ margin: '4px 3px', borderRadius: 7, padding: '4px 8px', fontSize: 11, fontWeight: 600, borderLeft: `3px solid ${chip.c}`, background: chip.c + '20', color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {chip.t}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STRIP ── */}
      <div style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '18px 60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
        {[['✅','100% Gratuito'],['🔐','Google & GitHub OAuth2'],['🎨','9 temas únicos'],['📱','Mobile friendly'],['🌙','Dark mode'],['🐝','Feito com carinho']].map(([ico,txt]) => (
          <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--muted)' }}>
            <span style={{ fontSize: 16 }}>{ico}</span>{txt}
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '96px 60px' }}>
        <div className="reveal">
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--primary-dark)', marginBottom: 14 }}>O que tem no app</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,4vw,52px)', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.1 }}>Tudo que você precisa 🐝</h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 500, lineHeight: 1.75, fontWeight: 300, marginBottom: 52 }}>Um planner completo, bonito e sem complicação — feito pra quem quer organizar a vida com leveza.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            ['📅','Semana visual','Grid limpo com todos os dias. Adicione tarefas em qualquer dia, defina prioridades com cores.'],
            ['🗓','Calendário Mensal','Visão macro do mês inteiro com tarefas e datas importantes integradas.'],
            ['📝','Notas & Pastas','Espaços de trabalho com páginas aninhadas — como o Notion, mas mais fofo.'],
            ['🌱','Rastreador de Hábitos','Acompanhe hábitos com marcação dos últimos 7 dias. Streaks visuais.'],
            ['⭐','Datas Importantes','Aniversários, formaturas, eventos — nunca mais esqueça uma data especial.'],
            ['🔐','Login seguro','Google, GitHub, e-mail ou telefone. Seus dados ficam salvos e protegidos.'],
          ].map(([ico, title, desc]) => (
            <div key={title as string} className="reveal" style={{
              padding: 28, borderRadius: 20,
              border: '1px solid var(--border)', background: 'var(--surface)',
              transition: 'all .22s ease', cursor: 'default',
            }}
              onMouseEnter={e => { Object.assign(e.currentTarget.style, { transform: 'translateY(-6px)', boxShadow: '0 20px 48px var(--shadow)', borderColor: 'var(--primary)' }); }}
              onMouseLeave={e => { Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: 'none', borderColor: 'var(--border)' }); }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 23, marginBottom: 18, border: '1px solid var(--border)' }}>{ico}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, fontWeight: 300 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── THEMES ── */}
      <div style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 60px', textAlign: 'center' }}>
        <div className="reveal">
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--primary-dark)', marginBottom: 14 }}>Personalização</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(34px,4vw,50px)', fontStyle: 'italic', marginBottom: 10 }}>9 temas únicos 🎨</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 300, marginBottom: 0 }}>Pastéis fofos, tons profissionais ou dark neon — você escolhe</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 44 }}>
            {(Object.entries(THEMES) as [ThemeKey, typeof THEMES[ThemeKey]][]).map(([key, val]) => (
              <div key={key} onClick={() => applyThemePreview(key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 16,
                  background: `linear-gradient(135deg,${val.p},${val.a})`,
                  border: '2.5px solid transparent', transition: 'all .22s',
                  boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                }}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-6px) scale(1.08)', boxShadow: '0 12px 24px rgba(0,0,0,.14)' })}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.08)' })}
                />
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{THEME_LABELS[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 60px' }}>
        <div className="reveal" style={{
          background: 'linear-gradient(135deg,var(--primary-dark) 0%,#C45880 40%,var(--accent) 100%)',
          borderRadius: 28, padding: '70px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <span style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', fontSize: 100, opacity: .1, animation: 'beePulse 5s infinite', pointerEvents: 'none' }}>🐝</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, color: 'white', marginBottom: 14, fontStyle: 'italic' }}>Pronta para começar?</h2>
          <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 17, marginBottom: 36, fontWeight: 300 }}>Crie sua conta grátis e organize sua vida hoje mesmo 🌸</p>
          <button onClick={() => navigate('/auth?mode=register')} style={{ background: 'white', color: 'var(--primary-dark)', fontSize: 16, padding: '15px 38px', borderRadius: 14, border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,.15)', fontFamily: "'DM Sans',system-ui,sans-serif", transition: 'transform .2s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
          >Criar conta grátis 🐝</button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>🐝 <strong>Beeplanner</strong> — Feito com 🍯 e muito carinho</p>
        <div style={{ display: 'flex', gap: 22 }}>
          {['Privacidade','Termos','Login'].map(l => (
            <span key={l} onClick={() => l === 'Login' && navigate('/auth')} style={{ fontSize: 13, color: 'var(--muted)', cursor: 'pointer', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary-dark)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >{l}</span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes beePulse { 0%,100%{transform:scale(1) rotate(-4deg)} 50%{transform:scale(1.07) rotate(4deg)} }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(3deg)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        @media(max-width:960px){
          section { padding: 80px 28px 60px !important; }
          section > div > div { grid-template-columns: 1fr !important; gap: 50px !important; }
          nav { padding: 0 28px !important; }
          footer { padding: 28px !important; flex-direction: column; gap: 14px; text-align: center; }
        }
        @media(max-width:640px){
          div[style*="repeat(3,1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ──
function navBtnStyle(primary: boolean): React.CSSProperties {
  return primary
    ? { background: 'linear-gradient(135deg,var(--primary-dark),#D4668A)', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',system-ui,sans-serif", boxShadow: '0 4px 16px var(--shadow)', transition: 'all .22s' }
    : { background: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border)', padding: '9px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',system-ui,sans-serif", transition: 'all .22s' };
}

function calColH(today: boolean): React.CSSProperties {
  return {
    padding: '10px 6px', textAlign: 'center',
    background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    color: today ? 'var(--primary-dark)' : undefined,
  };