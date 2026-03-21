const multer = require('multer')
const AppError = require('../utils/AppError')
const { fail } = require('../utils/response')

const errorHandler = (err, req, res, next) => {
  console.error('错误:', err.message)

  // 自定义错误
  if (err instanceof AppError) {
    return fail(res, err.message, err.statusCode)
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return fail(res, '上传文件大小不能超过 5MB', 400)
    }

    return fail(res, '文件上传失败', 400)
  }

  if (err.message === '只允许上传 JPG、PNG、GIF、WEBP 格式的图片') {
    return fail(res, err.message, 400)
  }

  // 未知错误
  return fail(res, '服务器内部错误', 500)
}

module.exports = errorHandler
