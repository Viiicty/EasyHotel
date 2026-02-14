import React, { Component } from 'react'
import { View, Text, Image, Button, ScrollView, Picker } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { hotelService, HotelDetail, RoomType } from '../../services/hotel.service'
import { userService } from '../../services/user.service'
import Calendar from '../../components/calendar/calendar'
import Skeleton from '../../components/skeleton/skeleton'
import './index.scss'

interface HotelDetailState {
  hotel: HotelDetail | null
  roomTypes: RoomType[]
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
    loading: true,
    error: null,
    checkIn: '02-10',
    checkOut: '02-11',
    nights: 1,
    rooms: 1,
    adults: 1,
    children: 0,
    showCalendar: false,
    calendarType: 'checkIn',
    showGuestPanel: false
  }

  componentDidShow() {
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
      this.setState({ loading: true })

      const cacheKey = `hotel_${id}`
      
      const cachedHotel = Taro.getStorageSync(cacheKey)
      const cachedRoomTypes = Taro.getStorageSync(`${cacheKey}_rooms`)
      
      if (cachedHotel) {
        this.setState({
          hotel: cachedHotel,
          roomTypes: cachedRoomTypes || [],
          loading: false
        })
      }

      const hotelDetail = await hotelService.getHotelDetail(id)
      const roomTypes = await hotelService.getRoomTypesByHotel(id)

      Taro.setStorageSync(cacheKey, hotelDetail)
      Taro.setStorageSync(`${cacheKey}_rooms`, roomTypes)

      this.setState({
        hotel: hotelDetail,
        roomTypes: roomTypes,
        loading: false
      })
    } catch (error) {
      console.error('获取酒店详情失败:', error)
      this.setState({
        error: '获取酒店详情失败',
        loading: false
      })
    }
  }

  handleBook = (roomTypeId: string) => {
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

    const instance = getCurrentInstance()
    const { id: hotelId } = instance.router?.params || {}

    if (hotelId) {
      Taro.navigateTo({
        url: `/pages/book/book?hotelId=${hotelId}&roomTypeId=${roomTypeId}&checkIn=${this.state.checkIn}&checkOut=${this.state.checkOut}&rooms=${this.state.rooms}&adults=${this.state.adults}&children=${this.state.children}`
      })
    }
  }

  getWeekday = (dateStr: string) => {
    const parts = dateStr.split('-')
    const date = new Date(2026, parseInt(parts[0]) - 1, parseInt(parts[1]))
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  }

  handleDateClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkIn' })
  }

  handleCalendarConfirm = (startDate: string, endDate: string) => {
    const startParts = startDate.split('-')
    const endParts = endDate.split('-')
    const currentYear = new Date().getFullYear()
    const start = new Date(currentYear, parseInt(startParts[0]) - 1, parseInt(startParts[1]))
    const end = new Date(currentYear, parseInt(endParts[0]) - 1, parseInt(endParts[1]))
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    this.setState({
      checkIn: startDate,
      checkOut: endDate,
      nights,
      showCalendar: false
    })
  }

  handleCalendarClose = () => {
    this.setState({ showCalendar: false })
  }

  handleRoomsChange = (e) => {
    this.setState({ rooms: parseInt(e.detail.value) })
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
          <Skeleton type='banner' />
          <View className='hotel-info-card'>
            <View className='skeleton-content'>
              <View className='skeleton-title' style={{ width: '60%', height: '32px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '12px' }} />
              <View className='skeleton-text' style={{ width: '100%', height: '24px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '8px' }} />
              <View className='skeleton-text' style={{ width: '100%', height: '24px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '8px' }} />
            </View>
          </View>
          <View className='room-types-card'>
            <Skeleton type='card' />
            <Skeleton type='card' />
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
            <Text className='date-range'>{checkIn}-{checkOut}</Text>
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
              roomTypes.map((roomType) => (
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
                  </View>
                  <Button className='book-btn' onClick={() => this.handleBook(roomType.id)}>订</Button>
                </View>
              ))
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
