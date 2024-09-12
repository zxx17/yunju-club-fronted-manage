import request from '@/utils/request'

// 查询虚拟仿真实验列表
export function listLab(query) {
  return request({
    url: '/iotsimlab/lab/list',
    method: 'get',
    params: query
  })
}

// 查询虚拟仿真实验详细
export function getLab(id) {
  return request({
    url: '/iotsimlab/lab/' + id,
    method: 'get'
  })
}

// 新增虚拟仿真实验
export function addLab(data) {
  return request({
    url: '/iotsimlab/lab',
    method: 'post',
    data: data
  })
}

// 修改虚拟仿真实验
export function updateLab(data) {
  return request({
    url: '/iotsimlab/lab',
    method: 'put',
    data: data
  })
}

// 删除虚拟仿真实验
export function delLab(id) {
  return request({
    url: '/iotsimlab/lab/' + id,
    method: 'delete'
  })
}
