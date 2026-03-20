import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" />
  }

  return children
}

export default PrivateRoute