const API_BASE = '/api'

const getToken = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('=== 未找到Token ===')
    return null
  }
  console.log('=== 当前Token ===', token)
  return token
}

export const merchantOrderApi = {
  getOrders: async (params = {}) => {
    console.log('=== API调用: getOrders ===', params)
    const token = getToken()
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.page) queryParams.append('page', params.page)
    if (params.pageSize) queryParams.append('pageSize', params.pageSize)

    const url = `${API_BASE}/merchant/orders?${queryParams.toString()}`
    console.log('=== 请求URL ===', url)
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('=== 响应状态 ===', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('=== 响应错误 ===', errorText)
      throw new Error('获取订单列表失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data || { orders: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }
  },

  getOrderById: async (orderId) => {
    console.log('=== API调用: getOrderById ===', '订单ID:', orderId)
    const token = getToken()
    const url = `${API_BASE}/merchant/orders/${orderId}`
    console.log('=== 请求URL ===', url)
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('=== 响应状态 ===', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('=== 响应错误 ===', errorText)
      throw new Error('获取订单详情失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data
  },

  confirmOrder: async (orderId) => {
    console.log('=== API调用: confirmOrder ===', '订单ID:', orderId)
    const token = getToken()
    const url = `${API_BASE}/merchant/orders/${orderId}/confirm`
    console.log('=== 请求URL ===', url)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('=== 响应状态 ===', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('=== 响应错误 ===', errorText)
      throw new Error('确认订单失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data
  },

  rejectOrder: async (orderId, rejectReason) => {
    console.log('=== API调用: rejectOrder ===', '订单ID:', orderId, '拒绝原因:', rejectReason)
    const token = getToken()
    const url = `${API_BASE}/merchant/orders/${orderId}/reject`
    console.log('=== 请求URL ===', url)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rejectReason })
    })
    console.log('=== 响应状态 ===', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('=== 响应错误 ===', errorText)
      throw new Error('拒绝订单失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data
  }
}
