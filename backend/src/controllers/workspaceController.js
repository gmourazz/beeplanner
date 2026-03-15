const workspaceService = require('../services/workspaceService');

async function list(req, res, next) {
  try {
    res.json(await workspaceService.findAll(req.userId));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const workspace = await workspaceService.create(req.userId, req.body);
    res.status(201).json(workspace);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const workspace = await workspaceService.update(req.params.id, req.userId, req.body);
    if (!workspace) return res.status(404).json({ error: 'Workspace não encontrado.' });
    res.json(workspace);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await workspaceService.remove(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };