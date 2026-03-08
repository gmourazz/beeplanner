// middleware/auth.js — verifica JWT e injeta req.userId
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'beeplanner-jwt-secret-🐝';

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token não fornecido.' });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
