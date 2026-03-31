import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginSuccess, logout as logoutAction } from '../store/authSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const { token, userInfo, isInitializing } = useSelector((state) => state.auth)

  return useMemo(
    () => ({
      token,
      userInfo,
      username: userInfo?.username || '',
      isLoggedIn: !!token,
      isInitializing,
      login: (newToken, newUserInfo) => {
        dispatch(
          loginSuccess({
            token: newToken,
            userInfo: newUserInfo
          })
        )
      },
      logout: () => {
        dispatch(logoutAction())
      }
    }),
    [dispatch, isInitializing, token, userInfo]
  )
}
