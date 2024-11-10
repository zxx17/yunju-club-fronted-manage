import request from '@/utils/request'

// 查询社区C端用户操作日志列表
export function listUserLog(query) {
  return request({
    url: '/system/userLog/list',
    method: 'get',
    params: query
  })
}

// 查询社区C端用户操作日志详细
export function getUserLog(id) {
  return request({
    url: '/system/userLog/' + id,
    method: 'get'
  })
}

// 新增社区C端用户操作日志
export function addUserLog(data) {
  return request({
    url: '/system/userLog',
    method: 'post',
    data: data
  })
}

// 修改社区C端用户操作日志
export function updateUserLog(data) {
  return request({
    url: '/system/userLog',
    method: 'put',
    data: data
  })
}

// 删除社区C端用户操作日志
export function delUserLog(id) {
  return request({
    url: '/system/userLog/' + id,
    method: 'delete'
  })
}
