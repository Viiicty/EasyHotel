import Taro from '@tarojs/taro'
import { userService } from './user.service'

const BASE_URL = 'http://localhost:8888'

export const bookingService = {
  async checkInventory(params: {
    roomTypeId: string
    checkIn: string
    checkOut: string
    rooms: number
  }) {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${BASE_URL}/mini/booking/check-inventory`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: params
    })
    console.log('=== checkInventory 响应 ===')
    console.log('response:', response)
    console.log('response.data:', response.data)
    console.log('response.data.data:', response.data?.data)
    return response.data?.data || response.data
  },

  async prepareBooking(params: {
    hotelId: string
    roomTypeId: string
    checkIn: string
    checkOut: string
    rooms: number
    adults: number
    children: number
  }) {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${BASE_URL}/mini/booking/prepare`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: params
    })
    console.log('=== prepareBooking 响应 ===')
    console.log('response:', response)
    console.log('response.data:', response.data)
    console.log('response.data.data:', response.data?.data)
    return response.data?.data || response.data
  },

  async submitBooking(params: {
    hotelId: string
    roomTypeId: string
    checkIn: string
    checkOut: string
    rooms: number
    nights: number
    adults: number
    children: number
    guestName: string
    guestPhone: string
    idCard: string
    remarks?: string
  }) {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${BASE_URL}/mini/booking/submit`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: params
    })
    console.log('=== submitBooking 响应 ===')
    console.log('response:', response)
    console.log('response.data:', response.data)
    console.log('response.data.data:', response.data?.data)
    return response.data?.data || response.data
  },

  async confirmBooking(params: {
    orderId: string
    holdToken: string
  }) {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${BASE_URL}/mini/booking/confirm`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: params
    })
    console.log('=== confirmBooking 响应 ===')
    console.log('response:', response)
    console.log('response.data:', response.data)
    console.log('response.data.data:', response.data?.data)
    return response.data?.data || response.data
  },

  async cancelBooking(params: {
    orderId: string
    holdToken: string
  }) {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${BASE_URL}/mini/booking/cancel`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: params
    })
    console.log('=== cancelBooking 响应 ===')
    console.log('response:', response)
    console.log('response.data:', response.data)
    console.log('response.data.data:', response.data?.data)
    return response.data?.data || response.data
  },

  async mockPayment(params: {
    orderId: string
  }) {
    const token = userService.getToken()
    const response = await Taro.request({
      url: `${BASE_URL}/mini/booking/mock-payment`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: params
    })
    console.log('=== mockPayment 响应 ===')
    console.log('response:', response)
    console.log('response.data:', response.data)
    console.log('response.data.data:', response.data?.data)
    return response.data?.data || response.data
  }
}
