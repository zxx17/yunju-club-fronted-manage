import request from '@/utils/request'

// 查询虚拟仿真实验用户记录列表
export function listUser(query) {
  return request({
    url: '/iotsimlab/lab/finish/list',
    method: 'get',
    params: query
  })
}

// 查询虚拟仿真实验用户记录详细
export function getUser(id) {
  return request({
    url: '/iotsimlab/lab/finish/' + id,
    method: 'get'
  })
}

// 新增虚拟仿真实验用户记录
export function addUser(data) {
  return request({
    url: '/iotsimlab/lab/finish/',
    method: 'post',
    data: data
  })
}

// 修改虚拟仿真实验用户记录
export function updateUser(data) {
  return request({
    url: '/iotsimlab/lab/finish/',
    method: 'put',
    data: data
  })
}

// 删除虚拟仿真实验用户记录
export function delUser(id) {
  return request({
    url: '/iotsimlab/lab/finish/' + id,
    method: 'delete'
  })
}
