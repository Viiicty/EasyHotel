const API_BASE = '/api'

const getToken = () => {
  return localStorage.getItem('token')
}

export const adminMerchantManageApi = {
  createMerchant: async (data) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...data, role: 'merchant' })
    })
    if (!response.ok) {
      throw new Error('Failed to create merchant')
    }
    const result = await response.json()
    return result.data
  },

  getMerchants: async (params = {}) => {
    const token = getToken()
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.keyword) queryParams.append('keyword', params.keyword)

    const response = await fetch(`${API_BASE}/admin/merchant-manage/merchants?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch merchants')
    }
    const result = await response.json()
    return result.data
  },

  deleteMerchant: async (merchantId) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/admin/merchant-manage/merchants/${merchantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to delete merchant')
    }
    const result = await response.json()
    return result.data
  },

  updateMerchantStatus: async (merchantId, status) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/admin/merchant-manage/merchants/${merchantId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })
    if (!response.ok) {
      throw new Error('Failed to update merchant status')
    }
    const result = await response.json()
    return result.data
  },

  updateMerchant: async (merchantId, data) => {
    const token = getToken()
    const response = await fetch(`${API_BASE}/admin/merchant-manage/merchants/${merchantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error('Failed to update merchant')
    }
    const result = await response.json()
    return result.data
  }
}
