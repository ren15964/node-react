import { createContext, useEffect, useState } from 'react'
import { fetchCurrentUser } from '../api/user'

export const AuthContext = createContext()

const clearStoredAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [userInfo, setUserInfo] = useState(null)
  const [isInitializing, setIsInitializing] = useState(Boolean(localStorage.getItem('token')))

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      if (!token) {
        setIsInitializing(false)
        return
      }

      setIsInitializing(true)

      try {
        const res = await fetchCurrentUser()

        if (!isMounted) {
          return
        }

        setUserInfo(res.data)
        localStorage.setItem('username', res.data.username)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setToken('')
        setUserInfo(null)
        clearStoredAuth()
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [token])

  const login = (newToken, newUserInfo) => {
    setToken(newToken)
    setUserInfo(newUserInfo)
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUserInfo.username)
  }

  const logout = () => {
    setToken('')
    setUserInfo(null)
    clearStoredAuth()
  }

  const contextValue = {
    token,
    userInfo,
    username: userInfo?.username || '',
    isLoggedIn: !!token,
    isInitializing,
    login,
    logout
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
