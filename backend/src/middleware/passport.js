const LocalStrategy    = require('passport-local').Strategy;
const GoogleStrategy   = require('passport-google-oauth20').Strategy;
const GitHubStrategy   = require('passport-github2').Strategy;
const JwtStrategy      = require('passport-jwt').Strategy;
const ExtractJwt       = require('passport-jwt').ExtractJwt;
const bcrypt           = require('bcryptjs');
// const User          = require('../models/User'); // uncomment when DB is connected

// ── MOCK USER STORE (replace with DB) ──
const mockUsers = [
  {
    id: '1',
    name: 'Demo User 🐝',
    email: 'demo@beeplanner.app',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', // "password"
    phone: null,
    provider: 'local',
  },
  {
    id: '2',
    name: 'Gabriel Moura',
    email: 'gmourazz18@gmail.com',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    phone: null,
    provider: 'local',
  },
];

// Helper to find user
function findByEmail(email) { return mockUsers.find(u => u.email?.toLowerCase() === email?.toLowerCase()); }
function findById(id)       { return mockUsers.find(u => u.id === id); }

module.exports = (passport) => {

  // ── SERIALIZE / DESERIALIZE ──
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    const user = findById(id);
    done(null, user || false);
  });

  // ── LOCAL (email + password) ──
  passport.use('local', new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = findByEmail(email);
        if (!user) return done(null, false, { message: 'E-mail não encontrado.' });
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return done(null, false, { message: 'Senha incorreta.' });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  // ── JWT (stateless API auth) ──
  passport.use('jwt', new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'beeplanner-jwt-secret-🐝',
    },
    (payload, done) => {
      const user = findById(payload.sub);
      return user ? done(null, user) : done(null, false);
    }
  ));

  // ── GOOGLE OAuth2 ──
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use('google', new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = findByEmail(profile.emails?.[0]?.value);
          if (!user) {
            // In production: create user in DB
            user = {
              id: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value,
              avatar: profile.photos?.[0]?.value,
              provider: 'google',
              googleId: profile.id,
            };
            mockUsers.push(user);
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    ));
  } else {
    console.warn('⚠️  Google OAuth: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET não configurados');
  }

  // ── GITHUB OAuth2 ──
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use('github', new GitHubStrategy(
      {
        clientID:     process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:  process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          let user = email ? findByEmail(email) : null;
          if (!user) {
            user = {
              id: 'gh_' + profile.id,
              name: profile.displayName || profile.username,
              email,
              avatar: profile.photos?.[0]?.value,
              provider: 'github',
              githubId: profile.id,
            };
            mockUsers.push(user);
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    ));
  } else {
    console.warn('⚠️  GitHub OAuth: GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET não configurados');
  }
};