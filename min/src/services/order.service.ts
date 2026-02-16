import { getToken } from './user.service'

const API_BASE = 'http://192.168.3.22:8888'

export const orderService = {
  getUserOrders: async (params: { status?: string; page?: number; pageSize?: number }) => {
    const token = getToken()
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.page) queryParams.append('page', String(params.page))
    if (params.pageSize) queryParams.append('pageSize', String(params.pageSize))

    const response = await fetch(`${API_BASE}/mini/orders?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('获取订单列表失败')
    }

    const result = await response.json()
    return result.data
  },

  getOrderById: async (orderId: string) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/mini/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('获取订单详情失败')
    }

    const result = await response.json()
    return result.data
  },

  getOrderStatus: async (orderId: string) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/mini/orders/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('获取订单状态失败')
    }

    const result = await response.json()
    return result.data
  },

  confirmOrder: async (orderId: string) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/mini/orders/${orderId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('确认订单失败')
    }

    const result = await response.json()
    return result.data
  },

  cancelOrder: async (orderId: string) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/mini/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('取消订单失败')
    }

    const result = await response.json()
    return result.data
  },

  deleteOrder: async (orderId: string) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/mini/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('删除订单失败')
    }

    const result = await response.json()
    return result.data
  }
}
