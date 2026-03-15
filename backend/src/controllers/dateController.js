const dateService = require('../services/dateService');

async function list(req, res, next) {
  try {
    res.json(await dateService.findAll(req.userId));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const date = await dateService.create(req.userId, req.body);
    res.status(201).json(date);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await dateService.remove(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { list, create, remove };