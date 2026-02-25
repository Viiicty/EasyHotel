import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:8888'

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
  coverImage?: string
  address?: string
  facilities?: string[]
  tags?: string[]
  minPrice?: number
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
  facilities: string[]
  tags: string[]
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
  defaultPrice?: number
}

export interface HotelImage {
  id: string
  hotelId: string
  url: string
  sortNo: number
}

export interface HotelCover {
  id: string
  hotelId: string
  url: string
  createdTime: string
}

export interface RoomTypePicture {
  id: string
  hotelId: string
  roomTypeId: string
  url: string
  sortNo: number
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
    tags?: string[]
    page?: number
    pageSize?: number
    checkIn?: string
    checkOut?: string
    minPrice?: number
    maxPrice?: number
  }): Promise<Hotel[]> {
    try {
      const cityMap: { [key: string]: string } = {
        '北京': 'beijing',
        '上海': 'shanghai',
        '广州': 'guangzhou',
        '深圳': 'shenzhen',
        '杭州': 'hangzhou',
        '成都': 'chengdu'
      }
      
      const queryParams: any = {}
      if (params.city) {
        queryParams.cityCode = cityMap[params.city] || params.city
      }
      if (params.keyword) {
        queryParams.nameZh = params.keyword
      }
      if (params.starLevel) {
        queryParams.starLevel = params.starLevel
      }
      if (params.tags && params.tags.length > 0) {
        queryParams.tags = JSON.stringify(params.tags)
      }
      if (params.page) {
        queryParams.page = params.page
      }
      if (params.pageSize) {
        queryParams.pageSize = params.pageSize
      }
      if (params.checkIn) {
        queryParams.checkIn = params.checkIn
      }
      if (params.checkOut) {
        queryParams.checkOut = params.checkOut
      }
      if (params.minPrice !== undefined) {
        queryParams.minPrice = params.minPrice
      }
      if (params.maxPrice !== undefined) {
        queryParams.maxPrice = params.maxPrice
      }

      const res = await request({
        url: `${BASE_URL}/mini/hotel/search`,
        method: 'GET',
        data: queryParams
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

  async getRecommendHotels(limit: number = 4, date?: string): Promise<Hotel[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/mini/hotel/recommend`,
        method: 'GET',
        data: { limit, date }
      })
      return res.data.data || []
    } catch (error) {
      console.error('获取推荐酒店失败:', error)
      return []
    }
  },

  async getAllTags(): Promise<string[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/mini/hotel/tags`,
        method: 'GET'
      })
      return res.data.data || []
    } catch (error) {
      console.error('获取标签失败:', error)
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
  },

  async getHotelImages(hotelId: string): Promise<HotelImage[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/hotel-image/hotel/${hotelId}`,
        method: 'GET'
      })
      console.log('getHotelImages response:', res)
      console.log('getHotelImages res.data:', res.data)
      return res.data.data || []
    } catch (error) {
      console.error('获取酒店图片失败:', error)
      return []
    }
  },

  async getHotelCovers(hotelId: string): Promise<HotelCover[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/hotel-cover/hotel/${hotelId}`,
        method: 'GET'
      })
      console.log('getHotelCovers response:', res)
      console.log('getHotelCovers res.data:', res.data)
      return res.data.data || []
    } catch (error) {
      console.error('获取酒店封面失败:', error)
      return []
    }
  },

  async getRoomTypePictures(roomTypeId: string): Promise<RoomTypePicture[]> {
    try {
      const res = await request({
        url: `${BASE_URL}/roomtype-picture/room-type/${roomTypeId}`,
        method: 'GET'
      })
      console.log('getRoomTypePictures response:', res)
      console.log('getRoomTypePictures res.data:', res.data)
      return res.data.data || []
    } catch (error) {
      console.error('获取房型图片失败:', error)
      return []
    }
  }
}
