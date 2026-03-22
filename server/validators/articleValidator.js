const Joi = require('joi')

const articleStatusSchema = Joi.string().valid('draft', 'published').messages({
  'any.only': '文章状态只能是 draft 或 published'
})

const categoryIdSchema = Joi.number().integer().positive().allow(null).messages({
  'number.base': '分类 ID 必须是数字',
  'number.integer': '分类 ID 必须是整数',
  'number.positive': '分类 ID 必须大于 0'
})

const articleBodySchema = {
  title: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': '文章标题不能为空',
    'string.min': '文章标题至少 1 个字符',
    'string.max': '文章标题最大 100 个字符',
    'any.required': '文章标题不能为空'
  }),
  content: Joi.string().max(50000).allow('', null).messages({
    'string.max': '文章内容最大 50000 个字符'
  }),
  status: articleStatusSchema.default('draft'),
  categoryId: categoryIdSchema.default(null)
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
    'string.max': '搜索关键字最大 50 个字符'
  }),
  status: Joi.string().valid('all', 'draft', 'published').default('all').messages({
    'any.only': '筛选状态只能是 all、draft 或 published'
  }),
  categoryId: Joi.number().integer().positive().messages({
    'number.base': '分类筛选必须是数字',
    'number.integer': '分类筛选必须是整数',
    'number.positive': '分类筛选必须大于 0'
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
