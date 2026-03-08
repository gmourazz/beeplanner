// src/pages/Auth.tsx
// Integra com o AuthContext existente (login, register, updateUser)
// Suporta: email+senha, cadastro em 3 etapas, Google OAuth2, GitHub OAuth2, telefone (SMS)

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type Tab    = 'login' | 'register';
type Method = 'email' | 'phone';
type Step   = 1 | 2 | 3;

const DEMO_EMAIL = 'demo@beeplanner.app';
const DEMO_PASS  = 'admin123';
const API_URL    = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, login, register } = useAuth();

  // ── State ──────────────────────────────────────────
  const [tab,     setTab]    = useState<Tab>(params.get('mode') === 'register' ? 'register' : 'login');
  const [method,  setMethod] = useState<Method>('email');
  const [step,    setStep]   = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]  = useState('');
  const [info,    setInfo]   = useState('');

  // Login
  const [lEmail, setLEmail] = useState('');
  const [lPass,  setLPass]  = useState('');
  const [showP,  setShowP]  = useState(false);

  // Register
  const [rName,    setRName]    = useState('');
  const [rEmail,   setREmail]   = useState('');
  const [rPass,    setRPass]    = useState('');
  const [rConfirm, setRConfirm] = useState('');
  const [strength, setStrength] = useState(0);

  // Phone
  const [phoneCode, setPhoneCode] = useState('+55');
  const [phoneNum,  setPhoneNum]  = useState('');
  const [smsSent,   setSmsSent]   = useState(false);
  const [digits,    setDigits]    = useState(['','','','','','']);
  const [devCode,   setDevCode]   = useState('');
  const [resend,    setResend]    = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Redirect if logged in ──────────────────────────
  useEffect(() => { if (user) navigate('/app'); }, [user]);

  // ── URL param: demo ────────────────────────────────
  useEffect(() => {
    if (params.get('mode') === 'demo') {
      setTab('login'); setMethod('email');
      setLEmail(DEMO_EMAIL); setLPass(DEMO_PASS);
      setInfo('Dados demo preenchidos!');
    }
    // OAuth token callback
    const token = params.get('token');
    if (token) handleOAuthToken(token);
  }, []);

  // ── Resend timer ───────────────────────────────────
  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  function clear() { setError(''); setInfo(''); }

  // ── OAuth token from redirect ──────────────────────
  async function handleOAuthToken(token: string) {
    try {
      localStorage.setItem('bp_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const { data } = await api.get('/auth/me');
      // Inject user directly (AuthContext will catch from localStorage on next mount)
      window.location.href = '/app';
    } catch {
      setError('Erro ao autenticar via OAuth.');
    }
  }

  // ── Email Login ────────────────────────────────────
  async function doLogin() {
    clear();
    if (!lEmail || !lPass) { setError('Preencha e-mail e senha.'); return; }
    setLoading(true);
    try {
      await login(lEmail, lPass);   // usa o AuthContext existente
      navigate('/app');
    } catch (e: any) {
      setError(e.response?.data?.error || 'E-mail ou senha incorretos.');
    } finally { setLoading(false); }
  }

  // ── Register step 1 ───────────────────────────────
  function next1() {
    clear();
    if (!rName.trim())                           { setError('Digite seu nome.'); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(rEmail))   { setError('E-mail inválido.'); return; }
    setStep(2);
  }

  // ── Register step 2 ───────────────────────────────
  function next2() {
    clear();
    if (rPass.length < 8)        { setError('Senha deve ter mínimo 8 caracteres.'); return; }
    if (rPass !== rConfirm)      { setError('As senhas não coincidem.'); return; }
    setStep(3);
  }

  // ── Register submit ───────────────────────────────
  async function doRegister() {
    clear(); setLoading(true);
    try {
      await register(rName, rEmail, rPass); // usa o AuthContext existente
      navigate('/app');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erro ao criar conta.');
      setStep(1);
    } finally { setLoading(false); }
  }

  // ── Password strength ─────────────────────────────
  function calcStrength(v: string) {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    setStrength(s);
  }
  const strColor = ['','#E05050','#F0A040','#F9C784','#3AAA6A'][strength];
  const strLabel = ['','Muito fraca','Fraca','Boa','Forte 💪'][strength];

  // ── SMS ───────────────────────────────────────────
  async function sendSMS() {
    clear();
    const clean = phoneNum.replace(/\D/g,'');
    if (clean.length < 8) { setError('Número inválido.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/phone/send', { phone: phoneCode + clean });
      setSmsSent(true); setResend(60);
      if (data.devCode) { setDevCode(data.devCode); setInfo(`Dev: código ${data.devCode}`); }
      else setInfo('Código enviado!');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erro ao enviar SMS.');
    } finally { setLoading(false); }
  }

  async function verifySMS() {
    clear();
    const code = digits.join('');
    if (code.length < 6) { setError('Digite o código completo.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/phone/verify', { phone: phoneCode + phoneNum.replace(/\D/g,''), code });
      localStorage.setItem('bp_token', data.token);
      navigate('/app');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Código incorreto.');
    } finally { setLoading(false); }
  }

  function onDigit(idx: number, val: string) {
    const d = [...digits];
    d[idx] = val.replace(/\D/,'').slice(-1);
    setDigits(d);
    if (val && idx < 5) codeRefs.current[idx+1]?.focus();
  }

  function formatPhone(v: string) {
    const d = v.replace(/\D/g,'').slice(0,11);
    if (d.length > 6) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    if (d.length > 2) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return d;
  }

  function switchTab(t: Tab) { setTab(t); setStep(1); clear(); setSmsSent(false); }

  // ── Render ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', system-ui, sans-serif", background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: 420, minWidth: 420, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: 48, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg,#E8799A 0%,#C45880 52%,#D4A060 100%)',
      }}
        className="auth-left-panel"
      >
        {/* floating deco */}
        {[
          { top: '14%', right: 32,  size: 36, delay: '0s'  },
          { bottom: '26%', left: 20, size: 22, delay: '2s'  },
          { bottom: '14%', right: 60, size: 18, delay: '4s' },
        ].map((s, i) => (
          <span key={i} style={{ position: 'absolute', pointerEvents: 'none', fontSize: s.size, animation: `float 7s ease-in-out infinite ${s.delay}`, ...s } as React.CSSProperties}>
            {['🐝','🌸','✨'][i]}
          </span>
        ))}

        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{ fontSize: 28, animation: 'beePulse 4s ease-in-out infinite', display: 'inline-block' }}>🐝</span>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontStyle: 'italic', color: 'white' }}>Beeplanner</span>
        </a>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontStyle: 'italic', color: 'white', lineHeight: 1.1, marginBottom: 14 }}>
            Organize sua vida<br/>com doçura 🍯
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.78)', lineHeight: 1.75, fontWeight: 300, maxWidth: 290 }}>
            Um planner bonito e completo pra quem quer mais leveza no dia a dia.
          </p>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['📅','Vista sua semana toda de um jeito visual'],['🌱','Acompanhe seus hábitos diários'],['⭐','Nunca esqueça uma data importante'],['🎨','9 temas únicos pra personalizar']].map(([ico, txt]) => (
              <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.9)', fontSize: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{ico}</div>
                {txt}
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>🐝 Beeplanner · Feito com carinho</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp .4s ease' }}>

          {/* Back */}
          <button onClick={() => navigate('/')} style={ghostBtn}>← Voltar ao início</button>

          {/* Header */}
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontStyle: 'italic', marginBottom: 6, lineHeight: 1.1, marginTop: 20 }}>
            {tab === 'login' ? 'Bem-vinda de volta 🌸' : 'Criar sua conta 🐝'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 300, marginBottom: 24 }}>
            {tab === 'login' ? 'Entre na sua conta para continuar' : 'Preencha os dados abaixo'}
          </p>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, gap: 4, marginBottom: 22 }}>
            {(['login','register'] as Tab[]).map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex: 1, padding: '9px 8px', border: 'none', borderRadius: 9,
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--muted)',
                fontFamily: "'DM Sans',system-ui,sans-serif",
                fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,.08)' : 'none',
                transition: 'all .2s',
              }}>
                {t === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Demo hint */}
          {tab === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface2)', fontSize: 13, color: 'var(--muted)', marginBottom: 18 }}>
              <span>🎯</span>
              <span><strong style={{ color: 'var(--primary-dark)' }}>Demo:</strong> {DEMO_EMAIL} / {DEMO_PASS}</span>
              <button onClick={() => { setLEmail(DEMO_EMAIL); setLPass(DEMO_PASS); setInfo('Dados preenchidos!'); }} style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--primary-dark)', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Preencher →</button>
            </div>
          )}

          {/* Alerts */}
          {error && <Alert type="err">{error}</Alert>}
          {info  && <Alert type="ok">{info}</Alert>}

          {/* OAuth */}
          <button style={oauthFullBtn} onClick={() => window.location.href = `${API_URL}/api/auth/google`}>
            <GoogleIcon/> Continuar com Google
            <span style={{ position: 'absolute', right: 12, fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--accent)', color: '#5A3A00', fontWeight: 700 }}>OAuth2</span>
          </button>
          <div style={{ display: 'flex', gap: 10, marginBottom: 2 }}>
            <button style={oauthHalfBtn} onClick={() => window.location.href = `${API_URL}/api/auth/github`}>
              <GitHubIcon/> GitHub
            </button>
            <button style={oauthHalfBtn} onClick={() => setInfo('Apple login em breve!')}>
              <AppleIcon/> Apple
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0', color: 'var(--muted)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.8px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            ou use
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          </div>

          {/* Method tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['email','phone'] as Method[]).map(m => (
              <button key={m} onClick={() => { setMethod(m); clear(); setSmsSent(false); }} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px', borderRadius: 10,
                border: `1.5px solid ${method === m ? 'var(--primary-dark)' : 'var(--border)'}`,
                background: method === m ? 'var(--surface2)' : 'transparent',
                color: method === m ? 'var(--primary-dark)' : 'var(--muted)',
                fontFamily: "'DM Sans',system-ui,sans-serif",
                fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
              }}>
                {m === 'email' ? '✉️' : '📱'} {m === 'email' ? 'E-mail' : 'Telefone'}
              </button>
            ))}
          </div>

          {/* ══ EMAIL ══ */}
          {method === 'email' && (
            <>
              {/* LOGIN */}
              {tab === 'login' && (
                <>
                  <Field label="E-mail">
                    <input style={inputStyle} type="email" placeholder="seu@email.com" value={lEmail} onChange={e => setLEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} autoComplete="email"/>
                  </Field>
                  <Field label={<span style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>Senha <button onClick={() => setInfo('Recuperação disponível com backend ativo 🔐')} style={{ ...ghostBtn, fontSize: 11, padding: 0 }}>Esqueceu?</button></span>}>
                    <div style={{ position: 'relative' }}>
                      <input style={inputStyle} type={showP ? 'text' : 'password'} placeholder="••••••••" value={lPass} onChange={e => setLPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} autoComplete="current-password"/>
                      <button onClick={() => setShowP(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: .55, fontSize: 15 }}>{showP ? '🙈' : '👁'}</button>
                    </div>
                  </Field>
                  <SubmitBtn onClick={doLogin} loading={loading}>Entrar ✨</SubmitBtn>
                </>
              )}

              {/* REGISTER */}
              {tab === 'register' && (
                <>
                  {/* Step dots */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ height: 8, borderRadius: 99, transition: 'all .3s', width: step > i ? 8 : step === i ? 22 : 8, background: step > i ? '#3AAA6A' : step === i ? 'var(--primary-dark)' : 'var(--border)' }}/>
                    ))}
                    <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)' }}>Passo {step} de 3</span>
                  </div>

                  {step === 1 && (
                    <>
                      <Field label="Nome completo">
                        <input style={inputStyle} type="text" placeholder="Seu nome..." value={rName} onChange={e => setRName(e.target.value)} autoComplete="name"/>
                      </Field>
                      <Field label="E-mail">
                        <input style={inputStyle} type="email" placeholder="seu@email.com" value={rEmail} onChange={e => setREmail(e.target.value)} autoComplete="email"/>
                      </Field>
                      <SubmitBtn onClick={next1}>Próximo →</SubmitBtn>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Field label="Criar senha">
                        <div style={{ position: 'relative' }}>
                          <input style={inputStyle} type={showP ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={rPass} onChange={e => { setRPass(e.target.value); calcStrength(e.target.value); }} autoComplete="new-password"/>
                          <button onClick={() => setShowP(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: .55, fontSize: 15 }}>{showP ? '🙈' : '👁'}</button>
                        </div>
                        {rPass && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ height: 4, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 99, transition: 'all .3s', width: `${strength * 25}%`, background: strColor }}/>
                            </div>
                            <p style={{ fontSize: 11, marginTop: 4, color: strColor }}>{strLabel}</p>
                          </div>
                        )}
                      </Field>
                      <Field label="Confirmar senha">
                        <input style={inputStyle} type="password" placeholder="Repita a senha" value={rConfirm} onChange={e => setRConfirm(e.target.value)} autoComplete="new-password"/>
                      </Field>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setStep(1)} style={{ ...submitStyle, flex: '0 0 80px', background: 'var(--surface2)', color: 'var(--text)', border: '1.5px solid var(--border)', boxShadow: 'none' }}>← Voltar</button>
                        <SubmitBtn onClick={next2} style={{ flex: 1 }}>Próximo →</SubmitBtn>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <div style={{ fontSize: 56, marginBottom: 16, animation: 'beePulse 2s infinite', display: 'inline-block' }}>🐝</div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontStyle: 'italic', marginBottom: 8 }}>Tudo pronto! ✨</h3>
                      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
                        Seja bem-vinda, <strong>{rName.split(' ')[0]}</strong>!
                      </p>
                      <SubmitBtn onClick={doRegister} loading={loading}>Entrar no app 🚀</SubmitBtn>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ══ PHONE ══ */}
          {method === 'phone' && !smsSent && (
            <>
              <Field label="Número de telefone">
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} style={{ ...inputStyle, width: 90, flexShrink: 0, cursor: 'pointer' }}>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+351">🇵🇹 +351</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+34">🇪🇸 +34</option>
                  </select>
                  <input style={{ ...inputStyle, flex: 1 }} type="tel" placeholder="(11) 99999-9999" value={phoneNum} onChange={e => setPhoneNum(formatPhone(e.target.value))}/>
                </div>
              </Field>
              <SubmitBtn onClick={sendSMS} loading={loading}>Enviar código SMS 📲</SubmitBtn>
            </>
          )}

          {method === 'phone' && smsSent && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📲</div>
                <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                  Código enviado para <strong>{phoneCode} {phoneNum}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => (codeRefs.current[i] = el)}
                    value={d}
                    onChange={e => onDigit(i, e.target.value)}
                    onKeyDown={e => e.key === 'Backspace' && !d && i > 0 && codeRefs.current[i-1]?.focus()}
                    style={{
                      width: 52, height: 58, borderRadius: 12, textAlign: 'center',
                      border: '1.5px solid var(--border)', background: 'var(--surface2)',
                      color: 'var(--text)', fontSize: 24, fontWeight: 600,
                      fontFamily: "'Cormorant Garamond',serif",
                      outline: 'none', transition: 'border-color .2s',
                    }}
                    maxLength={1}
                  />
                ))}
              </div>
              <SubmitBtn onClick={verifySMS} loading={loading}>Verificar código ✅</SubmitBtn>
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--muted)' }}>
                <button onClick={() => { setSmsSent(false); setDigits(['','','','','','']); }} style={ghostBtn}>Trocar número</button>
                {' · '}
                <button onClick={sendSMS} disabled={resend > 0} style={{ ...ghostBtn, color: resend > 0 ? 'var(--muted)' : 'var(--primary-dark)' }}>
                  Reenviar {resend > 0 && `(${resend}s)`}
                </button>
              </p>
            </div>
          )}

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
            {tab === 'login'
              ? <>Não tem conta? <button onClick={() => switchTab('register')} style={{ ...ghostBtn, color: 'var(--primary-dark)', fontWeight: 600 }}>Criar agora →</button></>
              : <>Já tem conta? <button onClick={() => switchTab('login')} style={{ ...ghostBtn, color: 'var(--primary-dark)', fontWeight: 600 }}>Entrar →</button></>
            }
          </p>

        </div>
      </div>

      <style>{`
        @keyframes beePulse { 0%,100%{transform:scale(1) rotate(-4deg)} 50%{transform:scale(1.07) rotate(4deg)} }
        @keyframes float    { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-18px) rotate(3deg)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @media(max-width:840px) { .auth-left-panel { display: none !important; } }
      `}</style>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--muted)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Alert({ type, children }: { type: 'err' | 'ok'; children: React.ReactNode }) {
  const isErr = type === 'err';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, background: isErr ? '#FFF0F0' : '#EDFAF3', border: `1px solid ${isErr ? '#FFCCCC' : '#B8EDD1'}`, color: isErr ? '#E05050' : '#3AAA6A' }}>
      <span>{isErr ? '⚠️' : '✅'}</span>{children}
    </div>
  );
}

