const taskService = require('../services/taskService');

/** @type {import('express').RequestHandler} */
async function list(req, res, next) {
  try {
    const tasks = await taskService.findAll(req.userId, req.query.date);
    res.json(tasks);
  } catch (err) { next(err); }
}

/** @type {import('express').RequestHandler} */
async function create(req, res, next) {
  try {
    const task = await taskService.create(req.userId, req.body);
    res.status(201).json(task);
  } catch (err) { next(err); }
}

/** @type {import('express').RequestHandler} */
async function update(req, res, next) {
  try {
    const task = await taskService.update(req.params.id, req.userId, req.body);
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.json(task);
  } catch (err) { next(err); }
}

/** @type {import('express').RequestHandler} */
async function remove(req, res, next) {
  try {
    await taskService.remove(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
}

module.exports = { list, create, update, remove };