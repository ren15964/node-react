const { success } = require('../utils/response')
const AppError = require('../utils/AppError')
const asyncHandler = require('../utils/asyncHandler')

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('请选择要上传的文件')
  }

  const fileUrl = '/uploads/' + req.file.filename

  success(
    res,
    {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    },
    '上传成功'
  )
})

module.exports = {
  uploadImage
}
