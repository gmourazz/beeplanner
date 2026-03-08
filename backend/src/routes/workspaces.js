const router = require('express').Router();
const auth = require('../middleware/auth');
const { query } = require('../db');

router.use(auth);

// GET all workspaces with pages
router.get('/', async (req, res) => {
  try {
    const ws = await query('SELECT * FROM workspaces WHERE user_id = $1 ORDER BY position', [req.userId]);
    const pages = await query('SELECT * FROM pages WHERE user_id = $1 AND parent_id IS NULL ORDER BY position', [req.userId]);
    
    const result = ws.rows.map(w => ({
      ...w,
      pages: pages.rows.filter(p => p.workspace_id === w.id)
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create workspace
router.post('/', async (req, res) => {
  try {
    const { name, icon = '📁', color = '#F4A5B8' } = req.body;
    const r = await query('INSERT INTO workspaces (user_id, name, icon, color) VALUES ($1,$2,$3,$4) RETURNING *', [req.userId, name, icon, color]);
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update workspace
router.put('/:id', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const r = await query('UPDATE workspaces SET name=$1,icon=$2,color=$3 WHERE id=$4 AND user_id=$5 RETURNING *', [name, icon, color, req.params.id, req.userId]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Não encontrado' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE workspace
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM workspaces WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
