const { success } = require('../utils/response')
const asyncHandler = require('../utils/asyncHandler')
const tagService = require('../services/tagService')

const getTags = asyncHandler(async (req, res) => {
  const tags = await tagService.listTags()
  success(res, tags)
})

module.exports = {
  getTags
}
