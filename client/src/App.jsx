import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Button, Space } from 'antd'
import { LogoutOutlined, EditOutlined } from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import Login from './pages/Login'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import ArticleEdit from './pages/ArticleEdit'
import Upload from './pages/Upload'
import PrivateRoute from './components/PrivateRoute'
import { useAuth } from './context/useAuth'
import { initializeAuth } from './store/authSlice'

function NavBar() {
  const { isLoggedIn, username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="h-16 bg-white border-b border-gray-200 px-10 flex items-center">
      <Link to="/" className="text-xl font-bold text-gray-800 no-underline mr-auto">
        博客系统
      </Link>

      <Space size="middle">
        <Link to="/articles" className="text-gray-600 no-underline hover:text-blue-500">
          文章列表
        </Link>

        {isLoggedIn ? (
          <>
            <Link to="/articles/new" className="text-gray-600 no-underline hover:text-blue-500">
              <EditOutlined className="mr-1" />
              写文章
            </Link>
            <Link to="/upload" className="text-gray-600 no-underline hover:text-blue-500">
              上传图片
            </Link>
            <span className="text-gray-800 text-sm">{username}</span>
            <Button size="small" icon={<LogoutOutlined />} onClick={handleLogout}>
              退出
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button type="primary" size="small">
              登录
            </Button>
          </Link>
        )}
      </Space>
    </nav>
  )
}

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <NavBar />

        <main className="max-w-4xl mx-auto py-6 px-5">
          <Routes>
            <Route
              path="/"
              element={
                <div className="bg-white rounded-lg shadow-sm p-10 text-center">
                  <h1 className="text-3xl font-bold text-gray-800 mb-3">欢迎来到博客系统</h1>
                  <p className="text-gray-500">一个使用 React + Node.js 构建的全栈应用</p>
                </div>
              }
            />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route
              path="/articles/new"
              element={
                <PrivateRoute>
                  <ArticleEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/articles/edit/:id"
              element={
                <PrivateRoute>
                  <ArticleEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <Upload />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
