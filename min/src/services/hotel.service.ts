import Taro from '@tarojs/taro'

const BASE_URL = 'http://192.168.3.22:8888'

const request = async (config: Taro.request.Option) => {
  try {
    const res = await Taro.request({
      ...config,
      header: {
        'Content-Type': 'application/json',
        ...config.header
      }
    })
    return res
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}

export interface Hotel {
  id: string
  hotelName: string
  hotelNameEn: string
  merchant: string
  city: string
  starLevel: number
  status: string
  available: string
  roomTypeCount: number
  createdAt: string
  updatedAt: string
}

export interface HotelDetail {
  id: string
  hotelName: string
  hotelNameEn: string
  address: string
  city: string
  starLevel: number
  status: string
  available: string
  facilities: string
  tags: string
  checkInTime: string
  checkOutTime: string
  cancelPolicy: string
  changePolicy: string
  extraBedPolicy: string
  createdAt: string
  updatedAt: string
  coverImage?: string
}

export interface RoomType {
  id: string
  name: string
  bedType?: string
  breakfast?: string
  areaSqm?: number
  maxGuests?: number
  status: string
}

export interface Banner {
  id: string
  title?: string
  coverImage: string
  linkUrl?: string
  cityCode?: string
  status: string
  sortNo: number
  hotelId?: string
  hotel?: {
    id: string
    nameZh: string
    nameEn: string
    cityCode: string
    starLevel: number
    status: string
    available: string
    address: string
  }
}

export interface RoomPrice {
  date: string
  price: number
  available: number
}

export const hotelService = {
  async getHotelsByCity(cityCode: string): Promise<Hotel[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/mini/hotel/list`,
        method: 'GET',
        data: { cityCode }
      })
      return res.data.data || []
    } catch (error) {
      console.error('获取酒店列表失败:', error)
      return []
    }
  },

  async getHotelDetail(id: string): Promise<HotelDetail> {
    try {
      const res = await request({
        url: `${BASE_URL}/mini/hotel/${id}`,
        method: 'GET'
      })
      return res.data.data || null
    } catch (error) {
      console.error('获取酒店详情失败:', error)
      throw error
    }
  },

  async searchHotels(params: {
    city?: string
    keyword?: string
    starLevel?: number
    status?: string
    available?: string
  }): Promise<Hotel[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/mini/hotel/search`,
        method: 'GET',
        data: {
          cityCode: params.city,
          nameZh: params.keyword,
          starLevel: params.starLevel
        }
      })
      return res.data.data || []
    } catch (error) {
      console.error('搜索酒店失败:', error)
      return []
    }
  },

  async getBanners(): Promise<Banner[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/home-banner/mini/active`,
        method: 'GET'
      })
      return res.data.data || []
    } catch (error) {
      console.error('获取Banner失败:', error)
      return []
    }
  },

  async getHotelsByStarLevel(starLevel: number): Promise<Hotel[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/mini/hotel/by-star-level`,
        method: 'GET',
        data: { starLevel }
      })
      return res.data.data || []
    } catch (error) {
      console.error('按星级查询酒店失败:', error)
      return []
    }
  },

  async getBannerDetail(id: string): Promise<Banner | null> {
    try {
      const res = await request({
        url: `${BASE_URL}/home-banner/mini/${id}`,
        method: 'GET'
      })
      return res.data.data || null
    } catch (error) {
      console.error('获取Banner详情失败:', error)
      return null
    }
  },

  async getRecommendHotels(limit: number = 4): Promise<Hotel[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/mini/hotel/recommend?limit=${limit}`,
        method: 'GET'
      })
      return res.data.data || []
    } catch (error) {
      console.error('获取推荐酒店失败:', error)
      return []
    }
  },

  async getRoomTypesByHotel(hotelId: string): Promise<RoomType[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/mini/room-type/hotel/${hotelId}`,
        method: 'GET'
      })
      return res.data.data || []
    } catch (error) {
      console.error('获取房型列表失败:', error)
      return []
    }
  }
}
