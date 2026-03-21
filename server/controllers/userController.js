const { success } = require('../utils/response')
const asyncHandler = require('../utils/asyncHandler')
const userService = require('../services/userService')

const register = asyncHandler(async (req, res) => {
  const user = await userService.registerUser(req.body)
  success(res, user, '注册成功')
})

const login = asyncHandler(async (req, res) => {
  const loginResult = await userService.loginUser(req.body)
  success(res, loginResult, '登录成功')
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = await userService.getUserProfile(req.user.id)
  success(res, currentUser)
})

module.exports = {
  register,
  login,
  getCurrentUser
}
