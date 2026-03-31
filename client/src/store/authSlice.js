import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchCurrentUser } from '../api/user'

const AUTH_STORAGE_KEYS = {
  token: 'token',
  username: 'username'
}

const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token)
  localStorage.removeItem(AUTH_STORAGE_KEYS.username)
}

const persistAuth = (token, userInfo) => {
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token)
  localStorage.setItem(AUTH_STORAGE_KEYS.username, userInfo.username)
}

const getStoredToken = () => localStorage.getItem(AUTH_STORAGE_KEYS.token) || ''

export const initializeAuth = createAsyncThunk('auth/initializeAuth', async (_, thunkAPI) => {
  if (!getStoredToken()) {
    return null
  }

  try {
    const res = await fetchCurrentUser()
    localStorage.setItem(AUTH_STORAGE_KEYS.username, res.data.username)
    return res.data
  } catch (error) {
    clearStoredAuth()
    return thunkAPI.rejectWithValue(error.response?.data?.message || '登录已失效')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: getStoredToken(),
    userInfo: null,
    isInitializing: Boolean(getStoredToken())
  },
  reducers: {
    loginSuccess: (state, action) => {
      const { token, userInfo } = action.payload
      state.token = token
      state.userInfo = userInfo
      state.isInitializing = false
      persistAuth(token, userInfo)
    },
    logout: (state) => {
      state.token = ''
      state.userInfo = null
      state.isInitializing = false
      clearStoredAuth()
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isInitializing = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.userInfo = action.payload
        state.isInitializing = false
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.token = ''
        state.userInfo = null
        state.isInitializing = false
      })
  }
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
