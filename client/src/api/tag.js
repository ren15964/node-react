import request from '../utils/request'

export function fetchTags() {
  return request.get('/api/tags')
}
