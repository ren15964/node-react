import request from '../utils/request'

export function fetchCategories() {
  return request.get('/api/categories')
}
