const pool = require('../db')
const AppError = require('../utils/AppError')
const withTransaction = require('../utils/transaction')
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

const normalizeTagIds = (tagIds = []) => [...new Set(tagIds.filter(Boolean))]

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

const ensureTagsExist = async (tagIds) => {
  if (tagIds.length === 0) {
    return
  }

  const placeholders = tagIds.map(() => '?').join(', ')
  const [rows] = await pool.query(
    `SELECT id FROM tags WHERE id IN (${placeholders})`,
    tagIds
  )

  if (rows.length !== tagIds.length) {
    throw new AppError('所选标签不存在', 400)
  }
}

const syncArticleTags = async (executor, articleId, tagIds) => {
  await executor.query('DELETE FROM article_tags WHERE article_id = ?', [articleId])

  if (tagIds.length === 0) {
    return
  }

  const values = tagIds.map((tagId) => [articleId, tagId])
  await executor.query('INSERT INTO article_tags (article_id, tag_id) VALUES ?', [values])
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

const buildArticleFilters = ({ keyword, categoryId, tagId }) => {
  let sql = ''
  const params = []

  if (keyword) {
    sql += ' AND a.title LIKE ?'
    params.push(buildKeywordPattern(keyword))
  }

  if (categoryId) {
    sql += ' AND a.category_id = ?'
    params.push(categoryId)
  }

  if (tagId) {
    sql += `
      AND EXISTS (
        SELECT 1
        FROM article_tags at
        WHERE at.article_id = a.id AND at.tag_id = ?
      )
    `
    params.push(tagId)
  }

  return { sql, params }
}

const fetchArticleTagsMap = async (articleIds, executor = pool) => {
  if (articleIds.length === 0) {
    return new Map()
  }

  const placeholders = articleIds.map(() => '?').join(', ')
  const [rows] = await executor.query(
    `
      SELECT
        at.article_id,
        t.id,
        t.name,
        t.slug
      FROM article_tags at
      INNER JOIN tags t ON t.id = at.tag_id
      WHERE at.article_id IN (${placeholders})
      ORDER BY t.sort_order ASC, t.id ASC
    `,
    articleIds
  )

  const tagMap = new Map()

  rows.forEach((row) => {
    if (!tagMap.has(row.article_id)) {
      tagMap.set(row.article_id, [])
    }

    tagMap.get(row.article_id).push({
      id: row.id,
      name: row.name,
      slug: row.slug
    })
  })

  return tagMap
}

const attachTagsToArticles = async (articles, executor = pool) => {
  const articleIds = articles.map((article) => article.id)
  const tagMap = await fetchArticleTagsMap(articleIds, executor)

  return articles.map((article) => ({
    ...article,
    tags: tagMap.get(article.id) || []
  }))
}

const listArticles = async ({ page, pageSize, keyword, status, categoryId, tagId, userId }) => {
  const pagination = normalizePaginationParams({ page, pageSize })
  const visibility = buildVisibilityClause(userId, status)
  const filters = buildArticleFilters({ keyword, categoryId, tagId })

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

  sql += visibility.sql + filters.sql
  countSql += visibility.sql + filters.sql
  params.push(...visibility.params, ...filters.params)
  countParams.push(...visibility.params, ...filters.params)

  sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?'
  params.push(pagination.pageSize, pagination.offset)

  const [rows] = await pool.query(sql, params)
  const [countRows] = await pool.query(countSql, countParams)
  const list = await attachTagsToArticles(rows)
  const total = countRows[0].total

  return {
    list,
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

  const [article] = await attachTagsToArticles(rows)

  if (article.status === 'draft' && article.author_id !== userId) {
    throw new AppError('文章不存在', 404)
  }

  return article
}

const createArticle = async ({ title, content, status, categoryId, tagIds, authorId }) => {
  const normalizedTagIds = normalizeTagIds(tagIds)
  await ensureCategoryExists(categoryId)
  await ensureTagsExist(normalizedTagIds)

  return withTransaction(async (connection) => {
    const [result] = await connection.query(
      'INSERT INTO articles (title, content, status, author_id, category_id) VALUES (?, ?, ?, ?, ?)',
      [title, content || null, status, authorId, categoryId || null]
    )

    await syncArticleTags(connection, result.insertId, normalizedTagIds)

    return {
      id: result.insertId
    }
  })
}

const updateArticle = async (id, { title, content, status, categoryId, tagIds }, userId) => {
  const article = await assertArticleOwner(id, userId)

  if (article.deleted_at) {
    throw new AppError('已删除的文章不能编辑', 400)
  }

  const normalizedTagIds = normalizeTagIds(tagIds)
  await ensureCategoryExists(categoryId)
  await ensureTagsExist(normalizedTagIds)

  await withTransaction(async (connection) => {
    await connection.query(
      'UPDATE articles SET title = ?, content = ?, status = ?, category_id = ? WHERE id = ?',
      [title, content || null, status, categoryId || null, id]
    )

    await syncArticleTags(connection, id, normalizedTagIds)
  })
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
