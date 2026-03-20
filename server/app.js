const express = require('express')
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const config = require('./config')
const articleRouter = require('./routes/article')
const userRouter = require('./routes/user')
const uploadRouter = require('./routes/upload')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// 静态资源服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 路由
app.use(articleRouter)
app.use(userRouter)
app.use(uploadRouter)

// 错误处理
app.use(errorHandler)

app.listen(config.port, () => {
  console.log('server is running at http://localhost:' + config.port)
})