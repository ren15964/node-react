import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
})

// 请求拦截器：自动为已登录请求附带 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理登录失效场景
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')

      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default request
