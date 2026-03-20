const pool = require('../db')
const { success, fail } = require('../utils/response')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

// 获取文章列表
const getArticles = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 10
  const keyword = req.query.keyword || ''
  const offset = (page - 1) * pageSize

  let sql = 'SELECT * FROM articles'
  let countSql = 'SELECT COUNT(*) as total FROM articles'
  const params = []
  const countParams = []

  if (keyword) {
    sql += ' WHERE title LIKE ?'
    countSql += ' WHERE title LIKE ?'
    params.push('%' + keyword + '%')
    countParams.push('%' + keyword + '%')
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(pageSize, offset)

  const [rows] = await pool.query(sql, params)
  const [countRows] = await pool.query(countSql, countParams)
  const total = countRows[0].total

  success(res, {
    list: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  })
})

// 获取文章详情
const getArticleById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const [rows] = await pool.query('SELECT * FROM articles WHERE id = ?', [id])

  if (rows.length === 0) {
    throw new AppError('文章不存在', 404)
  }

  success(res, rows[0])
})

// 新增文章
const createArticle = asyncHandler(async (req, res) => {
  const { title, content } = req.body

  if (!title) {
    throw new AppError('文章标题不能为空')
  }

  const [result] = await pool.query('INSERT INTO articles (title, content) VALUES (?, ?)', [
    title,
    content
  ])

  success(res, { id: result.insertId }, '文章创建成功')
})

// 编辑文章
const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { title, content } = req.body

  if (!title) {
    throw new AppError('文章标题不能为空')
  }

  const [result] = await pool.query('UPDATE articles SET title = ?, content = ? WHERE id = ?', [
    title,
    content,
    id
  ])

  if (result.affectedRows === 0) {
    throw new AppError('文章不存在', 404)
  }

  success(res, null, '文章更新成功')
})

// 删除文章
const deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params

  const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [id])

  if (result.affectedRows === 0) {
    throw new AppError('文章不存在', 404)
  }

  success(res, null, '文章删除成功')
})

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
}
