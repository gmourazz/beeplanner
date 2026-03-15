/**
 * @fileoverview Tipos centralizados do BeePlanner (JSDoc)
 * Importar onde precisar: const { User } = require('../types');
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string|null} password_hash
 * @property {string} avatar_emoji
 * @property {string} theme
 * @property {string} profession
 * @property {'local'|'google'|'github'} provider
 * @property {string|null} google_id
 * @property {string|null} github_id
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Workspace
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string} icon
 * @property {string} color
 * @property {number} position
 * @property {Page[]} [pages]
 */

/**
 * @typedef {Object} Page
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} workspace_id
 * @property {string|null} parent_id
 * @property {string} title
 * @property {string} icon
 * @property {'note'|'task'|'habit'|'calendar'} page_type
 * @property {Object} content
 * @property {boolean} is_favorite
 * @property {number} position
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} page_id
 * @property {string} text
 * @property {boolean} done
 * @property {'low'|'normal'|'high'} priority
 * @property {string|null} scheduled_date
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} page_id
 * @property {string} title
 * @property {string} body
 * @property {string} color
 * @property {string[]} tags
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} Habit
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string} icon
 * @property {string} color
 * @property {string[]} [logs]
 */

/**
 * @typedef {Object} ImportantDate
 * @property {string} id
 * @property {string} user_id
 * @property {string} title
 * @property {string} date
 * @property {string} emoji
 * @property {boolean} repeat_yearly
 */

/**
 * @typedef {Object} AuthTokenPayload
 * @property {string} sub  - user id
 * @property {string} email
 * @property {string} name
 */

/**
 * @typedef {import('express').Request & { userId: string }} AuthRequest
 */

module.exports = {};