const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../db')
const config = require('../config')
const AppError = require('../utils/AppError')

const toSafeUser = (user) => ({
  id: user.id,
  username: user.username
})

const registerUser = async ({ username, password }) => {
  const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ?', [username])

  if (existingUsers.length > 0) {
    throw new AppError('用户名已存在')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [
    username,
    hashedPassword
  ])

  return {
    id: result.insertId,
    username
  }
}

const loginUser = async ({ username, password }) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username])

  if (rows.length === 0) {
    throw new AppError('用户名或密码错误')
  }

  const user = rows[0]
  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new AppError('用户名或密码错误')
  }

  const userInfo = toSafeUser(user)
  const token = jwt.sign(userInfo, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })

  return {
    token,
    userInfo
  }
}

const getUserProfile = async (userId) => {
  const [rows] = await pool.query('SELECT id, username, created_at FROM users WHERE id = ? LIMIT 1', [
    userId
  ])

  if (rows.length === 0) {
    throw new AppError('用户不存在', 404)
  }

  return rows[0]
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
}
