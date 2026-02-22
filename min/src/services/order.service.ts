import Taro from '@tarojs/taro'
import { userService } from './user.service'

const API_BASE = 'http://localhost:8888'

export const orderService = {
  getUserOrders: async (params: { status?: string; page?: number; pageSize?: number }) => {
    const token = userService.getToken()
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.page) queryParams.append('page', String(params.page))
    if (params.pageSize) queryParams.append('pageSize', String(params.pageSize))

    const response = await Taro.request({
      url: `${API_BASE}/mini/orders?${queryParams.toString()}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.statusCode !== 200) {
      throw new Error('获取订单列表失败')
    }

    return response.data.data
  },

  getPendingOrder: async () => {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${API_BASE}/mini/orders/pending`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('=== getPendingOrder 响应 ===')
    console.log('statusCode:', response.statusCode)
    console.log('data:', response.data)

    if (response.statusCode !== 200) {
      console.error('getPendingOrder 失败:', response.data)
      return null
    }

    return response.data.data
  },

  getOrderById: async (orderId: string) => {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${API_BASE}/mini/orders/${orderId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.statusCode !== 200) {
      throw new Error('获取订单详情失败')
    }

    return response.data.data
  },

  getOrderStatus: async (orderId: string) => {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${API_BASE}/mini/orders/${orderId}/status`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.statusCode !== 200) {
      throw new Error('获取订单状态失败')
    }

    return response.data.data
  },

  confirmOrder: async (orderId: string) => {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${API_BASE}/mini/orders/${orderId}/confirm`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.statusCode !== 200 && response.statusCode !== 201) {
      throw new Error('确认订单失败')
    }

    return response.data.data
  },

  cancelOrder: async (orderId: string) => {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${API_BASE}/mini/orders/${orderId}/cancel`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('=== cancelOrder 响应 ===')
    console.log('statusCode:', response.statusCode)
    console.log('response.data:', response.data)

    if (response.statusCode !== 200 && response.statusCode !== 201) {
      const errorMessage = response.data?.message || response.data?.error || '取消订单失败'
      throw new Error(errorMessage)
    }

    return response.data.data
  },

  payOrder: async (orderId: string) => {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${API_BASE}/mini/orders/${orderId}/pay`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('=== payOrder 响应 ===')
    console.log('statusCode:', response.statusCode)
    console.log('response.data:', response.data)

    if (response.statusCode !== 200 && response.statusCode !== 201) {
      const errorMessage = response.data?.message || response.data?.error || '支付失败'
      throw new Error(errorMessage)
    }

    return response.data.data
  },

  deleteOrder: async (orderId: string) => {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${API_BASE}/mini/orders/${orderId}`,
      method: 'DELETE',
      header: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.statusCode !== 200) {
      throw new Error('删除订单失败')
    }

    return response.data.data
  }
}
