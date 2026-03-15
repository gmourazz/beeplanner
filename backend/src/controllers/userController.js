const userService = require('../services/userService');

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateProfile(req.userId, req.body);
    res.json(user);
  } catch (err) { next(err); }
}

module.exports = { updateProfile };