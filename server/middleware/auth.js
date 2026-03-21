const jwt = require('jsonwebtoken')
const config = require('../config')
const { fail } = require('../utils/response')

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return fail(res, '未登录，请先登录', 401)
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return fail(res, '登录凭证格式错误', 401)
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded
    next()
  } catch (err) {
    return fail(res, '登录已失效，请重新登录', 401)
  }
}

module.exports = auth
