import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Articles from './pages/Articles'
import ArticleEdit from './pages/ArticleEdit'
import PrivateRoute from './components/PrivateRoute'
import { useAuth } from './context/useAuth'

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  padding: '0 40px',
  height: '60px',
  backgroundColor: '#fff',
  borderBottom: '1px solid #eee'
}

const logoStyle = {
  fontWeight: 'bold',
  fontSize: '20px',
  color: '#333',
  textDecoration: 'none',
  marginRight: 'auto'
}

const linkStyle = {
  color: '#666',
  textDecoration: 'none'
}

const userStyle = {
  fontSize: '14px',
  color: '#333'
}

const logoutBtnStyle = {
  padding: '6px 12px',
  backgroundColor: '#fff',
  color: '#666',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '13px',
  cursor: 'pointer'
}

const mainStyle = {
  maxWidth: '800px',
  margin: '20px auto',
  padding: '0 20px'
}

function NavBar() {
  const { isLoggedIn, username, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={navStyle}>
      <Link to="/" style={logoStyle}>博客系统</Link>
      <Link to="/articles" style={linkStyle}>文章列表</Link>

      {isLoggedIn ? (
        <>
          <span style={userStyle}>{username}</span>
          <button style={logoutBtnStyle} onClick={handleLogout}>
            退出登录
          </button>
        </>
      ) : (
        <Link to="/login" style={linkStyle}>登录</Link>
      )}
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <NavBar />

        <div style={mainStyle}>
          <Routes>
            <Route path="/" element={<div>首页 - 欢迎来到博客系统</div>} />
            <Route path="/articles" element={<Articles />} />
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
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App