import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Button, ScrollView, Picker, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { getCurrentInstance, useDidShow } from '@tarojs/taro'
import { hotelService, HotelDetail, RoomType, HotelImage, RoomTypePicture, HotelCover } from '../../services/hotel.service'
import { userService } from '../../services/user.service'
import { bookingService } from '../../services/booking.service'
import { orderService } from '../../services/order.service'
import Calendar from '../../components/calendar/calendar'
import ImagePreview from '../../components/image-preview/image-preview'
import Skeleton from '../../components/skeleton/skeleton'
import './index.scss'

interface RoomInventory {
  roomTypeId: string
  minRemainingQty: number
}

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function HotelDetailPage() {
  const [hotel, setHotel] = useState<HotelDetail | null>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [hotelImages, setHotelImages] = useState<HotelImage[]>([])
  const [hotelCovers, setHotelCovers] = useState<HotelCover[]>([])
  const [roomInventories, setRoomInventories] = useState<RoomInventory[]>([])
  const [roomTypePictures, setRoomTypePictures] = useState<{ [key: string]: RoomTypePicture[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkIn, setCheckIn] = useState(getTodayDate())
  const [checkOut, setCheckOut] = useState(getTomorrowDate())
  const [nights, setNights] = useState(1)
  const [rooms, setRooms] = useState(1)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showGuestPanel, setShowGuestPanel] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [pendingOrder, setPendingOrder] = useState<any>(null)
  const [remainingTime, setRemainingTime] = useState(0)
  const [bookmarkPosition, setBookmarkPosition] = useState({ x: 300, y: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [isJustDragged, setIsJustDragged] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [previewType, setPreviewType] = useState<'hotel' | 'room'>('hotel')
  const rafId = useRef<any>(null)
  const countdownTimer = useRef<any>(null)
  const isLoadingPendingOrder = useRef(false)
  const startX = useRef<number>(0)
  const startY = useRef<number>(0)
  const startPositionX = useRef<number>(0)
  const startPositionY = useRef<number>(0)

  const instance = getCurrentInstance()

  useEffect(() => {
    console.log('=== HotelDetailPage useEffect ===')
    const params = instance?.router?.params
    console.log('Router params:', params)
    const id = params?.id
    console.log('Hotel ID:', id)

    let finalCheckIn = getTodayDate()
    let finalCheckOut = getTomorrowDate()
    let finalRooms = 1
    let finalAdults = 1
    let finalChildren = 0

    if (params?.checkIn && params?.checkOut) {
      console.log('接收到的日期参数:', { checkIn: params.checkIn, checkOut: params.checkOut })
      finalCheckIn = params.checkIn
      finalCheckOut = params.checkOut
    } else {
      const savedCheckIn = Taro.getStorageSync('selectedCheckIn')
      const savedCheckOut = Taro.getStorageSync('selectedCheckOut')
      if (savedCheckIn && savedCheckOut) {
        console.log('从本地存储读取日期:', { checkIn: savedCheckIn, checkOut: savedCheckOut })
        finalCheckIn = savedCheckIn
        finalCheckOut = savedCheckOut
      }
    }

    if (params?.rooms) {
      finalRooms = parseInt(params.rooms)
      if (isNaN(finalRooms)) {
        finalRooms = 1
      }
    }
    if (params?.adults) {
      finalAdults = parseInt(params.adults)
      if (isNaN(finalAdults)) {
        finalAdults = 1
      }
    }
    if (params?.children) {
      finalChildren = parseInt(params.children)
      if (isNaN(finalChildren)) {
        finalChildren = 0
      }
    }

    console.log('=== 详情页参数解析 ===')
    console.log('params:', params)
    console.log('finalRooms:', finalRooms, 'finalAdults:', finalAdults, 'finalChildren:', finalChildren)

    setCheckIn(finalCheckIn)
    setCheckOut(finalCheckOut)
    setRooms(finalRooms)
    setAdults(finalAdults)
    setChildren(finalChildren)

    const startParts = finalCheckIn.split('-')
    const endParts = finalCheckOut.split('-')
    let start: Date
    let end: Date

    if (startParts.length === 3) {
      start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]))
    } else {
      const currentYear = new Date().getFullYear()
      start = new Date(currentYear, parseInt(startParts[0]) - 1, parseInt(startParts[1]))
    }

    if (endParts.length === 3) {
      end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]))
    } else {
      const currentYear = new Date().getFullYear()
      end = new Date(currentYear, parseInt(endParts[0]) - 1, parseInt(endParts[1]))
    }

    const nightsCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    setNights(nightsCount)

    Taro.setStorageSync('selectedCheckIn', finalCheckIn)
    Taro.setStorageSync('selectedCheckOut', finalCheckOut)
    Taro.setStorageSync('selectedRooms', finalRooms)
    Taro.setStorageSync('selectedAdults', finalAdults)
    Taro.setStorageSync('selectedChildren', finalChildren)

    if (id) {
      loadHotelDetail(id)
    }
  }, [instance])

  useDidShow(() => {
    console.log('=== HotelDetailPage useDidShow ===')
    isLoadingPendingOrder.current = false
    loadPendingOrder()

    const systemInfo = Taro.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const screenHeight = systemInfo.windowHeight
    const bookmarkSize = 65
    const margin = 5

    const savedPosition = Taro.getStorageSync('pendingBookmarkPosition')

    setBookmarkPosition(savedPosition || {
      x: screenWidth - bookmarkSize - margin,
      y: screenHeight - bookmarkSize - margin
    })

    if (!isFirstLoad) {
      console.log('页面重新显示，刷新数据')
      const params = instance?.router?.params
      const id = params?.id
      if (id) {
        loadHotelDetail(id)
      }
    } else {
      setIsFirstLoad(false)
    }
  })

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current)
      }
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    const systemInfo = Taro.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const screenHeight = systemInfo.windowHeight
    const bookmarkSize = 65
    const margin = 5

    const savedPosition = Taro.getStorageSync('pendingBookmarkPosition')

    setBookmarkPosition(savedPosition || {
      x: screenWidth - bookmarkSize - margin,
      y: screenHeight - bookmarkSize - margin
    })
  }, [])

  const loadPendingOrder = async () => {
    if (isLoadingPendingOrder.current) {
      console.log('loadPendingOrder already loading, skip')
      return
    }

    if (!userService.isLoggedIn()) {
      console.log('用户未登录，跳过加载待支付订单')
      setPendingOrder(null)
      setRemainingTime(0)
      return
    }

    isLoadingPendingOrder.current = true

    try {
      const order = await orderService.getPendingOrder()
      console.log('=== loadPendingOrder ===')
      console.log('order:', order)
      setPendingOrder(order)
      const time = order?.remainingTime || 0
      startCountdown(time)
    } catch (error) {
      console.error('加载待支付订单失败:', error)
      setPendingOrder(null)
      setRemainingTime(0)
    } finally {
      isLoadingPendingOrder.current = false
    }
  }

  const startCountdown = (time: number) => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current)
      countdownTimer.current = null
    }

    if (time <= 0) {
      return
    }

    setRemainingTime(time)

    countdownTimer.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          if (countdownTimer.current) {
            clearInterval(countdownTimer.current)
            countdownTimer.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleBookmarkClick = () => {
    if (isDragging || isJustDragged) return

    if (pendingOrder) {
      Taro.navigateTo({
        url: `/pages/order/detail?orderId=${pendingOrder.orderId}`
      })
    }
  }

  const handleBookmarkTouchStart = (e: any) => {
    const touch = e.touches[0]
    startX.current = touch.clientX
    startY.current = touch.clientY
    startPositionX.current = bookmarkPosition.x
    startPositionY.current = bookmarkPosition.y
    setIsDragging(false)
    setIsJustDragged(false)
  }

  const handleBookmarkTouchMove = (e: any) => {
    e.stopPropagation()
    e.preventDefault()

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX.current
    const deltaY = touch.clientY - startY.current

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setIsDragging(true)
    }

    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
    }

    rafId.current = requestAnimationFrame(() => {
      let newX = startPositionX.current + deltaX
      let newY = startPositionY.current + deltaY

      const systemInfo = Taro.getSystemInfoSync()
      const screenWidth = systemInfo.windowWidth
      const screenHeight = systemInfo.windowHeight
      const bookmarkSize = 100
      const margin = 10

      newX = Math.max(margin, Math.min(newX, screenWidth - bookmarkSize - margin))
      newY = Math.max(margin, Math.min(newY, screenHeight - bookmarkSize - margin))

      setBookmarkPosition({ x: newX, y: newY })
    })
  }

  const handleBookmarkTouchEnd = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }

    const systemInfo = Taro.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const screenHeight = systemInfo.windowHeight
    const bookmarkSize = 100
    const bookmarkSize2 = 65
    const margin = 5

    const centerX = bookmarkPosition.x + bookmarkSize / 2
    const screenCenterX = screenWidth / 2

    let finalX = bookmarkPosition.x
    if (centerX < screenCenterX) {
      finalX = margin
    } else {
      finalX = screenWidth - bookmarkSize2
    }

    setBookmarkPosition({ x: finalX, y: bookmarkPosition.y })
    setIsDragging(false)

    if (isDragging) {
      setIsJustDragged(true)
      setTimeout(() => {
        setIsJustDragged(false)
      }, 200)
    }

    Taro.setStorageSync('pendingBookmarkPosition', { x: finalX, y: bookmarkPosition.y })
  }

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const loadHotelDetail = async (id: string) => {
    console.log('=== loadHotelDetail START ===')
    console.log('Hotel ID:', id)

    try {
      const cacheKey = `hotel_${id}`
      console.log('Cache key:', cacheKey)

      const cachedHotel = Taro.getStorageSync(cacheKey)
      const cachedRoomTypes = Taro.getStorageSync(`${cacheKey}_rooms`)
      console.log('Cached data:', { cachedHotel, cachedRoomTypes })

      const startTime = Date.now()

      console.log('Calling hotelService.getHotelDetail...')
      const hotelDetail = await hotelService.getHotelDetail(id)
      console.log('hotelDetail result:', hotelDetail)

      console.log('Calling hotelService.getRoomTypesByHotel...')
      const roomTypesData = await hotelService.getRoomTypesByHotel(id)
      console.log('roomTypes result:', roomTypesData)

      console.log('Calling hotelService.getHotelImages...')
      let hotelImagesData: HotelImage[] = []
      try {
        hotelImagesData = await hotelService.getHotelImages(id)
        console.log('hotelImages loaded:', hotelImagesData)
      } catch (error) {
        console.error('获取酒店图片失败:', error)
        hotelImagesData = []
      }

      console.log('Calling hotelService.getHotelCovers...')
      let hotelCoversData: HotelCover[] = []
      try {
        hotelCoversData = await hotelService.getHotelCovers(id)
        console.log('hotelCovers loaded:', hotelCoversData)
      } catch (error) {
        console.error('获取酒店封面失败:', error)
        hotelCoversData = []
      }

      console.log('Loading room type pictures...')
      const roomPicturesMap: { [key: string]: RoomTypePicture[] } = {}
      for (const roomType of roomTypesData) {
        try {
          const pictures = await hotelService.getRoomTypePictures(roomType.id)
          console.log(`Room type ${roomType.id} pictures:`, pictures)
          roomPicturesMap[roomType.id] = pictures
        } catch (error) {
          console.error(`获取房型 ${roomType.id} 图片失败:`, error)
          roomPicturesMap[roomType.id] = []
        }
      }

      console.log('Saving to cache...')
      Taro.setStorageSync(cacheKey, hotelDetail)
      Taro.setStorageSync(`${cacheKey}_rooms`, roomTypesData)
      Taro.setStorageSync(`${cacheKey}_room_pictures`, roomPicturesMap)

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)
      console.log('Delay time:', delayTime)

      console.log('Setting state...')
      setHotel(hotelDetail)
      setRoomTypes(roomTypesData)
      setHotelImages(hotelImagesData)
      setHotelCovers(hotelCoversData)
      setRoomTypePictures(roomPicturesMap)
      setLoading(false)

      if (hotelDetail && hotelDetail.hotelName) {
        Taro.setNavigationBarTitle({
          title: hotelDetail.hotelName
        })
      }

      console.log('Loading room inventories...')
      await loadRoomInventories(roomTypesData)
    } catch (error) {
      console.error('获取酒店详情失败:', error)
      setError('获取酒店详情失败')
      setLoading(false)
    }
    console.log('=== loadHotelDetail END ===')
  }

  const loadRoomInventories = async (roomTypesData: RoomType[]) => {
    if (roomTypesData.length === 0) {
      return
    }

    if (!userService.isLoggedIn()) {
      console.log('用户未登录，跳过库存检查')
      return
    }

    try {
      const inventories: RoomInventory[] = []

      for (const roomType of roomTypesData) {
        try {
          const result = await bookingService.checkInventory({
            roomTypeId: roomType.id,
            checkIn: checkIn,
            checkOut: checkOut,
            rooms: rooms
          })

          inventories.push({
            roomTypeId: roomType.id,
            minRemainingQty: result.minRemainingQty || 0
          })
        } catch (error) {
          console.error(`检查房型 ${roomType.id} 库存失败:`, error)
          inventories.push({
            roomTypeId: roomType.id,
            minRemainingQty: 0
          })
        }
      }

      setRoomInventories(inventories)
    } catch (error) {
      console.error('加载房型库存失败:', error)
    }
  }

  const onPullDownRefresh = async () => {
    console.log('=== 下拉刷新开始 ===')
    setRefreshing(true)

    try {
      const params = instance?.router?.params
      const id = params?.id
      if (id) {
        await loadHotelDetail(id)
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('刷新失败:', error)
      Taro.showToast({
        title: '刷新失败，请重试',
        icon: 'none'
      })
    } finally {
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }
  }

  const handleBook = async (roomTypeId: string) => {
    if (!userService.isLoggedIn()) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/login'
        })
      }, 1500)
      return
    }

    try {
      const result = await bookingService.checkInventory({
        roomTypeId: roomTypeId,
        checkIn: checkIn,
        checkOut: checkOut,
        rooms: rooms
      })

      if (!result.available) {
        Taro.showModal({
          title: '库存不足',
          content: result.message || '该房型在选定时间段内库存不足',
          showCancel: false
        })
        return
      }

      const params = instance?.router?.params
      const hotelId = params?.id

      if (hotelId) {
        Taro.navigateTo({
          url: `/pages/book/book?hotelId=${hotelId}&roomTypeId=${roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}&adults=${adults}&children=${children}`
        })
      }
    } catch (error) {
      console.error('检查库存失败:', error)
      Taro.showModal({
        title: '错误',
        content: '检查库存失败，请稍后重试',
        showCancel: false
      })
    }
  }

  const getWeekday = (dateStr: string) => {
    const parts = dateStr.split('-')
    let date: Date
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    } else {
      date = new Date(2026, parseInt(parts[0]) - 1, parseInt(parts[1]))
    }
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  }

  const formatDateDisplay = (dateStr: string): string => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
    } else if (parts.length >= 2) {
      return `${parts[0]}月${parts[1]}日`
    }
    return dateStr
  }

  const handleDateClick = () => {
    setShowCalendar(true)
  }

  const handleCalendarConfirm = (startDate: string, endDate: string) => {
    const startParts = startDate.split('-')
    const endParts = endDate.split('-')
    let start: Date
    let end: Date

    if (startParts.length === 3) {
      start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]))
    } else {
      const currentYear = new Date().getFullYear()
      start = new Date(currentYear, parseInt(startParts[0]) - 1, parseInt(startParts[1]))
    }

    if (endParts.length === 3) {
      end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]))
    } else {
      const currentYear = new Date().getFullYear()
      end = new Date(currentYear, parseInt(endParts[0]) - 1, parseInt(endParts[1]))
    }

    const nightsCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    setCheckIn(startDate)
    setCheckOut(endDate)
    setNights(nightsCount)
    setShowCalendar(false)

    Taro.setStorageSync('selectedCheckIn', startDate)
    Taro.setStorageSync('selectedCheckOut', endDate)

    loadRoomInventories(roomTypes)
  }

  const handleCalendarClose = () => {
    setShowCalendar(false)
  }

  const handleRoomsChange = (e) => {
    const roomOptions = [1, 2, 3, 4, 5]
    setRooms(roomOptions[e.detail.value])
    loadRoomInventories(roomTypes)
  }

  const handleAdultsChange = (e) => {
    const adultOptions = [1, 2, 3, 4, 5]
    setAdults(adultOptions[e.detail.value])
  }

  const handleChildrenChange = (e) => {
    const childOptions = [0, 1, 2, 3, 4]
    setChildren(childOptions[e.detail.value])
  }

  const handleGuestClick = () => {
    setShowGuestPanel(!showGuestPanel)
  }

  const handleGuestConfirm = () => {
    setShowGuestPanel(false)
  }

  const renderStars = (starLevel: number) => {
    const stars = []
    for (let i = 0; i < starLevel; i++) {
      stars.push(<Text key={i} className='star'>⭐</Text>)
    }
    return stars
  }

  const getFacilityIcon = (facility: string) => {
    const iconMap: { [key: string]: string } = {
      'wifi': '📶',
      'parking': '🅿️',
      'swimming': '🏊',
      'gym': '🏋️',
      'restaurant': '🍽️',
      'spa': '💆',
      'family': '👨‍👩‍👧‍👦',
      'luxury': '👑',
      'business': '💼',
      'airport': '✈️',
      'subway': '🚇'
    }
    return iconMap[facility] || '🏷️'
  }

  const getFacilityLabel = (facility: string) => {
    const labelMap: { [key: string]: string } = {
      'wifi': '免费 WiFi',
      'parking': '免费停车场',
      'swimming': '游泳池',
      'gym': '健身房',
      'restaurant': '餐厅',
      'spa': 'SPA',
      'bar': '酒吧',
      'coffee': '咖啡厅',
      'breakfast': '免费早餐',
      'laundry': '洗衣服务',
      'dry_cleaning': '干洗服务',
      'ironing': '熨衣服务',
      'shuttle': '班车服务',
      'airport_shuttle': '机场班车',
      'car_rental': '租车服务',
      'bike_rental': '自行车租赁',
      'meeting_room': '会议室',
      'banquet': '宴会厅',
      'conference': '会议中心',
      'business_center': '商务中心',
      'front_24h': '24小时前台',
      'checkin_24h': '24小时入住',
      'luggage_storage': '行李寄存',
      'concierge': '礼宾服务',
      'currency_exchange': '外币兑换',
      'atm': 'ATM取款机',
      'safe': '保险箱',
      'elevator': '电梯',
      'disabled_access': '无障碍设施',
      'wheelchair': '轮椅通道',
      'air_conditioning': '空调',
      'heating': '暖气',
      'mini_bar': '迷你吧',
      'refrigerator': '冰箱',
      'kitchen': '厨房',
      'kitchenette': '小厨房',
      'microwave': '微波炉',
      'toaster': '烤面包机',
      'kettle': '电水壶',
      'cooking': '烹饪设施',
      'dishwasher': '洗碗机',
      'tea_coffee': '茶/咖啡设备',
      'tv': '电视',
      'cable_tv': '有线电视',
      'satellite_tv': '卫星电视',
      'streaming': '流媒体服务',
      'phone': '电话',
      'fax': '传真',
      'printer': '打印机',
      'scanner': '扫描仪',
      'photocopy': '复印服务',
      'internet': '上网服务',
      'wired_internet': '有线网络',
      'computer': '电脑',
      'projector': '投影仪',
      'screen': '投影幕布',
      'whiteboard': '白板',
      'video_conf': '视频会议',
      'audio_visual': '视听设备',
      'hairdryer': '吹风机',
      'bathrobe': '浴袍',
      'slippers': '拖鞋',
      'toiletries': '洗漱用品',
      'towel': '毛巾',
      'bath_towel': '浴巾',
      'shampoo': '洗发水',
      'conditioner': '护发素',
      'body_wash': '沐浴露',
      'soap': '香皂',
      'toothbrush': '牙刷',
      'comb': '梳子',
      'razor': '剃须刀',
      'shaving_cream': '剃须膏',
      'cotton_swabs': '棉签',
      'cotton_balls': '化妆棉',
      'nail_clipper': '指甲刀',
      'sewing_kit': '针线包',
      'shoe_shine': '擦鞋服务',
      'shoe_polish': '鞋油',
      'laundry_bag': '洗衣袋',
      'shopping_bag': '购物袋',
      'umbrella': '雨伞',
      'raincoat': '雨衣',
      'sunscreen': '防晒霜',
      'mosquito_repellent': '驱蚊剂',
      'insect_repellent': '驱虫剂',
      'golf': '高尔夫球场',
      'tennis': '网球场',
      'basketball': '篮球场',
      'volleyball': '排球场',
      'badminton': '羽毛球场',
      'table_tennis': '乒乓球',
      'billiards': '台球',
      'bowling': '保龄球',
      'squash': '壁球',
      'yoga': '瑜伽',
      'pilates': '普拉提',
      'aerobics': '有氧运动',
      'zumba': '尊巴舞',
      'dance': '舞蹈课程',
      'meditation': '冥想',
      'massage': '按摩',
      'facial': '面部护理',
      'body_treatment': '身体护理',
      'manicure': '美甲',
      'pedicure': '足疗',
      'hair_salon': '美发沙龙',
      'beauty_salon': '美容沙龙',
      'steam_room': '蒸汽房',
      'sauna': '桑拿',
      'hot_tub': '热水浴缸',
      'cold_plunge': '冷水池',
      'hydrotherapy': '水疗',
      'aromatherapy': '芳香疗法',
      'reflexology': '足底按摩',
      'acupuncture': '针灸',
      'traditional_medicine': '传统医学',
      'herbal_medicine': '草药治疗',
      'nutritionist': '营养师',
      'personal_trainer': '私人教练',
      'fitness_class': '健身课程',
      'swimming_lesson': '游泳课程',
      'tennis_lesson': '网球课程',
      'golf_lesson': '高尔夫课程',
      'ski_lesson': '滑雪课程',
      'surf_lesson': '冲浪课程',
      'dive_lesson': '潜水课程',
      'kayak_lesson': '皮划艇课程',
      'sail_lesson': '帆船课程',
      'horse_riding': '骑马',
      'hiking': '徒步',
      'biking': '骑行',
      'fishing': '钓鱼',
      'boating': '划船',
      'sailing': '帆船',
      'surfing': '冲浪',
      'diving': '潜水',
      'snorkeling': '浮潜',
      'water_skiing': '水上滑水',
      'jet_ski': '喷气滑雪',
      'parasailing': '帆伞',
      'kiteboarding': '风筝冲浪',
      'windsurfing': '帆板',
      'rafting': '漂流',
      'canoeing': '独木舟',
      'kayaking': '皮划艇',
      'stand_up_paddle': '立桨冲浪',
      'first_aid': '急救包',
      'fire_extinguisher': '灭火器',
      'smoke_detector': '烟雾探测器',
      'carbon_monoxide': '一氧化碳探测器',
      'fire_alarm': '火灾报警器',
      'sprinkler': '喷淋系统',
      'emergency_exit': '紧急出口',
      'emergency_light': '应急照明',
      'security_camera': '监控摄像头',
      'security_guard': '保安',
      'key_card': '房卡',
      'electronic_lock': '电子锁',
      'safe_deposit': '贵重物品保管',
      'room_service': '客房服务',
      'wake_up_call': '叫醒服务',
      'turndown_service': '开夜床服务',
      'housekeeping': '客房清洁',
      'daily_housekeeping': '每日清洁',
      'weekly_housekeeping': '每周清洁',
      'request_cleaning': '按需清洁',
      'bed_change': '换床单',
      'towel_change': '换毛巾',
      'toiletries_replenish': '补充洗漱用品',
      'minibar_replenish': '补充迷你吧',
      'water_replenish': '补充饮用水',
      'newspaper': '报纸',
      'magazine': '杂志',
      'guidebook': '旅游指南',
      'map': '地图',
      'tour_info': '旅游信息',
      'ticket_booking': '票务预订',
      'restaurant_reservation': '餐厅预订',
      'spa_reservation': 'SPA预订',
      'gym_reservation': '健身房预订',
      'pool_reservation': '游泳池预订',
      'court_reservation': '球场预订',
      'family': '亲子',
      'luxury': '豪华',
      'business': '商务',
      'airport': '近机场',
      'subway': '近地铁'
    }
    return labelMap[facility] || facility
  }

  const getTagLabel = (tag: string) => {
    const labelMap: { [key: string]: string } = {
      'wifi': 'WiFi',
      'parking': '停车场',
      'swimming': '泳池',
      'gym': '健身房',
      'restaurant': '餐厅',
      'spa': 'SPA',
      'family': '亲子酒店',
      'luxury': '豪华酒店',
      'business': '商务酒店',
      'airport': '近机场',
      'subway': '近地铁',
      'beachfront': '海滨酒店',
      'ocean_view': '海景房',
      'mountain_view': '山景房',
      'city_view': '城市景观',
      'garden_view': '花园景观',
      'lake_view': '湖景房',
      'river_view': '江景房',
      'park_view': '公园景观',
      'skyline': '天际线景观',
      'rooftop': '屋顶酒吧',
      'terrace': '露台',
      'balcony': '阳台',
      'patio': '庭院',
      'garden': '花园',
      'courtyard': '中庭',
      'historic': '历史建筑',
      'modern': '现代设计',
      'boutique': '精品酒店',
      'design': '设计酒店',
      'art': '艺术酒店',
      'eco': '生态酒店',
      'green': '绿色酒店',
      'sustainable': '可持续酒店',
      'organic': '有机酒店',
      'vegan': '素食友好',
      'gluten_free': '无麸质',
      'halal': '清真食品',
      'kosher': '犹太洁食',
      'pet_friendly': '宠物友好',
      'dog_friendly': '狗狗友好',
      'cat_friendly': '猫咪友好',
      'smoke_free': '无烟酒店',
      'allergy_friendly': '过敏友好',
      'wheelchair_accessible': '轮椅无障碍',
      'hearing_impaired': '听力障碍友好',
      'visually_impaired': '视力障碍友好',
      'autism_friendly': '自闭症友好',
      'honeymoon': '蜜月酒店',
      'wedding': '婚礼场地',
      'anniversary': '纪念日',
      'birthday': '生日派对',
      'bachelor_party': '单身派对',
      'bachelorette_party': '新娘派对',
      'reunion': '家庭聚会',
      'corporate_event': '企业活动',
      'team_building': '团队建设',
      'retreat': '静修',
      'workshop': '研讨会',
      'seminar': '研讨会',
      'conference': '会议',
      'exhibition': '展览',
      'trade_show': '贸易展',
      'fashion_show': '时装秀',
      'concert': '音乐会',
      'performance': '演出',
      'theater': '剧院',
      'cinema': '电影院',
      'nightlife': '夜生活',
      'casino': '赌场',
      'nightclub': '夜店',
      'karaoke': '卡拉OK',
      'live_music': '现场音乐',
      'dj': 'DJ表演',
      'comedy': '喜剧表演',
      'magic_show': '魔术表演',
      'acrobatics': '杂技表演',
      'cultural_show': '文化表演',
      'traditional_show': '传统表演',
      'folk_show': '民俗表演',
      'dance_show': '舞蹈表演',
      'music_show': '音乐表演',
      'art_exhibition': '艺术展览',
      'sculpture_exhibition': '雕塑展览',
      'photography_exhibition': '摄影展览',
      'craft_market': '手工艺市场',
      'flea_market': '跳蚤市场',
      'farmers_market': '农贸市场',
      'food_market': '食品市场',
      'night_market': '夜市',
      'street_food': '街头美食',
      'food_court': '美食广场',
      'hawker_center': '小贩中心',
      'coffee_shop': '咖啡店',
      'tea_house': '茶馆',
      'bakery': '面包店',
      'pastry_shop': '糕点店',
      'ice_cream': '冰淇淋店',
      'juice_bar': '果汁吧',
      'smoothie_bar': '冰沙吧',
      'wine_bar': '葡萄酒吧',
      'whiskey_bar': '威士忌吧',
      'cocktail_bar': '鸡尾酒吧',
      'beer_garden': '啤酒花园',
      'brewery': '酿酒厂',
      'distillery': '蒸馏厂',
      'winery': '酒庄',
      'vineyard': '葡萄园',
      'olive_grove': '橄榄园',
      'orchard': '果园',
      'farm': '农场',
      'ranch': '牧场',
      'vineyard_tour': '葡萄园游览',
      'winery_tour': '酒庄游览',
      'brewery_tour': '酿酒厂游览',
      'distillery_tour': '蒸馏厂游览',
      'farm_tour': '农场游览',
      'orchard_tour': '果园游览',
      'cooking_class': '烹饪课程',
      'wine_tasting': '品酒',
      'beer_tasting': '品啤酒',
      'cheese_tasting': '品奶酪',
      'chocolate_tasting': '品巧克力',
      'coffee_tasting': '品咖啡',
      'tea_tasting': '品茶',
      'olive_oil_tasting': '品橄榄油',
      'honey_tasting': '品蜂蜜',
      'jam_tasting': '品果酱',
      'preserves_tasting': '品果脯',
      'local_food': '当地美食',
      'regional_cuisine': '地方菜系',
      'international_cuisine': '国际菜系',
      'fusion_cuisine': '融合菜系',
      'molecular_cuisine': '分子料理',
      'love': '适合情侣',
      'car': '接送机服务',
      'elderly_friendly': '老年友好',
      'child_friendly': '儿童友好',
      'teen_friendly': '青少年友好',
      'adult_only': '成人专用',
      'women_only': '女性专用',
      'men_only': '男性专用',
      'lgbt_friendly': 'LGBT友好'
    }
    const label = labelMap[tag] || tag
    if (!labelMap[tag]) {
      console.log('标签未找到映射:', tag)
    }
    return label
  }

  const handleImageClick = (roomTypeId: string, imageIndex: number = 0) => {
    const roomPictures = roomTypePictures[roomTypeId] || []
    if (roomPictures.length > 0) {
      const images = roomPictures.map(picture => 
        picture.url.startsWith('http') 
          ? picture.url 
          : `http://localhost:8888/upload/roompicture/${picture.url}`
      )
      setPreviewImages(images)
      setCurrentPreviewIndex(imageIndex)
      setPreviewType('room')
      setShowImagePreview(true)
    }
  }

  const handleHotelBannerClick = (imageIndex: number = 0) => {
    let displayImages = []
    if (hotelImages && Array.isArray(hotelImages) && hotelImages.length > 0) {
      displayImages = hotelImages.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : `http://localhost:8888/upload/picture/${img.url}`
      })).sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0))
    } else if (hotelCovers && Array.isArray(hotelCovers) && hotelCovers.length > 0) {
      displayImages = hotelCovers.map(cover => ({
        id: cover.id,
        hotelId: cover.hotelId,
        url: cover.url.startsWith('http') ? cover.url : `http://localhost:8888/upload/hotelcover/${cover.url}`,
        sortNo: 0
      }))
    }

    if (displayImages.length > 0) {
      const images = displayImages.map(img => img.url)
      setPreviewImages(images)
      setCurrentPreviewIndex(imageIndex)
      setPreviewType('hotel')
      setShowImagePreview(true)
    }
  }

  const handleClosePreview = () => {
    setShowImagePreview(false)
    setPreviewImages([])
    setCurrentPreviewIndex(0)
  }

  const handlePreviewChange = (index: number) => {
    setCurrentPreviewIndex(index)
  }

  const getCancelPolicyLabel = (policy: string) => {
    const policyMap: { [key: string]: string } = {
      'free': '免费取消',
      '24h': '入住前24小时可取消',
      '48h': '入住前48小时可取消',
      'none': '不可取消'
    }
    return policyMap[policy] || policy
  }

  const getChangePolicyLabel = (policy: string) => {
    const policyMap: { [key: string]: string } = {
      'free': '免费修改',
      '24h': '入住前24小时可修改',
      '48h': '入住前48小时可修改',
      'none': '不可修改'
    }
    return policyMap[policy] || policy
  }

  const getExtraBedPolicyLabel = (policy: string) => {
    const policyMap: { [key: string]: string } = {
      'allow': '允许免费加床',
      'charge': '允许收费加床',
      'none': '不允许加床'
    }
    return policyMap[policy] || policy
  }

  if (loading) {
    return (
      <View className='hotel-detail'>
        <Skeleton type='banner' showContent={true} />
        <View className='hotel-info-card'>
          <Skeleton type='card' showContent={true} />
        </View>
        <View className='room-types-card'>
          <Skeleton type='card' showContent={true} />
          <Skeleton type='card' showContent={true} />
        </View>
      </View>
    )
  }

  if (error) {
    return (
      <View className='hotel-detail'>
        <View className='error'>{error}</View>
      </View>
    )
  }

  if (!hotel) {
    return null
  }

  let displayImages = []
  if (hotelImages && Array.isArray(hotelImages) && hotelImages.length > 0) {
    displayImages = hotelImages.map(img => ({
      ...img,
      url: img.url.startsWith('http') ? img.url : `http://localhost:8888/upload/picture/${img.url}`
    })).sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0))
  } else if (hotelCovers && Array.isArray(hotelCovers) && hotelCovers.length > 0) {
    displayImages = hotelCovers.map(cover => ({
      id: cover.id,
      hotelId: cover.hotelId,
      url: cover.url.startsWith('http') ? cover.url : `http://localhost:8888/upload/hotelcover/${cover.url}`,
      sortNo: 0
    }))
  }

  return (
    <View className='hotel-detail-container'>
      <ScrollView
        className='hotel-detail'
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={onPullDownRefresh}
        refresherBackground='#f5f5f5'
      >
      {displayImages.length > 0 && (
        <View className='hotel-banner-container'>
          {displayImages.length === 1 ? (
            <Image 
              className='hotel-banner' 
              src={displayImages[0].url} 
              mode='aspectFill' 
              lazyLoad 
              onClick={() => handleHotelBannerClick(0)}
            />
          ) : (
            <Swiper
              className='hotel-banner-swiper'
              indicatorDots
              autoplay={false}
              circular
              interval={3000}
              duration={500}
              indicatorColor='rgba(255,255,255, 0.5)'
              indicatorActiveColor='#fff'
            >
              {displayImages.map((image, index) => {
                const imageUrl = image.url.startsWith('http') 
                  ? image.url 
                  : `http://localhost:8888/upload/picture/${image.url}`
                
                return (
                  <SwiperItem key={image.id || index}>
                    <Image 
                      className='hotel-banner' 
                      src={imageUrl} 
                      mode='aspectFill' 
                      lazyLoad 
                      onClick={() => handleHotelBannerClick(index)}
                    />
                  </SwiperItem>
                )
              })}
            </Swiper>
          )}
          <View className='banner-image-count'>
            <Text className='banner-count-text'>{displayImages.length}张</Text>
          </View>
        </View>
      )}

      <View className='hotel-info-card'>
        <View className='hotel-header'>
          <View className='hotel-name-section'>
            <View className='hotel-name-row'>
              <Text className='hotel-name'>{hotel.hotelName}</Text>
              <View className='hotel-rating'>
                {renderStars(hotel.starLevel)}
              </View>
            </View>
            <Text className='hotel-name-en'>{hotel.hotelNameEn}</Text>
          </View>
        </View>

        <View className='facilities-scroll'>
          <ScrollView scrollX className='scroll-container'>
            <View className='facilities-list'>
              {(() => {
                const facilities = hotel.facilities || []
                const facilitiesArray = Array.isArray(facilities) ? facilities : (typeof facilities === 'string' ? facilities.split(',') : [])
                return facilitiesArray.map((facility, index) => (
                  <View key={`facility-${index}`} className='facility-item'>
                    <Text className='facility-icon'>{getFacilityIcon(facility)}</Text>
                    <Text className='facility-label'>{getFacilityLabel(facility)}</Text>
                  </View>
                ))
              })()}
              {(() => {
                const tags = hotel.tags || []
                const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : [])
                return tagsArray.map((tag, index) => (
                  <View key={`tag-${index}`} className='facility-item'>
                    <Text className='facility-icon'>{getFacilityIcon(tag)}</Text>
                    <Text className='facility-label'>{getTagLabel(tag)}</Text>
                  </View>
                ))
              })()}
            </View>
      </ScrollView>
        </View>

        <View className='hotel-meta'>
          <View className='meta-item'>
            <Text className='meta-label'>开业时间</Text>
            <Text className='meta-value'>{hotel.createdAt ? String(hotel.createdAt).split('T')[0] : ''}</Text>
          </View>
          <View className='meta-item'>
            <Text className='meta-label'>地址</Text>
            <Text className='meta-value'>📍 {hotel.address || ''}</Text>
          </View>
        </View>
      </View>

      <View className='date-rooms-card'>
        <View className='date-section' onClick={handleDateClick}>
          <Text className='date-weekday'>{getWeekday(checkIn)}-{getWeekday(checkOut)}</Text>
          <Text className='date-range'>{formatDateDisplay(checkIn)}-{formatDateDisplay(checkOut)}</Text>
        </View>
        <View className='divider'></View>
        <View className='nights-section'>
          <Text className='nights-text'>共 {nights || 0} 晚</Text>
        </View>
        <View className='divider'></View>
        <View className='guests-section' onClick={handleGuestClick}>
          <View className='guest-item'>
            <Text className='guest-icon'>🏠</Text>
            <Text className='guest-count'>{rooms}</Text>
          </View>
          <View className='guest-item'>
            <Text className='guest-icon'>👤</Text>
            <Text className='guest-count'>{adults}</Text>
          </View>
          <View className='guest-item'>
            <Text className='guest-icon'>👶</Text>
            <Text className='guest-count'>{children}</Text>
          </View>
        </View>
      </View>

      <View className='room-types-section'>
        <Text className='section-title'>房型列表</Text>
        <View className='room-types-list'>
          {roomTypes.length > 0 ? (
            roomTypes.map((roomType) => {
              const inventory = roomInventories.find(inv => inv.roomTypeId === roomType.id)
              const remainingQty = inventory?.minRemainingQty || 0
              const showLowStock = remainingQty > 0 && remainingQty <= 4
              const showSoldOut = remainingQty === 0
              const isLoggedIn = userService.isLoggedIn()
              const price = roomType.defaultPrice || 0
              
              // 获取房型图片
              const roomPictures = roomTypePictures[roomType.id] || []
              const firstPicture = roomPictures.length > 0 ? roomPictures[0] : null
              const pictureUrl = firstPicture ? (
                firstPicture.url.startsWith('http') 
                  ? firstPicture.url 
                  : `http://localhost:8888/upload/roompicture/${firstPicture.url}`
              ) : null

              return (
                <View key={roomType.id} className='room-type-card'>
                  {pictureUrl ? (
                    <View className='room-type-image' onClick={() => handleImageClick(roomType.id, 0)}>
                      <Image 
                        className='room-image' 
                        src={pictureUrl} 
                        mode='aspectFill' 
                        lazyLoad
                        onError={() => {
                          console.log('房型图片加载失败:', pictureUrl)
                        }}
                      />
                      {roomPictures.length > 1 && (
                        <View className='image-count-badge'>
                          <Text className='image-count-text'>{roomPictures.length}张</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View className='room-type-image room-type-image-placeholder'>
                      <Text className='placeholder-text'>暂无图片</Text>
                    </View>
                  )}
                  <View className={`room-type-content ${pictureUrl ? 'with-image' : ''}`}>
                    <Text className='room-name'>{roomType.name}</Text>
                    <View className='room-details'>
                      <Text className='room-detail-text'>
                        {roomType.bedType && <>{roomType.bedType} </>}
                        {roomType.areaSqm && <>{roomType.areaSqm}㎡ </>}
                        {roomType.maxGuests && <>{roomType.maxGuests}人入住 </>}
                        {roomType.breakfast && <>{roomType.breakfast === '含早餐' ? '含2人早餐' : '无早餐'}</>}
                      </Text>
                    </View>
                    {!isLoggedIn && (
                      <Text className='login-hint-text'>登录查看最新房态</Text>
                    )}
                    {isLoggedIn && showSoldOut && (
                      <Text className='sold-out-text'>售罄</Text>
                    )}
                    {isLoggedIn && showLowStock && (
                      <Text className='low-stock-text'>仅剩{remainingQty}间</Text>
                    )}
                  </View>
                  <View className='room-type-action'>
                    <View className='price-section'>
                      <Text className='price-symbol'>¥</Text>
                      <Text className='price-value'>{Math.round(price)}</Text>
                      <Text className='price-unit'>起</Text>
                    </View>
                    <Button
                      className={`book-btn ${isLoggedIn && showSoldOut ? 'book-btn-disabled' : ''}`}
                      onClick={() => handleBook(roomType.id)}
                      disabled={isLoggedIn && showSoldOut}
                    >
                      订
                    </Button>
                  </View>
                </View>
              )
            })
          ) : (
            <View className='empty-room-types'>
              <Text>暂无房型数据</Text>
            </View>
          )}
        </View>

        <View className='hotel-policies-card'>
          <Text className='section-title'>酒店政策</Text>
          <View className='policy-card-content'>
            <View className='policy-row'>
              <View className='policy-item-content'>
                <Text className='policy-item-label'>取消政策</Text>
                <Text className='policy-item-value'>{getCancelPolicyLabel(hotel.cancelPolicy) || '-'}</Text>
              </View>
            </View>
            <View className='policy-row'>
              <View className='policy-item-content'>
                <Text className='policy-item-label'>修改政策</Text>
                <Text className='policy-item-value'>{getChangePolicyLabel(hotel.changePolicy) || '-'}</Text>
              </View>
            </View>
            <View className='policy-row'>
              <View className='policy-item-content'>
                <Text className='policy-item-label'>加床政策</Text>
                <Text className='policy-item-value'>{getExtraBedPolicyLabel(hotel.extraBedPolicy) || '-'}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>

      <View className='hotel-footer'>
        <Text className='footer-brand'>易宿</Text>
        <Text className='footer-slogan'>安心订🏠放心住</Text>
        <View className='footer-features'>
          <View className='footer-feature'>
            <Text className='feature-title'>入住保障</Text>
            <Text className='feature-desc'>无房必赔保障</Text>
          </View>
          <View className='footer-feature'>
            <Text className='feature-title'>专业客服</Text>
            <Text className='feature-desc'>全天客服在线</Text>
          </View>
          <View className='footer-feature'>
            <Text className='feature-title'>应急支援</Text>
            <Text className='feature-desc'>紧急情况援助</Text>
          </View>
        </View>
      </View>

      {showCalendar && (
        <Calendar
          visible={showCalendar}
          startDate={checkIn}
          endDate={checkOut}
          onConfirm={handleCalendarConfirm}
          onClose={handleCalendarClose}
        />
      )}

      {showGuestPanel && (
        <View className='drawer-mask' onClick={handleGuestClick}>
          <View className='drawer-panel' onClick={(e) => e.stopPropagation()}>
            <View className='drawer-header'>
              <Text className='drawer-title'>选择客房和入住人数</Text>
              <View className='drawer-close' onClick={handleGuestClick}>✕</View>
            </View>
            <View className='drawer-content'>
              <View className='guest-row'>
                <Text className='guest-label'>房间数</Text>
                <Picker mode='selector' range={[1, 2, 3, 4, 5]} onChange={handleRoomsChange}>
                  <View className='guest-picker'>
                    <Text>{rooms}间</Text>
                    <Text className='picker-arrow'>▼</Text>
                  </View>
                </Picker>
              </View>
              <View className='guest-row'>
                <Text className='guest-label'>成人</Text>
                <Picker mode='selector' range={[1, 2, 3, 4, 5]} onChange={handleAdultsChange}>
                  <View className='guest-picker'>
                    <Text>{adults}人</Text>
                    <Text className='picker-arrow'>▼</Text>
                  </View>
                </Picker>
              </View>
              <View className='guest-row'>
                <Text className='guest-label'>儿童</Text>
                <Picker mode='selector' range={[0, 1, 2, 3, 4]} onChange={handleChildrenChange}>
                  <View className='guest-picker'>
                    <Text>{children}人</Text>
                    <Text className='picker-arrow'>▼</Text>
                  </View>
                </Picker>
              </View>
            </View>
            <View className='drawer-footer'>
              <Button className='drawer-btn' onClick={handleGuestConfirm}>完成</Button>
            </View>
          </View>
        </View>
      )}

      {pendingOrder && remainingTime > 0 && (
        <View
          className='pending-bookmark'
          style={{
            left: `${bookmarkPosition.x}px`,
            top: `${bookmarkPosition.y}px`
          }}
          onClick={handleBookmarkClick}
          onTouchStart={handleBookmarkTouchStart}
          onTouchMove={handleBookmarkTouchMove}
          onTouchEnd={handleBookmarkTouchEnd}
          catchTouchMove
        >
          <Text className='bookmark-icon'>⏰</Text>
          <Text className='bookmark-time'>{formatCountdown(remainingTime)}</Text>
        </View>
      )}

      <ImagePreview
        visible={showImagePreview}
        images={previewImages}
        currentIndex={currentPreviewIndex}
        onClose={handleClosePreview}
        onChange={handlePreviewChange}
      />
    </View>
  )
}
