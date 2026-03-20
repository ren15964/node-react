const express = require('express')
const router = express.Router()
const { register, login } = require('../controllers/userController')

// 注册
router.post('/api/user/register', register)

// 登录
router.post('/api/user/login', login)

module.exports = router