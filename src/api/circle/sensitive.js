import request from '@/utils/request'

// 查询敏感词列表
export function listSensitive(query) {
  return request({
    url: '/circle/sensitive/list',
    method: 'get',
    params: query
  })
}

// 查询敏感词详细
export function getSensitive(id) {
  return request({
    url: '/circle/sensitive/' + id,
    method: 'get'
  })
}

// 新增敏感词
export function addSensitive(data) {
  return request({
    url: '/circle/sensitive',
    method: 'post',
    data: data
  })
}

// 修改敏感词
export function updateSensitive(data) {
  return request({
    url: '/circle/sensitive',
    method: 'put',
    data: data
  })
}

// 删除敏感词
export function delSensitive(id) {
  return request({
    url: '/circle/sensitive/' + id,
    method: 'delete'
  })
}
