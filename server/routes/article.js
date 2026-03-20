const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')
const {
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema
} = require('../validators/articleValidator')
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController')

router.get('/api/articles', validate(articleQuerySchema, 'query'), getArticles)
router.get('/api/articles/:id', getArticleById)
router.post('/api/articles', auth, validate(createArticleSchema), createArticle)
router.put('/api/articles/:id', auth, validate(updateArticleSchema), updateArticle)
router.delete('/api/articles/:id', auth, deleteArticle)

module.exports = router
