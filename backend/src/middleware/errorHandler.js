/**
 * Error handler global — deve ser registrado APÓS todas as rotas no index.js
 * @type {import('express').ErrorRequestHandler}
 */
function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.stack);

  // Erro do PostgreSQL: violação de unique
  if (err.code === '23505')
    return res.status(409).json({ error: 'Registro duplicado.' });

  // Erro do PostgreSQL: foreign key
  if (err.code === '23503')
    return res.status(400).json({ error: 'Referência inválida.' });

  res.status(err.status || 500).json({
    error: err.message || 'Erro interno no servidor.',
  });
}

module.exports = errorHandler;