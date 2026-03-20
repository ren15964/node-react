const express = require('express')
const router = express.Router()
const validate = require('../middleware/validate')
const { registerSchema, loginSchema } = require('../validators/userValidator')
const { register, login } = require('../controllers/userController')

router.post('/api/user/register', validate(registerSchema), register)
router.post('/api/user/login', validate(loginSchema), login)

module.exports = router
