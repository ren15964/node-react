const jwt = require('jsonwebtoken')
const config = require('../config')

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: '未登录，请先登录'
    })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: 'token 格式错误'
    })
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      code: 401,
      message: 'token 无效或已过期，请重新登录'
    })
  }
}

module.exports = auth
