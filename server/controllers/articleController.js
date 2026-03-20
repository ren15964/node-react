const getArticles = asyncHandler(async (req, res) => {
  const { page, pageSize, keyword } = req.query

  const offset = (page - 1) * pageSize

  let sql = 'SELECT * FROM articles WHERE deleted_at IS NULL'
  let countSql = 'SELECT COUNT(*) as total FROM articles WHERE deleted_at IS NULL'
  const params = []
  const countParams = []

  if (keyword) {
    sql += ' AND title LIKE ?'
    countSql += ' AND title LIKE ?'
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
