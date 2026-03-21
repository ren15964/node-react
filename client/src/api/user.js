import request from '../utils/request'

export function loginUser(data) {
  return request.post('/api/user/login', data)
}

export function registerUser(data) {
  return request.post('/api/user/register', data)
}

export function fetchCurrentUser() {
  return request.get('/api/user/profile')
}
