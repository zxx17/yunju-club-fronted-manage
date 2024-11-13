import request from '@/utils/request'

// 查询题目分类列表
export function listCategory(query) {
  return request({
    url: '/qsbank/category/list',
    method: 'get',
    params: query
  })
}

// 查询题目分类详细
export function getCategory(id) {
  return request({
    url: '/qsbank/category/' + id,
    method: 'get'
  })
}

// 新增题目分类
export function addCategory(data) {
  return request({
    url: '/qsbank/category',
    method: 'post',
    data: data
  })
}

// 修改题目分类
export function updateCategory(data) {
  return request({
    url: '/qsbank/category',
    method: 'put',
    data: data
  })
}

// 删除题目分类
export function delCategory(id) {
  return request({
    url: '/qsbank/category/' + id,
    method: 'delete'
  })
}
