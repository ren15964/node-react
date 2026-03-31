const pool = require('../db')

const listTags = async () => {
  const [rows] = await pool.query(
    `
      SELECT id, name, slug, sort_order, created_at, updated_at
      FROM tags
      ORDER BY sort_order ASC, id ASC
    `
  )

  return rows
}

module.exports = {
  listTags
}
