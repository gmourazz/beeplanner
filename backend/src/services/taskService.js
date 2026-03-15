const { query } = require('../config/db');

/**
 * @param {string} userId
 * @param {string} [date]
 */
async function findAll(userId, date) {
  if (date) {
    const r = await query(
      'SELECT * FROM tasks WHERE user_id=$1 AND scheduled_date=$2 ORDER BY created_at',
      [userId, date]
    );
    return r.rows;
  }
  const r = await query(
    'SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at',
    [userId]
  );
  return r.rows;
}

/**
 * @param {string} userId
 * @param {{ text: string, priority?: string, scheduled_date?: string, page_id?: string }} data
 */
async function create(userId, data) {
  const { text, priority = 'normal', scheduled_date, page_id } = data;
  const r = await query(
    'INSERT INTO tasks (user_id,page_id,text,priority,scheduled_date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [userId, page_id || null, text, priority, scheduled_date || null]
  );
  return r.rows[0];
}

/**
 * @param {string} id
 * @param {string} userId
 * @param {{ text: string, done: boolean, priority: string, scheduled_date: string }} data
 */
async function update(id, userId, data) {
  const { text, done, priority, scheduled_date } = data;
  const r = await query(
    'UPDATE tasks SET text=$1,done=$2,priority=$3,scheduled_date=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
    [text, done, priority, scheduled_date, id, userId]
  );
  return r.rows[0];
}

/**
 * @param {string} id
 * @param {string} userId
 */
async function remove(id, userId) {
  await query('DELETE FROM tasks WHERE id=$1 AND user_id=$2', [id, userId]);
}

module.exports = { findAll, create, update, remove };