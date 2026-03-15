const express = require('express');
const auth = require('../middleware/auth');
const { query } = require('../config/db');

const datesRouter = express.Router();
datesRouter.use(auth);
datesRouter.get('/', async (req, res) => { const r = await query('SELECT * FROM important_dates WHERE user_id=$1 ORDER BY date', [req.userId]); res.json(r.rows); });
datesRouter.post('/', async (req, res) => { const { title, date, emoji='⭐', repeat_yearly=false } = req.body; const r = await query('INSERT INTO important_dates (user_id,title,date,emoji,repeat_yearly) VALUES ($1,$2,$3,$4,$5) RETURNING *', [req.userId, title, date, emoji, repeat_yearly]); res.status(201).json(r.rows[0]); });
datesRouter.delete('/:id', async (req, res) => { await query('DELETE FROM important_dates WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]); res.json({ success: true }); });

module.exports = datesRouter;
