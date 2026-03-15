const pageService = require('../services/pageService');

async function list(req, res, next) {
  try {
    res.json(await pageService.findAll(req.userId, req.query.workspace_id));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const page = await pageService.create(req.userId, req.body);
    res.status(201).json(page);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const page = await pageService.update(req.params.id, req.userId, req.body);
    if (!page) return res.status(404).json({ error: 'Página não encontrada.' });
    res.json(page);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await pageService.remove(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };