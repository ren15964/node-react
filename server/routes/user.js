const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const validate = require('../middleware/validate')
const { registerSchema, loginSchema } = require('../validators/userValidator')
const { register, login, getCurrentUser } = require('../controllers/userController')

router.post('/api/user/register', validate(registerSchema), register)
router.post('/api/user/login', validate(loginSchema), login)
router.get('/api/user/profile', auth, getCurrentUser)

module.exports = router
