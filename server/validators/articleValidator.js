const Joi = require('joi')

const articleBodySchema = {
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': '文章标题不能为空',
    'string.min': '文章标题至少 1 个字符',
    'string.max': '文章标题最多 100 个字符',
    'any.required': '文章标题不能为空'
  }),
  content: Joi.string().max(50000).allow('', null).messages({
    'string.max': '文章内容最多 50000 个字符'
  })
}

const createArticleSchema = Joi.object(articleBodySchema)

const updateArticleSchema = Joi.object(articleBodySchema)

const articleQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'page 必须是数字',
    'number.min': 'page 最小为 1'
  }),
  pageSize: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'pageSize 必须是数字',
    'number.max': 'pageSize 最大为 100'
  }),
  keyword: Joi.string().trim().max(50).allow('', null).messages({
    'string.max': '搜索关键词最多 50 个字符'
  })
})

const articleIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '文章 ID 必须是数字',
    'number.integer': '文章 ID 必须是整数',
    'number.positive': '文章 ID 必须大于 0',
    'any.required': '文章 ID 不能为空'
  })
})

module.exports = {
  createArticleSchema,
  updateArticleSchema,
  articleQuerySchema,
  articleIdParamSchema
}
