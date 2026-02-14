import React, { Component } from 'react'
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { hotelService, HotelDetail, RoomType } from '../../services/hotel.service'
import Calendar from '../../components/calendar/calendar'
import './book.scss'

interface BookState {
  hotelId: string
  roomTypeId: string
  hotel: HotelDetail | null
  roomType: RoomType | null
  checkIn: string
  checkOut: string
  nights: number
  rooms: number
  adults: number
  children: number
  guestName: string
  guestPhone: string
  showCalendar: boolean
  calendarType: 'checkIn' | 'checkOut'
  loading: boolean
}

export default class BookPage extends Component<{}, BookState> {
  state: BookState = {
    hotelId: '',
    roomTypeId: '',
    hotel: null,
    roomType: null,
    checkIn: '02-10',
    checkOut: '02-11',
    nights: 1,
    rooms: 1,
    adults: 1,
    children: 0,
    guestName: '',
    guestPhone: '',
    showCalendar: false,
    calendarType: 'checkIn',
    loading: false
  }

  componentDidShow() {
    const instance = getCurrentInstance()
    const { hotelId, roomTypeId, checkIn, checkOut, rooms, adults, children } = instance.router?.params || {}

    if (hotelId && roomTypeId) {
      this.setState({ 
        hotelId, 
        roomTypeId,
        checkIn: checkIn || '02-10',
        checkOut: checkOut || '02-11',
        rooms: rooms ? parseInt(rooms) : 1,
        adults: adults ? parseInt(adults) : 1,
        children: children ? parseInt(children) : 0
      })
      this.loadData(hotelId, roomTypeId)
    }
  }

  componentDidHide() {}

  loadData = async (hotelId: string, roomTypeId: string) => {
    try {
      this.setState({ loading: true })

      const hotel = await hotelService.getHotelDetail(hotelId)
      const roomTypes = await hotelService.getRoomTypesByHotel(hotelId)
      const roomType = roomTypes.find(rt => rt.id === roomTypeId)

      this.setState({
        hotel,
        roomType,
        loading: false
      })
    } catch (error) {
      console.error('加载数据失败:', error)
      Taro.showToast({
        title: '加载数据失败',
        icon: 'none'
      })
      this.setState({ loading: false })
    }
  }

  handleCheckInClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkIn' })
  }

  handleCheckOutClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkOut' })
  }

  handleCalendarConfirm = (startDate: string, endDate: string) => {
    const startParts = startDate.split('-')
    const endParts = endDate.split('-')
    const start = new Date(2026, parseInt(startParts[0]) - 1, parseInt(startParts[1]))
    const end = new Date(2026, parseInt(endParts[0]) - 1, parseInt(endParts[1]))
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

  handleGuestNameChange = (e) => {
    this.setState({ guestName: e.detail.value })
  }

  handleGuestPhoneChange = (e) => {
    this.setState({ guestPhone: e.detail.value })
  }

  handleGuestsChange = (e) => {
    this.setState({ adults: parseInt(e.detail.value) })
  }

  handleSubmit = () => {
    const { hotel, roomType, checkIn, checkOut, adults, children, guestName, guestPhone } = this.state

    if (!guestName) {
      Taro.showToast({
        title: '请输入入住人姓名',
        icon: 'none'
      })
      return
    }

    if (!guestPhone) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(guestPhone)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    Taro.showToast({
      title: '预订成功',
      icon: 'success'
    })

    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/order/index'
      })
    }, 1500)
  }

  renderStars = (starLevel: number) => {
    const stars = []
    for (let i = 0; i < starLevel; i++) {
      stars.push(<Text key={i} className='star'>⭐</Text>)
    }
    return stars
  }

  render() {
    const { hotel, roomType, checkIn, checkOut, nights, rooms, adults, children, guestName, guestPhone, showCalendar, loading } = this.state

    if (loading) {
      return (
        <View className='book-page'>
          <View className='loading'>加载中...</View>
        </View>
      )
    }

    if (!hotel || !roomType) {
      return (
        <View className='book-page'>
          <View className='error'>数据加载失败</View>
        </View>
      )
    }

    return (
      <View className='book-page'>
        <ScrollView scrollY className='book-container'>
          <View className='hotel-info-card'>
            {hotel.coverImage && (
              <Image className='hotel-cover' src={hotel.coverImage} mode='aspectFill' />
            )}
            <View className='hotel-details'>
              <Text className='hotel-name'>{hotel.hotelName}</Text>
              <Text className='hotel-name-en'>{hotel.hotelNameEn}</Text>
              <View className='hotel-stars'>
                {this.renderStars(hotel.starLevel)}
              </View>
              <Text className='hotel-address'>📍 {hotel.address}</Text>
            </View>
          </View>

          <View className='room-info-card'>
            <Text className='card-title'>房型信息</Text>
            <View className='room-details'>
              <View className='room-name'>{roomType.name}</View>
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

          <View className='date-info-card'>
            <Text className='card-title'>入住日期</Text>
            <View className='date-selection'>
              <View className='date-item' onClick={this.handleCheckInClick}>
                <Text className='date-label'>入住</Text>
                <Text className='date-value'>{checkIn}</Text>
              </View>
              <Text className='date-separator'>-</Text>
              <View className='date-item' onClick={this.handleCheckOutClick}>
                <Text className='date-label'>离店</Text>
                <Text className='date-value'>{checkOut}</Text>
              </View>
            </View>
            <View className='nights-info'>
              <Text className='nights-text'>共 {nights} 晚</Text>
            </View>
          </View>

          <View className='guest-info-card'>
            <Text className='card-title'>入住人信息</Text>
            <View className='form-item'>
              <Text className='form-label'>房间数</Text>
              <Input
                className='form-input'
                type='number'
                value={rooms}
                disabled
              />
            </View>
            <View className='form-item'>
              <Text className='form-label'>成人数</Text>
              <Input
                className='form-input'
                type='number'
                value={adults}
                onInput={this.handleGuestsChange}
              />
            </View>
            <View className='form-item'>
              <Text className='form-label'>儿童数</Text>
              <Input
                className='form-input'
                type='number'
                value={children}
                onInput={(e) => this.setState({ children: parseInt(e.detail.value) })}
              />
            </View>
            <View className='form-item'>
              <Text className='form-label'>入住人姓名</Text>
              <Input
                className='form-input'
                placeholder='请输入姓名'
                value={guestName}
                onInput={this.handleGuestNameChange}
              />
            </View>
            <View className='form-item'>
              <Text className='form-label'>手机号</Text>
              <Input
                className='form-input'
                type='number'
                placeholder='请输入手机号'
                value={guestPhone}
                onInput={this.handleGuestPhoneChange}
              />
            </View>
          </View>
        </ScrollView>

        <View className='book-footer'>
          <View className='price-info'>
            <Text className='price-label'>总价</Text>
            <Text className='price-value'>¥{nights * 500}</Text>
          </View>
          <Button className='submit-btn' onClick={this.handleSubmit}>确认预订</Button>
        </View>

        <Calendar
          visible={showCalendar}
          startDate={checkIn}
          endDate={checkOut}
          onConfirm={this.handleCalendarConfirm}
          onClose={this.handleCalendarClose}
        />
      </View>
    )
  }
}
