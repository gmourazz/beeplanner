// src/pages/Auth2.tsx
// Autenticação: Google OAuth2, GitHub OAuth2, e-mail + senha, cadastro manual em 3 etapas
// Usa apenas Tailwind CSS

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Tab  = 'login' | 'register';
type Step = 1 | 2 | 3;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STR_BARS   = ['', 'bg-red-400',  'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
const STR_TEXT   = ['', 'text-red-400','text-orange-400','text-yellow-500','text-green-600'];
const STR_LABELS = ['', 'Muito fraca', 'Fraca',          'Boa',           'Forte 💪'];

const FEATURES = [
  ['📅', 'Vista sua semana toda de um jeito visual'],
  ['🌱', 'Acompanhe seus hábitos diários'],
  ['⭐', 'Nunca esqueça uma data importante'],
  ['🎨', '9 temas únicos pra personalizar'],
] as const;

// ── Shared class strings ─────────────────────────────────────
const inp     = 'w-full px-4 py-3 rounded-xl border border-[#F5D5DC] bg-[#FFF0EC] text-[#3D2B2B] text-sm placeholder:text-[#C4A0A8] focus:outline-none focus:border-honey-500 focus:ring-2 focus:ring-honey-500/20 transition-all font-body';
const btn     = 'w-full py-3.5 rounded-xl bg-gradient-to-r from-honey-500 to-honey-600 text-white text-sm font-semibold hover:opacity-90 active:scale-[.98] disabled:opacity-60 transition-all shadow-[0_4px_16px_rgba(232,121,154,.3)]';
const btnFlex = 'flex-1 py-3.5 rounded-xl bg-gradient-to-r from-honey-500 to-honey-600 text-white text-sm font-semibold hover:opacity-90 active:scale-[.98] disabled:opacity-60 transition-all shadow-[0_4px_16px_rgba(232,121,154,.3)]';
const oauthBtn = 'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-[#F5D5DC] bg-white hover:bg-[#FFF0EC] text-[#3D2B2B] text-sm font-medium transition-all cursor-pointer';
const label   = 'block text-[11px] font-semibold uppercase tracking-widest text-[#9B7575] mb-1.5';

// ────────────────────────────────────────────────────────────
export default function Auth2() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, login, register } = useAuth();

  // ── Armazena token OAuth ANTES de qualquer useEffect disparar ──
  // Isso evita race condition: AuthContext chama /auth/me com token
  // antigo antes de salvarmos o novo token da URL.
  const urlToken = params.get('token');
  if (urlToken) localStorage.setItem('bp_token', urlToken);

  const [tab,     setTab]    = useState<Tab>(params.get('mode') === 'register' ? 'register' : 'login');
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

  // Redirect: token OAuth na URL → /app; ou usuário já logado → /app
  useEffect(() => {
    if (urlToken) { window.location.replace('/app'); return; }
    if (user) navigate('/app', { replace: true });
  }, [user]);

  const clear = () => { setError(''); setInfo(''); };

  // ── Login ────────────────────────────────────────────────
  async function doLogin() {
    clear();
    if (!lEmail || !lPass) { setError('Preencha e-mail e senha.'); return; }
    setLoading(true);
    try {
      await login(lEmail, lPass);
      navigate('/app');
    } catch (e: any) {
      setError(e.response?.data?.error || 'E-mail ou senha incorretos.');
    } finally { setLoading(false); }
  }

  // ── Register steps ───────────────────────────────────────
  function next1() {
    clear();
    if (!rName.trim())                         { setError('Digite seu nome.'); return; }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(rEmail)) { setError('E-mail inválido.'); return; }
    setStep(2);
  }

  function next2() {
    clear();
    if (rPass.length < 8)   { setError('Senha deve ter mínimo 8 caracteres.'); return; }
    if (rPass !== rConfirm) { setError('As senhas não coincidem.'); return; }
    setStep(3);
  }

  async function doRegister() {
    clear();
    setLoading(true);
    try {
      await register(rName, rEmail, rPass);
      navigate('/app');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erro ao criar conta.');
      setStep(1);
    } finally { setLoading(false); }
  }

  function calcStrength(v: string) {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    setStrength(s);
  }

  function switchTab(t: Tab) { setTab(t); setStep(1); clear(); }

  // ── Render ───────────────────────────────────────────────
  // Enquanto redireciona via OAuth, mostra spinner
  if (urlToken) return (
    <div className="flex items-center justify-center h-screen bg-[#FFF8F5]">
      <span className="text-6xl animate-bee-pulse">🐝</span>
    </div>
  );

  return (
    <div className="min-h-screen flex font-body bg-[#FFF8F5] text-[#3D2B2B]">

      {/* ── LEFT PANEL (desktop only) ── */}
      <aside className="hidden lg:flex w-[440px] min-w-[440px] flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-[#E8799A] via-[#C45880] to-[#D4A060]">

        {/* Decorações flutuantes */}
        <span className="absolute top-[14%] right-8 text-4xl animate-float [animation-delay:0s] pointer-events-none select-none">🐝</span>
        <span className="absolute bottom-[26%] left-5 text-2xl animate-float [animation-delay:2s] pointer-events-none select-none">🌸</span>
        <span className="absolute bottom-[14%] right-16 text-xl animate-float [animation-delay:4s] pointer-events-none select-none">✨</span>

        {/* Logo */}
        <a href="/" className="flex items-center gap-3 no-underline">
          <span className="text-3xl animate-bee-pulse inline-block">🐝</span>
          <span className="font-display text-[26px] italic text-white leading-none">Beeplanner</span>
        </a>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center py-10">
          <h2 className="font-display text-[42px] italic text-white leading-[1.1] mb-4">
            Organize sua vida<br />com doçura 🍯
          </h2>
          <p className="text-[15px] text-white/75 leading-[1.75] font-light max-w-[290px] mb-8">
            Um planner bonito e completo pra quem quer mais leveza no dia a dia.
          </p>
          <div className="flex flex-col gap-3">
            {FEATURES.map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm shrink-0">
                  {icon}
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/40">🐝 Beeplanner · Feito com carinho</p>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-[420px] animate-fade-in">

          {/* Voltar */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-[#9B7575] hover:text-[#3D2B2B] transition-colors mb-6 group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
            Voltar ao início
          </button>

          {/* Header */}
          <h1 className="font-display text-[32px] italic leading-tight">
            {tab === 'login' ? 'Bem-vinda de volta 🌸' : 'Criar sua conta 🐝'}
          </h1>
          <p className="text-sm text-[#9B7575] mt-1.5 mb-6 font-light">
            {tab === 'login' ? 'Entre na sua conta para continuar' : 'Preencha os dados abaixo para começar'}
          </p>

          {/* Tab switcher */}
          <div className="flex bg-[#FFF0EC] border border-[#F5D5DC] rounded-xl p-1 gap-1 mb-5">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t
                    ? 'bg-white text-[#3D2B2B] shadow-sm'
                    : 'text-[#9B7575] hover:text-[#3D2B2B]'
                }`}
              >
                {t === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          {/* Alertas */}
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-red-200 bg-red-50 text-red-500 text-sm mb-4">
              <span>⚠️</span> {error}
            </div>
          )}
          {info && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-green-200 bg-green-50 text-green-600 text-sm mb-4">
              <span>✅</span> {info}
            </div>
          )}

          {/* ── OAuth buttons ── */}
          <button
            onClick={() => window.location.href = `${API_URL}/api/auth/google`}
            className={`${oauthBtn} mb-2.5 relative`}
          >
            <GoogleIcon />
            <span>Continuar com Google</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#F9C784] text-[#5A3A00] font-bold shrink-0">
              OAuth2
            </span>
          </button>

          <button
            onClick={() => window.location.href = `${API_URL}/api/auth/apple`}
            className={`${oauthBtn} justify-center mb-5`}
          >
            <AppleIcon /> Continuar com Apple
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#F5D5DC]" />
            <span className="text-[11px] text-[#9B7575] font-medium uppercase tracking-widest whitespace-nowrap">
              ou use e-mail
            </span>
            <div className="flex-1 h-px bg-[#F5D5DC]" />
          </div>

          {/* ══════════════ LOGIN ══════════════ */}
          {tab === 'login' && (
            <div className="flex flex-col gap-3.5">

              <div>
                <span className={label}>E-mail</span>
                <input
                  className={inp}
                  type="email"
                  placeholder="seu@email.com"
                  value={lEmail}
                  onChange={e => setLEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  autoComplete="email"
                />
              </div>

              <div>
                <span className="flex items-center justify-between mb-1.5">
                  <span className={label.replace('mb-1.5', '')}>Senha</span>
                  <button
                    type="button"
                    onClick={() => setInfo('Recuperação disponível com backend ativo 🔐')}
                    className="text-[11px] font-semibold text-honey-500 hover:text-honey-600 transition-colors"
                  >
                    Esqueceu?
                  </button>
                </span>
                <div className="relative">
                  <input
                    className={`${inp} pr-11`}
                    type={showP ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={lPass}
                    onChange={e => setLPass(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doLogin()}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowP(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B7575] hover:text-[#3D2B2B] transition-colors text-base"
                  >
                    {showP ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button onClick={doLogin} disabled={loading} className={`${btn} mt-1`}>
                {loading ? '⏳ Aguarde...' : 'Entrar ✨'}
              </button>
            </div>
          )}

          {/* ══════════════ REGISTER ══════════════ */}
          {tab === 'register' && (
            <div>

              {/* Indicador de passos */}
              <div className="flex items-center gap-2 mb-5">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step > i  ? 'w-2 bg-green-500' :
                      step === i ? 'w-6 bg-honey-500' :
                                  'w-2 bg-[#F5D5DC]'
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs text-[#9B7575]">Passo {step} de 3</span>
              </div>

              {/* ── Passo 1: Nome + E-mail ── */}
              {step === 1 && (
                <div className="flex flex-col gap-3.5">
                  <div>
                    <span className={label}>Nome completo</span>
                    <input
                      className={inp}
                      type="text"
                      placeholder="Seu nome..."
                      value={rName}
                      onChange={e => setRName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <span className={label}>E-mail</span>
                    <input
                      className={inp}
                      type="email"
                      placeholder="seu@email.com"
                      value={rEmail}
                      onChange={e => setREmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <button onClick={next1} className={`${btn} mt-1`}>
                    Próximo →
                  </button>
                </div>
              )}

              {/* ── Passo 2: Senha ── */}
              {step === 2 && (
                <div className="flex flex-col gap-3.5">
                  <div>
                    <span className={label}>Criar senha</span>
                    <div className="relative">
                      <input
                        className={`${inp} pr-11`}
                        type={showP ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={rPass}
                        onChange={e => { setRPass(e.target.value); calcStrength(e.target.value); }}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowP(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B7575] hover:text-[#3D2B2B] transition-colors text-base"
                      >
                        {showP ? '🙈' : '👁'}
                      </button>
                    </div>
                    {rPass && (
                      <div className="mt-2">
                        <div className="h-1.5 rounded-full bg-[#F5D5DC] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${STR_BARS[strength]}`}
                            style={{ width: `${strength * 25}%` }}
                          />
                        </div>
                        <p className={`text-[11px] mt-1 ${STR_TEXT[strength]}`}>{STR_LABELS[strength]}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className={label}>Confirmar senha</span>
                    <input
                      className={inp}
                      type="password"
                      placeholder="Repita a senha"
                      value={rConfirm}
                      onChange={e => setRConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="flex gap-2.5 mt-1">
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-3.5 rounded-xl border border-[#F5D5DC] bg-[#FFF0EC] text-[#9B7575] text-sm font-medium hover:bg-[#F5D5DC] transition-all shrink-0"
                    >
                      ← Voltar
                    </button>
                    <button onClick={next2} className={btnFlex}>
                      Próximo →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Passo 3: Confirmação ── */}
              {step === 3 && (
                <div className="text-center py-4">
                  <span className="text-6xl inline-block animate-bee-pulse">🐝</span>
                  <h3 className="font-display text-2xl italic text-[#3D2B2B] mt-4 mb-2">Tudo pronto! ✨</h3>
                  <p className="text-sm text-[#9B7575] mb-6">
                    Seja bem-vinda, <strong className="text-[#3D2B2B]">{rName.split(' ')[0]}</strong>!
                  </p>
                  <button onClick={doRegister} disabled={loading} className={btn}>
                    {loading ? '⏳ Aguarde...' : 'Entrar no app 🚀'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer — trocar entre login/registro */}
          <p className="text-center mt-6 text-sm text-[#9B7575]">
            {tab === 'login' ? (
              <>
                Não tem conta?{' '}
                <button
                  onClick={() => switchTab('register')}
                  className="text-honey-600 font-semibold hover:text-honey-500 transition-colors"
                >
                  Criar agora →
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button
                  onClick={() => switchTab('login')}
                  className="text-honey-600 font-semibold hover:text-honey-500 transition-colors"
                >
                  Entrar →
                </button>
              </>
            )}
          </p>

        </div>
      </main>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}
