const AppError = require('../utils/AppError')

const errorHandler = (err, req, res, next) => {
  console.error('错误:', err.message)

  // 自定义错误
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      data: null
    })
  }

  // 未知错误
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  })
}

module.exports = errorHandler
