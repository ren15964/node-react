const pool = require('../db')
const AppError = require('../utils/AppError')
const { normalizePaginationParams } = require('../utils/pagination')

const articleSelectFields = `
  a.id,
  a.title,
  a.content,
  a.author_id,
  u.username AS author_name,
  a.created_at,
  a.updated_at,
  a.deleted_at
`

const buildKeywordPattern = (keyword) => `%${keyword}%`

const getArticlePermissionSnapshot = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, author_id, deleted_at FROM articles WHERE id = ? LIMIT 1',
    [id]
  )

  if (rows.length === 0) {
    throw new AppError('文章不存在', 404)
  }

  return rows[0]
}

const assertArticleOwner = async (id, userId) => {
  const article = await getArticlePermissionSnapshot(id)

  if (article.author_id !== userId) {
    throw new AppError('你无权操作这篇文章', 403)
  }

  return article
}

const listArticles = async ({ page, pageSize, keyword }) => {
  const pagination = normalizePaginationParams({ page, pageSize })
  let sql = `
    SELECT ${articleSelectFields}
    FROM articles a
    LEFT JOIN users u ON u.id = a.author_id
    WHERE a.deleted_at IS NULL
  `
  let countSql = 'SELECT COUNT(*) AS total FROM articles a WHERE a.deleted_at IS NULL'
  const params = []
  const countParams = []

  if (keyword) {
    sql += ' AND a.title LIKE ?'
    countSql += ' AND a.title LIKE ?'
    params.push(buildKeywordPattern(keyword))
    countParams.push(buildKeywordPattern(keyword))
  }

  sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?'
  params.push(pagination.pageSize, pagination.offset)

  const [rows] = await pool.query(sql, params)
  const [countRows] = await pool.query(countSql, countParams)
  const total = countRows[0].total

  return {
    list: rows,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize)
    }
  }
}

const getArticleById = async (id) => {
  const [rows] = await pool.query(
    `
      SELECT ${articleSelectFields}
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      WHERE a.id = ? AND a.deleted_at IS NULL
      LIMIT 1
    `,
    [id]
  )

  if (rows.length === 0) {
    throw new AppError('文章不存在', 404)
  }

  return rows[0]
}

const createArticle = async ({ title, content, authorId }) => {
  const [result] = await pool.query(
    'INSERT INTO articles (title, content, author_id) VALUES (?, ?, ?)',
    [title, content || null, authorId]
  )

  return {
    id: result.insertId
  }
}

const updateArticle = async (id, { title, content }, userId) => {
  const article = await assertArticleOwner(id, userId)

  if (article.deleted_at) {
    throw new AppError('已删除的文章不能编辑', 400)
  }

  await pool.query('UPDATE articles SET title = ?, content = ? WHERE id = ?', [
    title,
    content || null,
    id
  ])
}

const deleteArticle = async (id, userId) => {
  const article = await assertArticleOwner(id, userId)

  if (article.deleted_at) {
    throw new AppError('文章已删除', 400)
  }

  await pool.query('UPDATE articles SET deleted_at = NOW() WHERE id = ?', [id])
}

const restoreArticle = async (id, userId) => {
  const article = await assertArticleOwner(id, userId)

  if (!article.deleted_at) {
    throw new AppError('文章当前无需恢复', 400)
  }

  await pool.query('UPDATE articles SET deleted_at = NULL WHERE id = ?', [id])
}

module.exports = {
  listArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  restoreArticle
}
