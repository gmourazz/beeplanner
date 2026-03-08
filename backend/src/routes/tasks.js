// tasks.js
const express = require('express');
module.exports = (() => {
  const router = express.Router();
  const auth = require('../middleware/auth');
  const { query } = require('../db');
  router.use(auth);
  router.get('/', async (req, res) => {
    const { date } = req.query;
    const q = date ? 'SELECT * FROM tasks WHERE user_id=$1 AND scheduled_date=$2 ORDER BY created_at' : 'SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at';
    const p = date ? [req.userId, date] : [req.userId];
    const r = await query(q, p);
    res.json(r.rows);
  });
  router.post('/', async (req, res) => {
    const { text, priority='normal', scheduled_date, page_id } = req.body;
    const r = await query('INSERT INTO tasks (user_id,page_id,text,priority,scheduled_date) VALUES ($1,$2,$3,$4,$5) RETURNING *', [req.userId, page_id||null, text, priority, scheduled_date||null]);
    res.status(201).json(r.rows[0]);
  });
  router.put('/:id', async (req, res) => {
    const { text, done, priority, scheduled_date } = req.body;
    const r = await query('UPDATE tasks SET text=$1,done=$2,priority=$3,scheduled_date=$4 WHERE id=$5 AND user_id=$6 RETURNING *', [text, done, priority, scheduled_date, req.params.id, req.userId]);
    res.json(r.rows[0]);
  });
  router.delete('/:id', async (req, res) => {
    await query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    res.json({ success: true });
  });
  return router;
})();
