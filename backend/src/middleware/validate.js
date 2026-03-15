/**
 * Retorna um middleware que valida se os campos obrigatórios estão no body
 * @param {string[]} fields
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.post('/', validate(['title', 'date']), controller.create);
 */
function validate(fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => req.body[f] === undefined || req.body[f] === '');
    if (missing.length)
      return res.status(400).json({ error: `Campos obrigatórios: ${missing.join(', ')}` });
    next();
  };
}

module.exports = validate;