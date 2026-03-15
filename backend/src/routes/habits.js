const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query } = require('../config/db');
router.use(auth);

router.get('/', async (req, res) => {
  const habits = await query('SELECT * FROM habits WHERE user_id=$1', [req.userId]);
  const logs = await query('SELECT * FROM habit_logs WHERE user_id=$1', [req.userId]);
  const result = habits.rows.map(h => ({ ...h, logs: logs.rows.filter(l => l.habit_id === h.id).map(l => l.date) }));
  res.json(result);
});
router.post('/', async (req, res) => {
  const { name, icon='🌱', color='#F4A5B8' } = req.body;
  const r = await query('INSERT INTO habits (user_id,name,icon,color) VALUES ($1,$2,$3,$4) RETURNING *', [req.userId, name, icon, color]);
  res.status(201).json(r.rows[0]);
});
router.post('/:id/toggle', async (req, res) => {
  const { date } = req.body;
  try {
    await query('INSERT INTO habit_logs (habit_id, user_id, date) VALUES ($1,$2,$3)', [req.params.id, req.userId, date]);
    res.json({ done: true });
  } catch {
    await query('DELETE FROM habit_logs WHERE habit_id=$1 AND user_id=$2 AND date=$3', [req.params.id, req.userId, date]);
    res.json({ done: false });
  }
});
router.delete('/:id', async (req, res) => { await query('DELETE FROM habits WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]); res.json({ success: true }); });
module.exports = router;
