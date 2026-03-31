const express = require('express')
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const config = require('./config')
const articleRouter = require('./routes/article')
const userRouter = require('./routes/user')
const uploadRouter = require('./routes/upload')
const categoryRouter = require('./routes/category')
const tagRouter = require('./routes/tag')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// 提供上传后的静态文件访问能力
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 注册业务路由
app.use(articleRouter)
app.use(userRouter)
app.use(uploadRouter)
app.use(categoryRouter)
app.use(tagRouter)

// 统一错误处理
app.use(errorHandler)

app.listen(config.port, () => {
  console.log('server is running at http://localhost:' + config.port)
})
