import request from '@/utils/request'

// 查询圈子信息列表
export function listTopic(query) {
  return request({
    url: '/circle/topic/list',
    method: 'get',
    params: query
  })
}

// 查询圈子信息详细
export function getTopic(id) {
  return request({
    url: '/circle/topic/' + id,
    method: 'get'
  })
}

// 新增圈子信息
export function addTopic(data) {
  return request({
    url: '/circle/topic',
    method: 'post',
    data: data
  })
}

// 修改圈子信息
export function updateTopic(data) {
  return request({
    url: '/circle/topic',
    method: 'put',
    data: data
  })
}

// 删除圈子信息
export function delTopic(id) {
  return request({
    url: '/circle/topic/' + id,
    method: 'delete'
  })
}
