const router = require('express').Router();
const auth = require('../middleware/auth');
const { query } = require('../db');
router.use(auth);

router.get('/', async (req, res) => {
  const { workspace_id } = req.query;
  const q = workspace_id
    ? 'SELECT * FROM pages WHERE user_id=$1 AND workspace_id=$2 ORDER BY position'
    : 'SELECT * FROM pages WHERE user_id=$1 ORDER BY position';
  const params = workspace_id ? [req.userId, workspace_id] : [req.userId];
  const r = await query(q, params);
  res.json(r.rows);
});

router.post('/', async (req, res) => {
  try {
    const { workspace_id, parent_id, title = 'Sem título', icon = '📄', page_type = 'note', content = {} } = req.body;
    const r = await query(
      'INSERT INTO pages (workspace_id, user_id, parent_id, title, icon, page_type, content) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [workspace_id, req.userId, parent_id || null, title, icon, page_type, JSON.stringify(content)]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, icon, content, is_favorite, page_type } = req.body;
    const r = await query(
      'UPDATE pages SET title=$1,icon=$2,content=$3,is_favorite=$4,page_type=$5 WHERE id=$6 AND user_id=$7 RETURNING *',
      [title, icon, JSON.stringify(content), is_favorite, page_type, req.params.id, req.userId]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  await query('DELETE FROM pages WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
  res.json({ success: true });
});

module.exports = router;
