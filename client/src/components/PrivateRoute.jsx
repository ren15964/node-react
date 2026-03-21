import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '../context/useAuth'

function PrivateRoute({ children }) {
  const { isLoggedIn, isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="flex justify-center py-16">
        <Spin size="large" tip="正在验证登录状态..." />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute
