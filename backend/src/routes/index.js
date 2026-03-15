const { Router } = require('express');
const router = Router();

router.use('/auth',       require('./auth'));
router.use('/users',      require('./users'));
router.use('/workspaces', require('./workspaces'));
router.use('/pages',      require('./pages'));
router.use('/tasks',      require('./tasks'));
router.use('/notes',      require('./notes'));
router.use('/habits',     require('./habits'));
router.use('/dates',      require('./dates'));
router.use('/quotes',     require('./quotes'));

module.exports = router;
