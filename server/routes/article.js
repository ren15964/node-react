const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController')

// 公开接口 —— 不需要登录
router.get('/api/articles', getArticles)
router.get('/api/articles/:id', getArticleById)

// 需要登录的接口 —— 加上 auth 中间件
router.post('/api/articles', auth, createArticle)
router.put('/api/articles/:id', auth, updateArticle)
router.delete('/api/articles/:id', auth, deleteArticle)

module.exports = router
