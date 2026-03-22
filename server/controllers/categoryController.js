const { success } = require('../utils/response')
const asyncHandler = require('../utils/asyncHandler')
const categoryService = require('../services/categoryService')

const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories()
  success(res, categories)
})

module.exports = {
  getCategories
}
