const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const { uploadImage } = require('../controllers/uploadController')

// 上传图片（需要登录）
router.post('/api/upload', auth, upload.single('file'), uploadImage)

module.exports = router
