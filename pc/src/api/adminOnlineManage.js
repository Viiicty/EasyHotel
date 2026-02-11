const API_BASE = '/api'

const getToken = () => {
  return localStorage.getItem('token')
}

export const adminOnlineManageApi = {
  getHotels: async (params = {}) => {
    const token = getToken()
    const queryParams = new URLSearchParams()
    if (params.available) queryParams.append('available', params.available)
    if (params.city) queryParams.append('city', params.city)
    if (params.keyword) queryParams.append('keyword', params.keyword)

    const response = await fetch(`${API_BASE}/admin/online-manage/hotels?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch hotels')
    }
    const result = await response.json()
    return result.data
  },

  setOnline: async (hotelId) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/admin/online-manage/hotels/${hotelId}/online`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to set hotel online')
    }
    const result = await response.json()
    return result.data
  },

  setOffline: async (hotelId, reason) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/admin/online-manage/hotels/${hotelId}/offline`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    })
    if (!response.ok) {
      throw new Error('Failed to set hotel offline')
    }
    const result = await response.json()
    return result.data
  }
}
