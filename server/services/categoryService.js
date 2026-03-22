const pool = require('../db')

const listCategories = async () => {
  const [rows] = await pool.query(
    `
      SELECT id, name, slug, sort_order, created_at, updated_at
      FROM categories
      ORDER BY sort_order ASC, id ASC
    `
  )

  return rows
}

module.exports = {
  listCategories
}
