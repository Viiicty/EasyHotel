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

const getCurrentUserId = () => {
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const parsed = JSON.parse(user)
      return parsed.id
    } catch (error) {
      console.error('Error parsing user:', error)
    }
  }
  return null
}

export const merchantInventoryApi = {
  getHotels: async () => {
    console.log('=== API调用: getHotels ===')
    const token = getToken()
    console.log('=== Token ===', token)
    const url = `${API_BASE}/merchant/hotels`
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
      throw new Error('获取酒店列表失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data || []
  },

  getRoomTypes: async (hotelId) => {
    console.log('=== API调用: getRoomTypes ===', '酒店ID:', hotelId)
    const token = getToken()
    const url = `${API_BASE}/merchant/room-types?hotelId=${hotelId}`
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
      throw new Error('获取房型列表失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data || []
  },

  getDailyPrices: async (hotelId, startDate, endDate) => {
    console.log('=== API调用: getDailyPrices ===', '酒店ID:', hotelId, '日期范围:', startDate, '-', endDate)
    const token = getToken()
    const url = `${API_BASE}/room-type-price-daily/hotel/${hotelId}?startDate=${startDate}&endDate=${endDate}`
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
      throw new Error('获取价格数据失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data || []
  },

  getDailyInventory: async (roomTypeIds, startDate, endDate) => {
    console.log('=== API调用: getDailyInventory ===', '房型IDs:', roomTypeIds, '日期范围:', startDate, '-', endDate)
    const token = getToken()
    const url = `${API_BASE}/merchant/inventory/daily?roomTypeIds=${roomTypeIds.join(',')}&from=${startDate}&to=${endDate}`
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
      throw new Error('获取库存数据失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data || []
  },

  createPrice: async (priceData) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/room-type-price-daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(priceData)
    })
    if (!response.ok) {
      throw new Error('创建价格失败')
    }
    const result = await response.json()
    return result.data
  },

  batchUpdatePrices: async (hotelId, roomTypeId, startDate, endDate, price) => {
    console.log('=== API调用: batchUpdatePrices ===', '酒店ID:', hotelId, '房型ID:', roomTypeId, '日期范围:', startDate, '-', endDate, '价格:', price)
    const token = getToken()
    const url = `${API_BASE}/room-type-price-daily/batch/${hotelId}/${roomTypeId}?startDate=${startDate}&endDate=${endDate}&price=${price}`
    console.log('=== 请求URL ===', url)
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    console.log('=== 响应状态 ===', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('=== 响应错误 ===', errorText)
      throw new Error('批量更新价格失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data || []
  },

  updateDefaultPrice: async (roomTypeId, defaultPrice) => {
    console.log('=== API调用: updateDefaultPrice ===', '房型ID:', roomTypeId, '默认价格:', defaultPrice)
    const token = getToken()
    const url = `${API_BASE}/merchant/room-types/${roomTypeId}/default-price`
    console.log('=== 请求URL ===', url)
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ defaultPrice })
    })
    console.log('=== 响应状态 ===', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('=== 响应错误 ===', errorText)
      throw new Error('更新默认价格失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data
  },

  updateDefaultInventory: async (roomTypeId, defaultInventory) => {
    console.log('=== API调用: updateDefaultInventory ===', '房型ID:', roomTypeId, '默认库存:', defaultInventory)
    const token = getToken()
    const url = `${API_BASE}/merchant/room-types/${roomTypeId}/default-inventory`
    console.log('=== 请求URL ===', url)
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ defaultInventory })
    })
    console.log('=== 响应状态 ===', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('=== 响应错误 ===', errorText)
      throw new Error('更新默认库存失败')
    }
    const result = await response.json()
    console.log('=== 响应数据 ===', result)
    return result.data
  },

  initInventory: async (roomTypeId, startDate, endDate, totalQty) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/inventory/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        roomTypeId,
        from: startDate,
        to: endDate,
        totalQty
      })
    })
    if (!response.ok) {
      throw new Error('初始化库存失败')
    }
    const result = await response.json()
    return result.data
  },

  updateDailyInventory: async (roomTypeId, date, totalQty) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/merchant/inventory/${roomTypeId}/daily`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        date,
        totalQty
      })
    })
    if (!response.ok) {
      throw new Error('更新库存失败')
    }
    const result = await response.json()
    return result.data
  }
}
