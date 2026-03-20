const pool = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { success } = require('../utils/response')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

// 用户注册
const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    throw new AppError('用户名和密码不能为空')
  }

  const [existing] = await pool.query(
    'SELECT id FROM users WHERE username = ?',
    [username]
  )

  if (existing.length > 0) {
    throw new AppError('用户名已存在')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const [result] = await pool.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword]
  )

  success(res, { id: result.insertId, username }, '注册成功')
})

// 用户登录
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    throw new AppError('用户名和密码不能为空')
  }

  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username]
  )

  if (rows.length === 0) {
    throw new AppError('用户名或密码错误')
  }

  const user = rows[0]
  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new AppError('用户名或密码错误')
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  )

  success(res, {
    token,
    userInfo: {
      id: user.id,
      username: user.username
    }
  }, '登录成功')
})

module.exports = {
  register,
  login
}