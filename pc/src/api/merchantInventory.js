const API_BASE = '/api'

const getToken = () => {
  return localStorage.getItem('token')
}

export const merchantInventoryApi = {
  getHotels: async () => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/merchant/hotels`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('获取酒店列表失败')
    }
    const { data } = await response.json()
    return data
  },

  getRoomTypes: async (hotelId) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/merchant/room-types?hotelId=${hotelId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('获取房型列表失败')
    }
    const { data } = await response.json()
    return data
  },

  getDailyPrices: async (ratePlanIds, from, to) => {
    const token = getToken()
    const response = await fetch(
      `${API_BASE}/merchant/rate-plans/daily?ratePlanIds=${ratePlanIds.join(',')}&from=${from}&to=${to}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
    if (!response.ok) {
      throw new Error('获取每日价格失败')
    }
    const { data } = await response.json()
    return data
  },

  getDailyInventory: async (roomTypeIds, from, to) => {
    const token = getToken()
    const response = await fetch(
      `${API_BASE}/merchant/inventory/daily?roomTypeIds=${roomTypeIds.join(',')}&from=${from}&to=${to}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
    if (!response.ok) {
      throw new Error('获取每日库存失败')
    }
    const { data } = await response.json()
    return data
  },

  updateDailyPrice: async (ratePlanId, data) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/merchant/rate-plans/${ratePlanId}/daily`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('更新价格失败')
    }
  },

  updateDailyInventory: async (roomTypeId, data) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/merchant/inventory/${roomTypeId}/daily`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('更新库存失败')
    }
  },
}
