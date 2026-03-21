const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')
const {
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema,
  articleIdParamSchema
} = require('../validators/articleValidator')
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  restoreArticle
} = require('../controllers/articleController')

router.get('/api/articles', validate(articleQuerySchema, 'query'), getArticles)
router.get('/api/articles/:id', validate(articleIdParamSchema, 'params'), getArticleById)
router.post('/api/articles', auth, validate(createArticleSchema), createArticle)
router.put(
  '/api/articles/:id',
  auth,
  validate(articleIdParamSchema, 'params'),
  validate(updateArticleSchema),
  updateArticle
)
router.delete('/api/articles/:id', auth, validate(articleIdParamSchema, 'params'), deleteArticle)
router.patch(
  '/api/articles/:id/restore',
  auth,
  validate(articleIdParamSchema, 'params'),
  restoreArticle
)

module.exports = router
