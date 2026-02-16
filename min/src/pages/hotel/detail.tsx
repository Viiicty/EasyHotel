import React, { Component } from 'react'
import { View, Text, Image, Button, ScrollView, Picker } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { hotelService, HotelDetail, RoomType } from '../../services/hotel.service'
import { userService } from '../../services/user.service'
import { bookingService } from '../../services/booking.service'
import Calendar from '../../components/calendar/calendar'
import Skeleton from '../../components/skeleton/skeleton'
import './index.scss'

interface RoomInventory {
  roomTypeId: string
  minRemainingQty: number
}

interface HotelDetailState {
  hotel: HotelDetail | null
  roomTypes: RoomType[]
  roomInventories: RoomInventory[]
  loading: boolean
  error: string | null
  checkIn: string
  checkOut: string
  nights: number
  rooms: number
  adults: number
  children: number
  showCalendar: boolean
  calendarType: 'checkIn' | 'checkOut'
  showGuestPanel: boolean
}

export default class HotelDetailPage extends Component<{}, HotelDetailState> {
  state: HotelDetailState = {
    hotel: null,
    roomTypes: [],
    roomInventories: [],
    loading: true,
    error: null,
    checkIn: '2026-02-10',
    checkOut: '2026-02-11',
    nights: 1,
    rooms: 1,
    adults: 1,
    children: 0,
    showCalendar: false,
    calendarType: 'checkIn',
    showGuestPanel: false
  }

  componentDidShow() {
    const instance = getCurrentInstance()
    const { id, checkIn, checkOut } = instance.router?.params || {}

    if (checkIn && checkOut) {
      console.log('接收到的日期参数:', { checkIn, checkOut })
      this.setState({ checkIn, checkOut }, () => {
        this.loadRoomInventories()
      })
    }

    this.loadHotelDetail()
  }

  componentDidHide() {}

