import React, { Component } from 'react'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { bookingService } from '../../services/booking.service'
import { userService } from '../../services/user.service'
import './index.scss'

interface BookingState {
  hotelId: string
  roomTypeId: string
  checkIn: string
  checkOut: string
  rooms: number
  adults: number
  children: number
  hotel: any
  roomType: any
  prices: Array<{ date: string; price: number }>
  totalPrice: number
  nights: number
  calculatedRooms: number
  guestName: string
  guestPhone: string
  idCard: string
  remarks: string
  loading: boolean
  submitting: boolean
  holdToken: string
  expireAt: string
  countdown: number
}

export default class BookingPage extends Component<{}, BookingState> {
  countdownTimer: any = null

  state: BookingState = {
    hotelId: '',
    roomTypeId: '',
    checkIn: '',
    checkOut: '',
    rooms: 1,
    adults: 1,
    children: 0,
    hotel: null,
    roomType: null,
    prices: [],
    totalPrice: 0,
    nights: 0,
    calculatedRooms: 1,
    guestName: '',
    guestPhone: '',
    idCard: '',
    remarks: '',
    loading: true,
    submitting: false,
    holdToken: '',
    expireAt: '',
    countdown: 0
  }

  componentDidShow() {
    this.loadBookingData()
  }

  componentDidHide() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  }

  loadBookingData = async () => {
    const instance = getCurrentInstance()
    const params = instance.router?.params || {}

    const { hotelId, roomTypeId, checkIn, checkOut, rooms, adults, children } = params

    if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
      Taro.showToast({
        title: '参数不完整',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
      return
    }

    try {
      this.setState({ loading: true })

      console.log('=== 加载预定数据 ===')
      console.log('参数:', { hotelId, roomTypeId, checkIn, checkOut, rooms, adults, children })

      const result = await bookingService.prepareBooking({
        hotelId,
        roomTypeId,
        checkIn: this.formatDate(checkIn),
        checkOut: this.formatDate(checkOut),
        rooms: parseInt(rooms) || 1,
        adults: parseInt(adults) || 1,
        children: parseInt(children) || 0
      })

      console.log('=== 预定数据返回 ===')
      console.log('酒店信息:', result.hotel)
      console.log('房型信息:', result.roomType)
      console.log('价格信息:', result.prices)
      console.log('总价:', result.totalPrice)
      console.log('晚数:', result.nights)
      console.log('计算房间数:', result.calculatedRooms)

      const userInfo = userService.getUserInfo()
      console.log('=== 用户信息检查 ===')
      console.log('getUserInfo() 返回:', userInfo)
      console.log('getToken():', userService.getToken())
      console.log('getUserId():', userService.getUserId())
      console.log('isLoggedIn():', userService.isLoggedIn())

      this.setState({
        hotelId,
        roomTypeId,
        checkIn: this.formatDate(checkIn),
        checkOut: this.formatDate(checkOut),
        rooms: parseInt(rooms) || 1,
        adults: parseInt(adults) || 1,
        children: parseInt(children) || 0,
        hotel: result.hotel,
        roomType: result.roomType,
        prices: result.prices,
        totalPrice: result.totalPrice,
        nights: result.nights,
        calculatedRooms: result.calculatedRooms,
        guestName: userInfo?.name || '',
        guestPhone: userInfo?.phone || '',
        idCard: userInfo?.idCard || '',
        loading: false
      })
    } catch (error) {
      console.error('加载预定数据失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setState({ loading: false })
    }
  }

  formatDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return dateStr
    }
    const year = new Date().getFullYear()
    return `${year}-${parts[0]}-${parts[1]}`
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

  formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  formatWeekday = (dateStr: string) => {
    const date = new Date(dateStr)
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  }

  handleRoomsChange = (delta: number) => {
    const newRooms = Math.max(1, this.state.rooms + delta)
    this.setState({ rooms: newRooms })
  }

  handleGuestNameChange = (e) => {
    this.setState({ guestName: e.detail.value })
  }

  handleGuestPhoneChange = (e) => {
    this.setState({ guestPhone: e.detail.value })
  }

  handleIdCardChange = (e) => {
    this.setState({ idCard: e.detail.value })
  }

  handleRemarksChange = (e) => {
    this.setState({ remarks: e.detail.value })
  }

  validateForm = () => {
    const { guestName, guestPhone, idCard } = this.state

    if (!guestName.trim()) {
      Taro.showToast({
        title: '请输入入住人姓名',
        icon: 'none'
      })
      return false
    }

    if (!guestPhone.trim()) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return false
    }

    if (!/^1[3-9]\d{9}$/.test(guestPhone)) {
      Taro.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return false
    }

    if (!idCard.trim()) {
      Taro.showToast({
        title: '请输入身份证号',
        icon: 'none'
      })
      return false
    }

    if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard)) {
      Taro.showToast({
        title: '身份证号格式不正确',
        icon: 'none'
      })
      return false
    }

    return true
  }

  handleSubmit = async () => {
    if (!this.validateForm()) {
      return
    }

    try {
      this.setState({ submitting: true })

      const result = await bookingService.submitBooking({
        hotelId: this.state.hotelId,
        roomTypeId: this.state.roomTypeId,
        checkIn: this.state.checkIn,
        checkOut: this.state.checkOut,
        rooms: this.state.rooms,
        nights: this.state.nights,
        adults: this.state.adults,
        children: this.state.children,
        guestName: this.state.guestName,
        guestPhone: this.state.guestPhone,
        idCard: this.state.idCard,
        remarks: this.state.remarks
      })

      this.setState({
        holdToken: result.holdToken,
        expireAt: result.expireAt,
        submitting: false
      })

      this.startCountdown()

      Taro.showModal({
        title: '订单已创建',
        content: '请在15分钟内完成支付',
        showCancel: false,
        success: () => {
          Taro.navigateTo({
            url: `/pages/order/detail?orderId=${result.orderId}&holdToken=${result.holdToken}`
          })
        }
      })
    } catch (error) {
      console.error('提交订单失败:', error)
      const message = error.message || '提交订单失败'
      Taro.showToast({
        title: message,
        icon: 'none'
      })
      this.setState({ submitting: false })
    }
  }

  startCountdown = () => {
    const expireTime = new Date(this.state.expireAt).getTime()
    const now = Date.now()
    const remaining = Math.max(0, Math.floor((expireTime - now) / 1000))

    this.setState({ countdown: remaining })

    this.countdownTimer = setInterval(() => {
      const currentTime = Date.now()
      const remainingTime = Math.max(0, Math.floor((expireTime - currentTime) / 1000))

      this.setState({ countdown: remainingTime })

      if (remainingTime <= 0) {
        clearInterval(this.countdownTimer)
      }
    }, 1000)
  }

  formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  render() {
    const {
      hotel,
      roomType,
      checkIn,
      checkOut,
      nights,
      rooms,
      adults,
      children,
      totalPrice,
      guestName,
      guestPhone,
      idCard,
      remarks,
      loading,
      submitting,
      countdown
    } = this.state

    if (loading) {
      return (
        <View className='booking-page'>
          <View className='loading'>加载中...</View>
        </View>
      )
    }

    return (
      <View className='booking-page'>
        <ScrollView className='booking-content' scrollY>
          <View className='hotel-info'>
            <Text className='hotel-name'>{hotel?.nameZh || ''}</Text>
            <View className='date-range'>
              <Text className='date-text'>
                {this.formatDateDisplay(checkIn)}周{this.formatWeekday(checkIn)}-{this.formatDateDisplay(checkOut)}周{this.formatWeekday(checkOut)} | {nights}晚
              </Text>
            </View>
            <View className='time-info'>
              <Text className='time-text'>
                {this.formatDateTime(hotel?.checkInTime)}后入住；{this.formatDateTime(hotel?.checkOutTime)}前退房
              </Text>
            </View>
            <View className='room-detail'>
                <Text className='room-name'>{roomType?.name || ''}</Text>
                <View className='room-info'>
                  <Text className='room-info-item'>{roomType?.bedType || ''}</Text>
                  <Text className='room-info-separator'>|</Text>
                  <Text className='room-info-item'>
                    {roomType?.areaSqm !== undefined && roomType?.areaSqm !== null 
                      ? parseFloat(roomType.areaSqm).toFixed(1) 
                      : ''}㎡
                  </Text>
                  <Text className='room-info-separator'>|</Text>
                  <Text className='room-info-item'>
                    {roomType?.breakfast === 'yes' ? '🍳 含双早' : roomType?.breakfast === 'no' ? '❌ 无早餐' : roomType?.breakfast || ''}
                  </Text>
                </View>
              </View>
            <View className='policy-info'>
              <Text className='policy-text'>
                取消政策：{hotel?.cancelPolicy || ''} | 修改政策：{hotel?.changePolicy || ''}
              </Text>
            </View>
          </View>

          <View className='booking-info'>
            <Text className='section-title'>订房信息</Text>
            <View className='rooms-control'>
              <Text className='rooms-label'>房间数量</Text>
              <View className='rooms-adjust'>
                <Text className='adjust-btn' onClick={() => this.handleRoomsChange(-1)}>-</Text>
                <Text className='rooms-value'>{rooms}</Text>
                <Text className='adjust-btn' onClick={() => this.handleRoomsChange(1)}>+</Text>
              </View>
            </View>
            <View className='form-item'>
              <Text className='form-label'>
                住客姓名<Text className='required'>*</Text>
              </Text>
              <Input
                className='form-input'
                placeholder='请输入住客姓名'
                value={guestName}
                onInput={this.handleGuestNameChange}
              />
            </View>
            <View className='form-item'>
              <Text className='form-label'>
                联系手机<Text className='required'>*</Text>
              </Text>
              <Input
                className='form-input'
                placeholder='请输入手机号'
                type='number'
                maxlength={11}
                value={guestPhone}
                onInput={this.handleGuestPhoneChange}
              />
            </View>
            <View className='form-item'>
              <Text className='form-label'>
                身份证号<Text className='required'>*</Text>
              </Text>
              <Input
                className='form-input'
                placeholder='请输入身份证号'
                maxlength={18}
                value={idCard}
                onInput={this.handleIdCardChange}
              />
            </View>
          </View>

          {countdown > 0 && (
            <View className='countdown-info'>
              <Text className='countdown-text'>
                请在 {this.formatCountdown(countdown)} 内完成支付
              </Text>
            </View>
          )}
        </ScrollView>

        <View className='booking-footer'>
          <View className='footer-price'>
            <Text className='price-label'>支付总价</Text>
            <Text className='price-value'>¥{totalPrice}</Text>
          </View>
          <Button
            className='submit-button'
            onClick={this.handleSubmit}
            disabled={submitting}
          >
            {submitting ? '提交中...' : '立即支付'}
          </Button>
        </View>
      </View>
    )
  }
}
