// routes/auth.js — autenticação real: email/senha + Google OAuth2 + GitHub OAuth2
// Sem passport, sem mocks — usa PostgreSQL via db.js
const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const https    = require('https');
const { query } = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET  || 'beeplanner-jwt-secret-🐝';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const FRONTEND   = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_BASE   = process.env.API_URL      || 'http://localhost:3001';

// ── Helpers ──────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function sendToken(res, user, status = 200) {
  res.status(status).json({
    ok: true,
    token: signToken(user),
    user: {
      id:         user.id,
      name:       user.name,
      email:      user.email,
      avatar:     user.avatar_emoji || '🐝',
      theme:      user.theme        || 'default',
      profession: user.profession   || 'default',
      provider:   user.provider     || 'local',
    },
  });
}

// Middleware JWT para /me
function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token não fornecido.' });
  try {
    const payload = jwt.verify(h.slice(7), JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

// HTTP helpers sem dependências extras (usa https nativo do Node)
function httpPost(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body   = new URLSearchParams(data).toString();
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path:     parsed.pathname + parsed.search,
        method:   'POST',
        headers: {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          Accept:           'application/json',
          ...headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', c => (raw += c));
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path:     parsed.pathname + parsed.search,
        method:   'GET',
        headers: { Accept: 'application/json', ...headers },
      },
      (res) => {
        let raw = '';
        res.on('data', c => (raw += c));
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

// ════════════════════════════════════════════════
//  EMAIL + SENHA
// ════════════════════════════════════════════════

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email e password são obrigatórios.' });
    if (password.length < 8)
      return res.status(400).json({ error: 'Senha deve ter mínimo 8 caracteres.' });
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email))
      return res.status(400).json({ error: 'E-mail inválido.' });

    const cleanEmail = email.toLowerCase().trim();

    const { rows: ex } = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (ex.length) return res.status(409).json({ error: 'E-mail já cadastrado.' });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, provider)
       VALUES ($1, $2, $3, 'local') RETURNING *`,
      [name.trim(), cleanEmail, hash]
    );

    sendToken(res, rows[0], 201);
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'E-mail e senha obrigatórios.' });

    const { rows } = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    const user = rows[0];

    if (!user)
      return res.status(401).json({ error: 'E-mail não encontrado.' });
    if (!user.password_hash)
      return res.status(401).json({ error: 'Esta conta usa login social. Use o botão do Google ou GitHub.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta.' });

    sendToken(res, user);
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════
//  JWT — /me
// ════════════════════════════════════════════════

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, name, email, avatar_emoji, theme, profession, provider, created_at
       FROM users WHERE id = $1`,
      [req.userId]
    );
    if (!rows[0]) return res.status(401).json({ error: 'Usuário não encontrado.' });
    res.json({ ok: true, user: rows[0] });
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════
//  GOOGLE OAuth2
// ════════════════════════════════════════════════

// GET /api/auth/google — redireciona para o Google
router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID)
    return res.status(503).json({ error: 'Google OAuth não configurado. Defina GOOGLE_CLIENT_ID no .env' });

  const callback = process.env.GOOGLE_CALLBACK_URL
    || `${API_BASE}/api/auth/google/callback`;

  const url = new URL('https://accounts.google.com/o/oauth2/auth');
  url.searchParams.set('client_id',     process.env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri',  callback);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope',         'openid email profile');
  res.redirect(url.toString());
});

