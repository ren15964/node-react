import { createContext, useState } from 'react'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [username, setUsername] = useState(localStorage.getItem('username') || '')

  const login = (newToken, newUsername) => {
    setToken(newToken)
    setUsername(newUsername)
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUsername)
  }

  const logout = () => {
    setToken('')
    setUsername('')
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  const isLoggedIn = !!token

  const contextValue = {
    token: token,
    username: username,
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