function SubmitBtn({ onClick, loading, children, style: extra }: { onClick: () => void; loading?: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} disabled={loading} style={{ ...submitStyle, ...extra }}>
      {loading ? '⏳ Aguarde...' : children}
    </button>
  );
}

// ── Shared styles ───────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  border: '1.5px solid var(--border)', borderRadius: 12,
  background: 'var(--surface2)', color: 'var(--text)',
  fontSize: 14, outline: 'none', transition: 'border-color .2s',
  fontFamily: "'DM Sans',system-ui,sans-serif",
};

const submitStyle: React.CSSProperties = {
  width: '100%', padding: '13px',
  background: 'linear-gradient(135deg,#E8799A,#D4668A)',
  color: 'white', border: 'none', borderRadius: 12,
  fontSize: 15, fontWeight: 600, cursor: 'pointer',
  fontFamily: "'DM Sans',system-ui,sans-serif",
  boxShadow: '0 4px 16px rgba(232,121,154,.3)',
  transition: 'all .2s', marginTop: 4,
};

const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--muted)', fontSize: 13, fontFamily: "'DM Sans',system-ui,sans-serif",
  padding: '2px 0', transition: 'color .2s',
};

const oauthFullBtn: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 18px', borderRadius: 12,
  border: '1.5px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text)', cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
  transition: 'all .2s', marginBottom: 10, position: 'relative',
  fontFamily: "'DM Sans',system-ui,sans-serif",
};

const oauthHalfBtn: React.CSSProperties = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text)', cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
  transition: 'all .2s', fontFamily: "'DM Sans',system-ui,sans-serif",
};

// ── SVG Icons ───────────────────────────────────────

function GoogleIcon() {
  return <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>;
}
function GitHubIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>;
}
function AppleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>;
}