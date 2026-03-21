const { success } = require('../utils/response')
const asyncHandler = require('../utils/asyncHandler')
const articleService = require('../services/articleService')

const getArticles = asyncHandler(async (req, res) => {
  const articleList = await articleService.listArticles(req.query)
  success(res, articleList)
})

const getArticleById = asyncHandler(async (req, res) => {
  const article = await articleService.getArticleById(req.params.id)
  success(res, article)
})

const createArticle = asyncHandler(async (req, res) => {
  const createdArticle = await articleService.createArticle({
    ...req.body,
    authorId: req.user.id
  })

  success(res, createdArticle, '文章创建成功')
})

const updateArticle = asyncHandler(async (req, res) => {
  await articleService.updateArticle(req.params.id, req.body, req.user.id)
  success(res, null, '文章更新成功')
})

const deleteArticle = asyncHandler(async (req, res) => {
  await articleService.deleteArticle(req.params.id, req.user.id)
  success(res, null, '文章删除成功')
})

const restoreArticle = asyncHandler(async (req, res) => {
  await articleService.restoreArticle(req.params.id, req.user.id)
  success(res, null, '文章恢复成功')
})

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  restoreArticle
}
