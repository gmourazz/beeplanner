const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.get('/today', auth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM daily_quotes ORDER BY id');
    if (!rows.length) return res.json({ ok: true, quote: null });
    const start = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
    const quote = rows[dayOfYear % rows.length];
    res.json({ ok: true, quote });
  } catch (err) {
    console.error('Erro em /quotes/today:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
