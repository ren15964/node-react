const pool = require('../db')
const AppError = require('../utils/AppError')
const { normalizePaginationParams } = require('../utils/pagination')

const articleSelectFields = `
  a.id,
  a.title,
  a.content,
  a.status,
  a.author_id,
  a.category_id,
  u.username AS author_name,
  c.name AS category_name,
  c.slug AS category_slug,
  a.created_at,
  a.updated_at,
  a.deleted_at
`

const buildKeywordPattern = (keyword) => `%${keyword}%`

const getArticlePermissionSnapshot = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, author_id, status, deleted_at FROM articles WHERE id = ? LIMIT 1',
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

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) {
    return
  }

  const [rows] = await pool.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId])

  if (rows.length === 0) {
    throw new AppError('所选分类不存在', 400)
  }
}

const buildVisibilityClause = (userId, status) => {
  if (!userId) {
    if (status === 'draft') {
      return {
        sql: ' AND 1 = 0',
        params: []
      }
    }

    return {
      sql: ' AND a.status = ?',
      params: ['published']
    }
  }

  if (status === 'draft') {
    return {
      sql: ' AND a.status = ? AND a.author_id = ?',
      params: ['draft', userId]
    }
  }

  if (status === 'published') {
    return {
      sql: ' AND a.status = ?',
      params: ['published']
    }
  }

  return {
    sql: ' AND (a.status = ? OR a.author_id = ?)',
    params: ['published', userId]
  }
}

const listArticles = async ({ page, pageSize, keyword, status, categoryId, userId }) => {
  const pagination = normalizePaginationParams({ page, pageSize })
  const visibility = buildVisibilityClause(userId, status)
  let sql = `
    SELECT ${articleSelectFields}
    FROM articles a
    LEFT JOIN users u ON u.id = a.author_id
    LEFT JOIN categories c ON c.id = a.category_id
    WHERE a.deleted_at IS NULL
  `
  let countSql = 'SELECT COUNT(*) AS total FROM articles a WHERE a.deleted_at IS NULL'
  const params = []
  const countParams = []

  sql += visibility.sql
  countSql += visibility.sql
  params.push(...visibility.params)
  countParams.push(...visibility.params)

  if (keyword) {
    sql += ' AND a.title LIKE ?'
    countSql += ' AND a.title LIKE ?'
    params.push(buildKeywordPattern(keyword))
    countParams.push(buildKeywordPattern(keyword))
  }

  if (categoryId) {
    sql += ' AND a.category_id = ?'
    countSql += ' AND a.category_id = ?'
    params.push(categoryId)
    countParams.push(categoryId)
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

const getArticleById = async (id, userId) => {
  const [rows] = await pool.query(
    `
      SELECT ${articleSelectFields}
      FROM articles a
      LEFT JOIN users u ON u.id = a.author_id
      LEFT JOIN categories c ON c.id = a.category_id
      WHERE a.id = ? AND a.deleted_at IS NULL
      LIMIT 1
    `,
    [id]
  )

  if (rows.length === 0) {
    throw new AppError('文章不存在', 404)
  }

  const article = rows[0]

  if (article.status === 'draft' && article.author_id !== userId) {
    throw new AppError('文章不存在', 404)
  }

  return article
}

const createArticle = async ({ title, content, status, categoryId, authorId }) => {
  await ensureCategoryExists(categoryId)

  const [result] = await pool.query(
    'INSERT INTO articles (title, content, status, author_id, category_id) VALUES (?, ?, ?, ?, ?)',
    [title, content || null, status, authorId, categoryId || null]
  )

  return {
    id: result.insertId
  }
}

const updateArticle = async (id, { title, content, status, categoryId }, userId) => {
  const article = await assertArticleOwner(id, userId)

  if (article.deleted_at) {
    throw new AppError('已删除的文章不能编辑', 400)
  }

  await ensureCategoryExists(categoryId)

  await pool.query(
    'UPDATE articles SET title = ?, content = ?, status = ?, category_id = ? WHERE id = ?',
    [title, content || null, status, categoryId || null, id]
  )
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
