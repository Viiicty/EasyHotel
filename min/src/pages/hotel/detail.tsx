import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image, Button, ScrollView, Picker, Swiper, SwiperItem } from '@tarojs/components'
import Taro, { getCurrentInstance, useDidShow } from '@tarojs/taro'
import { hotelService, HotelDetail, RoomType, HotelImage, RoomTypePicture } from '../../services/hotel.service'
import { userService } from '../../services/user.service'
import { bookingService } from '../../services/booking.service'
import { orderService } from '../../services/order.service'
import Calendar from '../../components/calendar/calendar'
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
    }
    if (params?.adults) {
      finalAdults = parseInt(params.adults)
    }
    if (params?.children) {
      finalChildren = parseInt(params.children)
    }

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
      return
    }

    if (!userService.isLoggedIn()) {
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
      setRemainingTime(time)

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

      startCountdown()
    } catch (error) {
      console.error('加载待支付订单失败:', error)
      setPendingOrder(null)
      setRemainingTime(0)
      startCountdown()
    } finally {
      isLoadingPendingOrder.current = false
    }
  }

  const startCountdown = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current)
      countdownTimer.current = null
    }

    countdownTimer.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          if (countdownTimer.current) {
            clearInterval(countdownTimer.current)
            countdownTimer.current = null
          }
          setTimeout(() => {
            loadPendingOrder()
          }, 100)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleBookmarkClick = () => {
    if (isDragging) return

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
      setRoomTypePictures(roomPicturesMap)
      setLoading(false)

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
      stars.push(<Text key={i} className='star'>★</Text>)
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
      'wifi': 'WiFi',
      'parking': '停车场',
      'swimming': '泳池',
      'gym': '健身房',
      'restaurant': '餐厅',
      'spa': 'SPA',
      'family': '亲子',
      'luxury': '豪华',
      'business': '商务',
      'airport': '近机场',
      'subway': '近地铁'
    }
    return labelMap[facility] || facility
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
    displayImages = hotelImages.sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0))
  } else if (hotel.coverImage) {
    displayImages = [{ id: 'default', hotelId: hotel.id, url: hotel.coverImage, sortNo: 0 }]
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
            />
          ) : (
            <Swiper
              className='hotel-banner-swiper'
              indicatorDots
              autoplay
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
                console.log(`Image ${index}:`, imageUrl)
                
                return (
                  <SwiperItem key={image.id || index}>
                    <Image 
                      className='hotel-banner' 
                      src={imageUrl} 
                      mode='aspectFill' 
                      lazyLoad 
                    />
                  </SwiperItem>
                )
              })}
            </Swiper>
          )}
        </View>
      )}

      <View className='hotel-info-card'>
        <View className='hotel-header'>
          <View className='hotel-name-section'>
            <Text className='hotel-name'>{hotel.hotelName}</Text>
            <Text className='hotel-name-en'>{hotel.hotelNameEn}</Text>
          </View>
          <View className='hotel-rating'>
            {renderStars(hotel.starLevel)}
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
                    <Text className='facility-label'>{getFacilityLabel(tag)}</Text>
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
          <Text className='nights-text'>共 {nights} 晚</Text>
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
                    <View className='room-type-image'>
                      <Image 
                        className='room-image' 
                        src={pictureUrl} 
                        mode='aspectFill' 
                        lazyLoad 
                      />
                    </View>
                  ) : (
                    <View className='room-type-image room-type-image-placeholder'>
                      <Text className='placeholder-text'>暂无图片</Text>
                    </View>
                  )}
                  <View className={`room-type-content ${pictureUrl ? 'with-image' : ''}`}>
                    <Text className='room-name'>{roomType.name}</Text>
                    <View className='room-details'>
                      {roomType.bedType && (
                        <View className='room-detail-item'>
                          <Text className='detail-icon'>🛏️</Text>
                          <Text className='detail-text'>{roomType.bedType}</Text>
                        </View>
                      )}
                      {roomType.areaSqm && (
                        <View className='room-detail-item'>
                          <Text className='detail-icon'>📐</Text>
                          <Text className='detail-text'>{Math.round(parseFloat(String(roomType.areaSqm)))}㎡</Text>
                        </View>
                      )}
                      {roomType.maxGuests && (
                        <View className='room-detail-item'>
                          <Text className='detail-icon'>👥</Text>
                          <Text className='detail-text'>最多{roomType.maxGuests}人入住</Text>
                        </View>
                      )}
                      {roomType.breakfast && (
                        <View className='room-detail-item'>
                          <Text className='detail-icon'>🍳</Text>
                          <Text className='detail-text'>{roomType.breakfast}</Text>
                        </View>
                      )}
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
      </View>
      </ScrollView>

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
    </View>
  )
}
