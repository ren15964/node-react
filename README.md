# Fullstack Blog

这是一个用于学习 React + Node.js 的全栈博客项目，目标不是做一个简单练手项目，而是逐步把它打造成可以用于求职展示的作品。

## 当前技术栈

- 前端：React、Vite、React Router、Ant Design、Axios
- 后端：Node.js、Express、MySQL、JWT、Joi、Multer
- 数据库：MySQL

## 目录结构

```text
node-react/
  client/   前端项目
  server/   后端项目
```

## 首次安装

在项目根目录执行：

```bash
npm install
```

然后分别安装前后端依赖：

```bash
npm install --prefix server
npm install --prefix client
```

## 环境变量

后端配置位于 `server/.env`。

- 仓库中保留的是模板文件：`server/.env.example`
- 本地开发实际读取的是：`server/.env`
- `server/.env` 已加入忽略规则，不应提交真实密码、密钥等敏感信息

当前后端会读取这些配置：

- `PORT`：后端服务端口
- `DB_HOST`：数据库主机地址
- `DB_PORT`：数据库端口
- `DB_USER`：数据库用户名
- `DB_PASSWORD`：数据库密码
- `DB_NAME`：数据库名
- `JWT_SECRET`：JWT 签名密钥
- `JWT_EXPIRES_IN`：JWT 过期时间

## 数据库初始化

第一次创建数据库时，执行：

```bash
mysql -u root -p < server/sql/init.sql
```

如果你本地已经有旧版数据库，只是要把文章表升级到当前结构，执行：

```bash
mysql -u root -p fullstack_blog < server/sql/migrate_article_schema.sql
```

两份脚本的区别：

- `server/sql/init.sql`：给新环境使用，从 0 创建完整表结构和初始化数据
- `server/sql/migrate_article_schema.sql`：给旧环境升级使用，补齐文章模块新增字段、索引、外键和分类数据

## 上传目录

- 上传文件会保存到 `server/uploads/`
- 仓库中保留 `.gitkeep` 只是为了保留目录结构
- 真正上传的图片文件不应提交到 Git

## 开发启动

在项目根目录执行：

```bash
npm run dev
```

这个命令会同时启动：

- 后端开发服务：`npm run dev --prefix server`
- 前端开发服务：`npm run dev --prefix client`

如果你只想单独启动某一端，也可以执行：

```bash
npm run dev:server
npm run dev:client
```

## 生产构建与启动

前端构建：

```bash
npm run build
```

后端启动：

```bash
npm run start
```

## 当前阶段说明

项目还在持续迭代中，接下来会逐步补齐：

- 启动与部署说明
- 更清晰的模块分层
- 测试和质量保障
- 安全与权限设计

详细规划见 [LEARNING_ROADMAP.md](./LEARNING_ROADMAP.md)。