// GET /api/auth/google/callback — troca code por token, cria/acha usuário
router.get('/google/callback', async (req, res, next) => {
  try {
    const { code, error } = req.query;
    if (error || !code) return res.redirect(`${FRONTEND}/auth?error=google`);

    const callback = process.env.GOOGLE_CALLBACK_URL
      || `${API_BASE}/api/auth/google/callback`;

    // Troca o code pelo access_token
    const tokens = await httpPost('https://oauth2.googleapis.com/token', {
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  callback,
      grant_type:    'authorization_code',
    });

    if (!tokens.access_token) return res.redirect(`${FRONTEND}/auth?error=google`);

    // Busca perfil do usuário
    const profile = await httpGet(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { Authorization: `Bearer ${tokens.access_token}` }
    );
    if (!profile.email) return res.redirect(`${FRONTEND}/auth?error=google`);

    // Encontra ou cria o usuário no banco
    let user;
    const { rows: byGoogleId } = await query(
      'SELECT * FROM users WHERE google_id = $1', [profile.id]
    );

    if (byGoogleId[0]) {
      user = byGoogleId[0];
    } else {
      const { rows: byEmail } = await query(
        'SELECT * FROM users WHERE email = $1', [profile.email.toLowerCase()]
      );
      if (byEmail[0]) {
        // Vincula Google à conta existente
        const { rows } = await query(
          `UPDATE users SET google_id = $1, provider = 'google'
           WHERE id = $2 RETURNING *`,
          [profile.id, byEmail[0].id]
        );
        user = rows[0];
      } else {
        // Cria nova conta via Google
        const { rows } = await query(
          `INSERT INTO users (name, email, google_id, provider)
           VALUES ($1, $2, $3, 'google') RETURNING *`,
          [profile.name, profile.email.toLowerCase(), profile.id]
        );
        user = rows[0];
      }
    }

    res.redirect(`${FRONTEND}/auth?token=${signToken(user)}`);
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════
//  GITHUB OAuth2
// ════════════════════════════════════════════════

// GET /api/auth/github
router.get('/github', (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID)
    return res.status(503).json({ error: 'GitHub OAuth não configurado. Defina GITHUB_CLIENT_ID no .env' });

  const callback = process.env.GITHUB_CALLBACK_URL
    || `${API_BASE}/api/auth/github/callback`;

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id',    process.env.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', callback);
  url.searchParams.set('scope',        'user:email');
  res.redirect(url.toString());
});

// GET /api/auth/github/callback
router.get('/github/callback', async (req, res, next) => {
  try {
    const { code, error } = req.query;
    if (error || !code) return res.redirect(`${FRONTEND}/auth?error=github`);

    const callback = process.env.GITHUB_CALLBACK_URL
      || `${API_BASE}/api/auth/github/callback`;

    // Troca code pelo access_token
    const tokens = await httpPost(
      'https://github.com/login/oauth/access_token',
      {
        code,
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri:  callback,
      }
    );

    const accessToken = tokens?.access_token;
    if (!accessToken) return res.redirect(`${FRONTEND}/auth?error=github`);

    // Busca perfil e e-mails do GitHub
    const [profile, emails] = await Promise.all([
      httpGet('https://api.github.com/user',
        { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Beeplanner' }),
      httpGet('https://api.github.com/user/emails',
        { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Beeplanner' }),
    ]);

    const email = Array.isArray(emails)
      ? (emails.find(e => e.primary && e.verified)?.email || emails[0]?.email)
      : profile.email;

    if (!email) return res.redirect(`${FRONTEND}/auth?error=github_no_email`);

    let user;
    const ghId = String(profile.id);
    const { rows: byGhId } = await query(
      'SELECT * FROM users WHERE github_id = $1', [ghId]
    );

    if (byGhId[0]) {
      user = byGhId[0];
    } else {
      const { rows: byEmail } = await query(
        'SELECT * FROM users WHERE email = $1', [email.toLowerCase()]
      );
      if (byEmail[0]) {
        const { rows } = await query(
          `UPDATE users SET github_id = $1, provider = 'github'
           WHERE id = $2 RETURNING *`,
          [ghId, byEmail[0].id]
        );
        user = rows[0];
      } else {
        const { rows } = await query(
          `INSERT INTO users (name, email, github_id, provider)
           VALUES ($1, $2, $3, 'github') RETURNING *`,
          [profile.name || profile.login, email.toLowerCase(), ghId]
        );
        user = rows[0];
      }
    }

    res.redirect(`${FRONTEND}/auth?token=${signToken(user)}`);
  } catch (err) { next(err); }
});

// ════════════════════════════════════════════════
//  MISC
// ════════════════════════════════════════════════

// POST /api/auth/logout
router.post('/logout', (req, res) => res.json({ ok: true }));

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail obrigatório.' });
  // TODO: gerar token de reset e enviar por e-mail (nodemailer)
  res.json({ ok: true, message: 'Se o e-mail existir, você receberá as instruções em breve.' });
});

module.exports = router;
