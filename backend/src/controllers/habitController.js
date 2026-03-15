const habitService = require('../services/habitService');

async function list(req, res, next) {
  try {
    res.json(await habitService.findAll(req.userId));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const habit = await habitService.create(req.userId, req.body);
    res.status(201).json(habit);
  } catch (err) { next(err); }
}

async function toggle(req, res, next) {
  try {
    const result = await habitService.toggle(req.params.id, req.userId, req.body.date);
    res.json(result);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await habitService.remove(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { list, create, toggle, remove };