  loadHotelDetail = async () => {
    const instance = getCurrentInstance()
    const { id } = instance.router?.params || {}

    if (!id) {
      this.setState({ error: '酒店ID不存在', loading: false })
      return
    }

    try {
      const cacheKey = `hotel_${id}`

      const cachedHotel = Taro.getStorageSync(cacheKey)
      const cachedRoomTypes = Taro.getStorageSync(`${cacheKey}_rooms`)

      const startTime = Date.now()

      const hotelDetail = await hotelService.getHotelDetail(id)
      const roomTypes = await hotelService.getRoomTypesByHotel(id)

      Taro.setStorageSync(cacheKey, hotelDetail)
      Taro.setStorageSync(`${cacheKey}_rooms`, roomTypes)

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)

      setTimeout(() => {
        this.setState({
          hotel: hotelDetail,
          roomTypes: roomTypes,
          loading: false
        })
      }, delayTime)

      await this.loadRoomInventories()
    } catch (error) {
      console.error('获取酒店详情失败:', error)
      this.setState({
        error: '获取酒店详情失败',
        loading: false
      })
    }
  }

  loadRoomInventories = async () => {
    const { roomTypes, checkIn, checkOut, rooms } = this.state

    if (roomTypes.length === 0) {
      return
    }

    if (!userService.isLoggedIn()) {
      console.log('用户未登录，跳过库存检查')
      return
    }

    try {
      const inventories: RoomInventory[] = []

      for (const roomType of roomTypes) {
        try {
          const result = await bookingService.checkInventory({
            roomTypeId: roomType.id,
            checkIn: this.formatDate(checkIn),
            checkOut: this.formatDate(checkOut),
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

      this.setState({ roomInventories: inventories })
    } catch (error) {
      console.error('加载房型库存失败:', error)
    }
  }

  formatDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return dateStr
    }
    const currentYear = new Date().getFullYear()
    return `${currentYear}-${parts[0]}-${parts[1]}`
  }

  handleBook = async (roomTypeId: string) => {
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
        checkIn: this.formatDate(this.state.checkIn),
        checkOut: this.formatDate(this.state.checkOut),
        rooms: this.state.rooms
      })

      if (!result.available) {
        Taro.showModal({
          title: '库存不足',
          content: result.message || '该房型在选定时间段内库存不足',
          showCancel: false
        })
        return
      }

      const instance = getCurrentInstance()
      const { id: hotelId } = instance.router?.params || {}

      if (hotelId) {
        Taro.navigateTo({
          url: `/pages/book/book?hotelId=${hotelId}&roomTypeId=${roomTypeId}&checkIn=${this.state.checkIn}&checkOut=${this.state.checkOut}&rooms=${this.state.rooms}&adults=${this.state.adults}&children=${this.state.children}`
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

  getWeekday = (dateStr: string) => {
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

  formatDateDisplay = (dateStr: string): string => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
    } else if (parts.length >= 2) {
      return `${parts[0]}月${parts[1]}日`
    }
    return dateStr
  }

  handleDateClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkIn' })
  }

  handleCalendarConfirm = (startDate: string, endDate: string) => {
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

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    this.setState({
      checkIn: startDate,
      checkOut: endDate,
      nights,
      showCalendar: false
    }, () => {
      this.loadRoomInventories()
    })
  }

  handleCalendarClose = () => {
    this.setState({ showCalendar: false })
  }

  handleRoomsChange = (e) => {
    this.setState({ rooms: parseInt(e.detail.value) }, () => {
      this.loadRoomInventories()
    })
  }

  handleAdultsChange = (e) => {
    this.setState({ adults: parseInt(e.detail.value) })
  }

  handleChildrenChange = (e) => {
    this.setState({ children: parseInt(e.detail.value) })
  }

  handleGuestClick = () => {
    this.setState({ showGuestPanel: !this.state.showGuestPanel })
  }

  handleGuestConfirm = () => {
    this.setState({ showGuestPanel: false })
  }

  renderStars = (starLevel: number) => {
    const stars = []
    for (let i = 0; i < starLevel; i++) {
      stars.push(<Text key={i} className='star'>★</Text>)
    }
    return stars
  }

  getFacilityIcon = (facility: string) => {
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

  getFacilityLabel = (facility: string) => {
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

  render() {
    const { hotel, roomTypes, loading, error, checkIn, checkOut, nights, rooms, adults, children, showCalendar, showGuestPanel } = this.state

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

    return (
      <View className='hotel-detail'>
        {hotel.coverImage && (
          <Image className='hotel-banner' src={hotel.coverImage} mode='aspectFill' lazyLoad />
        )}

        <View className='hotel-info-card'>
          <View className='hotel-header'>
            <View className='hotel-name-section'>
              <Text className='hotel-name'>{hotel.hotelName}</Text>
              <Text className='hotel-name-en'>{hotel.hotelNameEn}</Text>
            </View>
            <View className='hotel-rating'>
              {this.renderStars(hotel.starLevel)}
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
                      <Text className='facility-icon'>{this.getFacilityIcon(facility)}</Text>
                      <Text className='facility-label'>{this.getFacilityLabel(facility)}</Text>
                    </View>
                  ))
                })()}
                {(() => {
                  const tags = hotel.tags || []
                  const tagsArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',') : [])
                  return tagsArray.map((tag, index) => (
                    <View key={`tag-${index}`} className='facility-item'>
                      <Text className='facility-icon'>{this.getFacilityIcon(tag)}</Text>
                      <Text className='facility-label'>{this.getFacilityLabel(tag)}</Text>
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
          <View className='date-section' onClick={this.handleDateClick}>
            <Text className='date-weekday'>{this.getWeekday(checkIn)}-{this.getWeekday(checkOut)}</Text>
            <Text className='date-range'>{this.formatDateDisplay(checkIn)}-{this.formatDateDisplay(checkOut)}</Text>
          </View>
          <View className='divider'></View>
          <View className='nights-section'>
            <Text className='nights-text'>共 {nights} 晚</Text>
          </View>
          <View className='divider'></View>
          <View className='guests-section' onClick={this.handleGuestClick}>
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
                const inventory = this.state.roomInventories.find(inv => inv.roomTypeId === roomType.id)
                const remainingQty = inventory?.minRemainingQty || 0
                const showLowStock = remainingQty > 0 && remainingQty <= 4
                const showSoldOut = remainingQty === 0
                const isLoggedIn = userService.isLoggedIn()

                return (
                  <View key={roomType.id} className='room-type-card'>
                    <View className='room-type-content'>
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
                            <Text className='detail-text'>{roomType.areaSqm}㎡</Text>
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
                    <Button 
                      className={`book-btn ${isLoggedIn && showSoldOut ? 'book-btn-disabled' : ''}`} 
                      onClick={() => this.handleBook(roomType.id)}
                      disabled={isLoggedIn && showSoldOut}
                    >
                      {!isLoggedIn ? '订' : '订'}
                    </Button>
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

        {showCalendar && (
          <Calendar
            visible={showCalendar}
            startDate={checkIn}
            endDate={checkOut}
            onConfirm={this.handleCalendarConfirm}
            onClose={this.handleCalendarClose}
          />
        )}

        {showGuestPanel && (
          <View className='drawer-mask' onClick={this.handleGuestClick}>
            <View className='drawer-panel' onClick={(e) => e.stopPropagation()}>
              <View className='drawer-header'>
                <Text className='drawer-title'>选择客房和入住人数</Text>
                <View className='drawer-close' onClick={this.handleGuestClick}>✕</View>
              </View>
              <View className='drawer-content'>
                <View className='guest-row'>
                  <Text className='guest-label'>房间数</Text>
                  <Picker mode='selector' range={[1, 2, 3, 4, 5]} onChange={this.handleRoomsChange}>
                    <View className='guest-picker'>
                      <Text>{rooms}间</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </Picker>
                </View>
                <View className='guest-row'>
                  <Text className='guest-label'>成人</Text>
                  <Picker mode='selector' range={[1, 2, 3, 4, 5]} onChange={this.handleAdultsChange}>
                    <View className='guest-picker'>
                      <Text>{adults}人</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </Picker>
                </View>
                <View className='guest-row'>
                  <Text className='guest-label'>儿童</Text>
                  <Picker mode='selector' range={[0, 1, 2, 3, 4]} onChange={this.handleChildrenChange}>
                    <View className='guest-picker'>
                      <Text>{children}人</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </Picker>
                </View>
              </View>
              <View className='drawer-footer'>
                <Button className='drawer-btn' onClick={this.handleGuestConfirm}>完成</Button>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
