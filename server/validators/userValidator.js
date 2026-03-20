const Joi = require('joi')

const registerSchema = Joi.object({
  username: Joi.string().trim().min(2).max(20).required().messages({
    'string.empty': '用户名不能为空',
    'string.min': '用户名至少 2 个字符',
    'string.max': '用户名最多 20 个字符',
    'any.required': '用户名不能为空'
  }),
  password: Joi.string().min(6).max(50).required().messages({
    'string.empty': '密码不能为空',
    'string.min': '密码至少 6 个字符',
    'string.max': '密码最多 50 个字符',
    'any.required': '密码不能为空'
  })
})

const loginSchema = Joi.object({
  username: Joi.string().trim().required().messages({
    'string.empty': '用户名不能为空',
    'any.required': '用户名不能为空'
  }),
  password: Joi.string().required().messages({
    'string.empty': '密码不能为空',
    'any.required': '密码不能为空'
  })
})

module.exports = {
  registerSchema,
  loginSchema
}
