const API_BASE = '/api'

const getToken = () => {
  return localStorage.getItem('token')
}

export const adminOnlineManageApi = {
  getHotels: async (params = {}) => {
    const token = getToken()
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
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
    return response.json()
  },

  getHotelDetail: async (hotelId) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/admin/online-manage/hotels/${hotelId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch hotel detail')
    }
    return response.json()
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
    return response.json()
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
    return response.json()
  }
}
