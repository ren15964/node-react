const jwt = require('jsonwebtoken')
const config = require('../config')

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return next()
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    req.user = jwt.verify(token, config.jwt.secret)
  } catch (err) {
    req.user = null
  }

  next()
}

module.exports = optionalAuth
