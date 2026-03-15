const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query } = require('../config/db');
router.use(auth);

router.put('/profile', async (req, res) => {
  try {
    const { name, avatar_emoji, theme, profession } = req.body;
    const r = await query(
      'UPDATE users SET name=$1, avatar_emoji=$2, theme=$3, profession=$4 WHERE id=$5 RETURNING id,name,email,avatar_emoji,theme,profession',
      [name, avatar_emoji, theme, profession, req.userId]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
