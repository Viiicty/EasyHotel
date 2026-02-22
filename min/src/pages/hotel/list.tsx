import React, { Component } from 'react'
import { View, Text, Image, Input, Picker, Button, ScrollView } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { Hotel, hotelService } from '../../services/hotel.service'
import { orderService } from '../../services/order.service'
import Calendar from '../../components/calendar/calendar'
import Skeleton from '../../components/skeleton/skeleton'
import { debounce } from '../../utils/debounce'
import './list.scss'

interface SearchParams {
  city: string
  hotelName: string
  checkIn: string
  checkOut: string
  minPrice: number
  maxPrice: number
  starLevel: number
  tags: string[]
  rooms: number
  adults: number
  children: number
}

interface HotelListState {
  hotels: Hotel[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  page: number
  pageSize: number
  searchParams: SearchParams
  showCityDatePanel: boolean
  showGuestPanel: boolean
  showCalendar: boolean
  calendarType: 'checkIn' | 'checkOut'
  pendingOrder: any
  remainingTime: number
  bookmarkPosition: { x: number; y: number }
  isDragging: boolean
  showPriceModal: boolean
  showStarModal: boolean

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

export default class HotelList extends Component<{}, HotelListState> {
  countdownTimer: any = null

  state: HotelListState = {
    hotels: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    searchParams: {
      city: '',
      hotelName: '',
      checkIn: getTodayDate(),
      checkOut: getTomorrowDate(),
      minPrice: 0,
      maxPrice: 2000,
      starLevel: 0,
      tags: [],
      rooms: 1,
      adults: 1,
      children: 0
    },
    showCityDatePanel: false,
    showGuestPanel: false,
    showCalendar: false,
    calendarType: 'checkIn',
    pendingOrder: null,
    remainingTime: 0,
    bookmarkPosition: { x: 0, y: 0 },
    isDragging: false,
    showPriceModal: false,
    showStarModal: false
  }

  componentDidShow() {
    const instance = getCurrentInstance()
    const { hotels, searchParams } = instance.router?.params || {}

    this.loadPendingOrder()

    const savedCheckIn = Taro.getStorageSync('selectedCheckIn')
    const savedCheckOut = Taro.getStorageSync('selectedCheckOut')

    if (searchParams) {
      try {
        const parsedParams = JSON.parse(decodeURIComponent(searchParams))
        if (savedCheckIn && savedCheckOut) {
          parsedParams.checkIn = savedCheckIn
          parsedParams.checkOut = savedCheckOut
        }
        this.setState({ searchParams: parsedParams }, () => {
          if (hotels) {
            try {
              const parsedHotels = JSON.parse(decodeURIComponent(hotels))
              this.setState({
                hotels: parsedHotels,
                hasMore: parsedHotels.length >= this.state.pageSize
              })
            } catch (error) {
              console.error('解析酒店数据失败:', error)
            }
          } else {
            this.loadInitialHotels()
          }
        })
      } catch (error) {
        console.error('解析搜索参数失败:', error)
      }
    } else {
      let shouldReload = false
      if (savedCheckIn && savedCheckOut) {
        const currentCheckIn = this.state.searchParams.checkIn
        const currentCheckOut = this.state.searchParams.checkOut
        if (currentCheckIn !== savedCheckIn || currentCheckOut !== savedCheckOut) {
          shouldReload = true
        }
        this.setState(prevState => ({
          searchParams: {
            ...prevState.searchParams,
            checkIn: savedCheckIn,
            checkOut: savedCheckOut
          }
        }), () => {
          if (shouldReload) {
            this.loadInitialHotels()
          }
        })
      }
      if (hotels) {
        try {
          const parsedHotels = JSON.parse(decodeURIComponent(hotels))
          this.setState({
            hotels: parsedHotels,
            hasMore: parsedHotels.length >= this.state.pageSize
          })
        } catch (error) {
          console.error('解析酒店数据失败:', error)
        }
      }
    }
  }

  componentDidHide() {
    this.stopCountdown()
  }

  loadPendingOrder = async () => {
    try {
      const order = await orderService.getPendingOrder()
      this.setState({
        pendingOrder: order,
        remainingTime: order?.remainingTime || 0
      }, () => {
        this.startCountdown()
      })
    } catch (error) {
      this.setState({ pendingOrder: null, remainingTime: 0 }, () => {
        this.startCountdown()
      })
    }
  }

  startCountdown = () => {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }

    const { remainingTime } = this.state
    if (remainingTime <= 0) {
      return
    }

    this.countdownTimer = setInterval(() => {
      this.setState(prevState => {
        const newRemainingTime = prevState.remainingTime - 1
        if (newRemainingTime > 0) {
          return { remainingTime: newRemainingTime }
        } else {
          clearInterval(this.countdownTimer)
          this.countdownTimer = null
          setTimeout(() => {
            this.loadPendingOrder()
          }, 100)
          return { remainingTime: 0 }
        }
      })
    }, 1000)
  }

  stopCountdown = () => {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }
  }

  handleBookmarkClick = () => {
    if (this.state.isDragging) return

    if (this.state.pendingOrder) {
      Taro.navigateTo({
        url: `/pages/order/detail?orderId=${this.state.pendingOrder.orderId}`
      })
    }
  }

  handleBookmarkTouchStart = (e) => {
    const touch = e.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
    this.startPositionX = this.state.bookmarkPosition.x
    this.startPositionY = this.state.bookmarkPosition.y
    this.setState({ isDragging: false })
  }

  handleBookmarkTouchMove = (e) => {
    const touch = e.touches[0]
    const deltaX = touch.clientX - this.startX
    const deltaY = touch.clientY - this.startY

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      this.setState({ isDragging: true })
    }

    let newX = this.startPositionX + deltaX
    let newY = this.startPositionY + deltaY

    const systemInfo = Taro.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const screenHeight = systemInfo.windowHeight
    const bookmarkSize = 100
    const margin = 10

    newX = Math.max(margin, Math.min(newX, screenWidth - bookmarkSize - margin))
    newY = Math.max(margin, Math.min(newY, screenHeight - bookmarkSize - margin))

    this.setState({
      bookmarkPosition: { x: newX, y: newY }
    })
  }

  handleBookmarkTouchEnd = () => {
    const systemInfo = Taro.getSystemInfoSync()
    const screenWidth = systemInfo.windowWidth
    const bookmarkSize = 100
    const bookmarkSize2 = 65
    const margin = 5

    const { bookmarkPosition } = this.state
    const centerX = bookmarkPosition.x + bookmarkSize / 2
    const screenCenterX = screenWidth / 2

    let finalX = bookmarkPosition.x
    if (centerX < screenCenterX) {
      finalX = margin
    } else {
      finalX = screenWidth - bookmarkSize2
    }

    this.setState({
      bookmarkPosition: { x: finalX, y: bookmarkPosition.y },
      isDragging: false
    })
  }

  formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  loadInitialHotels = async () => {
    const { searchParams, pageSize } = this.state

    this.setState({ loading: true })

    try {
      const startTime = Date.now()

      const result = await hotelService.searchHotels({
        city: searchParams.city,
        keyword: searchParams.hotelName,
        starLevel: searchParams.starLevel > 0 ? searchParams.starLevel : undefined,
        tags: searchParams.tags,
        page: 1,
        pageSize: pageSize,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        minPrice: searchParams.minPrice > 0 ? searchParams.minPrice : undefined,
        maxPrice: searchParams.maxPrice < 2000 ? searchParams.maxPrice : undefined
      })

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)

      setTimeout(() => {
        if (result && result.length > 0) {
          this.setState({
            hotels: result,
            page: 1,
            hasMore: result.length >= pageSize
          })
        } else {
          this.setState({ hotels: [], hasMore: false })
        }
      }, delayTime)
    } catch (error) {
      console.error('加载酒店失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setState({ loading: false })
    }
  }

  handleHotelNameChange = debounce((e: any) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        hotelName: e.detail.value
      }
    })
  }, 500)

  loadMoreHotels = async () => {
    const { loadingMore, hasMore, page, searchParams, pageSize } = this.state

    if (loadingMore || !hasMore) return

    this.setState({ loadingMore: true })

    try {
      const newPage = page + 1
      const result = await hotelService.searchHotels({
        city: searchParams.city,
        keyword: searchParams.hotelName,
        starLevel: searchParams.starLevel > 0 ? searchParams.starLevel : undefined,
        tags: searchParams.tags,
        page: newPage,
        pageSize: pageSize,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        minPrice: searchParams.minPrice > 0 ? searchParams.minPrice : undefined,
        maxPrice: searchParams.maxPrice < 2000 ? searchParams.maxPrice : undefined
      })

      if (result && result.length > 0) {
        this.setState({
          hotels: [...this.state.hotels, ...result],
          page: newPage,
          hasMore: result.length >= pageSize
        })
      } else {
        this.setState({ hasMore: false })
      }
    } catch (error) {
      console.error('加载更多失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loadingMore: false })
    }
  }

  handleScrollToLower = () => {
    this.loadMoreHotels()
  }

  handleCityDateClick = () => {
    this.setState({ showCityDatePanel: !this.state.showCityDatePanel, showGuestPanel: false })
  }

  handleCheckInClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkIn' })
  }

  handleCheckOutClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkOut' })
  }

  handleCalendarConfirm = (startDate: string, endDate: string) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        checkIn: startDate,
        checkOut: endDate
      },
      showCalendar: false
    })
    Taro.setStorageSync('selectedCheckIn', startDate)
    Taro.setStorageSync('selectedCheckOut', endDate)
  }

  handleCalendarClose = () => {
    this.setState({ showCalendar: false })
  }

  handleGuestClick = () => {
    this.setState({ showGuestPanel: !this.state.showGuestPanel, showCityDatePanel: false })
  }

  handleCityDateMaskClick = () => {
    this.setState({ showCityDatePanel: false })
  }

  handleCitySelect = (e) => {
    const cityOptions = ['不限', '北京', '上海', '广州', '深圳', '杭州', '成都']
    const selectedCity = cityOptions[e.detail.value]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        city: selectedCity === '不限' ? '' : selectedCity
      }
    })
  }

  handleCheckInChange = (e) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        checkIn: e.detail.value
      }
    })
  }

  handleCheckOutChange = (e) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        checkOut: e.detail.value
      }
    })
  }

  handleRoomsChange = (e) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        rooms: parseInt(e.detail.value)
      }
    })
  }

  handleAdultsChange = (e) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        adults: parseInt(e.detail.value)
      }
    })
  }

  handleChildrenChange = (e) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        children: parseInt(e.detail.value)
      }
    })
  }

  handleSearch = () => {
    const { searchParams } = this.state
    this.setState({ showCityDatePanel: false, showGuestPanel: false })
    this.loadInitialHotels()
  }

  handleMinPriceChange = (e) => {
    const value = parseInt(e.detail.value)
    this.setState(prevState => ({
      searchParams: {
        ...prevState.searchParams,
        minPrice: Math.min(value, prevState.searchParams.maxPrice - 100)
      }
    }))
  }

  handleMaxPriceChange = (e) => {
    const value = parseInt(e.detail.value)
    this.setState(prevState => ({
      searchParams: {
        ...prevState.searchParams,
        maxPrice: Math.max(value, prevState.searchParams.minPrice + 100)
      }
    }))
  }

  handleStarClick = () => {
    this.setState({
      showStarModal: true,
      showCityDatePanel: false,
      showGuestPanel: false
    })
  }

  handleStarConfirm = () => {
    this.setState({ showStarModal: false })
  }

  handleStarCancel = () => {
    this.setState({ showStarModal: false })
  }

  handleStarSelect = (starLevel) => {
    this.setState(prevState => ({
      searchParams: {
        ...prevState.searchParams,
        starLevel: starLevel
      }
    }))
  }

  handlePriceClick = () => {
    console.log('点击价格选项，打开价格弹窗')
    this.setState({
      showCityDatePanel: false,
      showGuestPanel: false,
      showPriceModal: true
    })
  }

  handlePriceConfirm = () => {
    console.log('确认价格，关闭价格弹窗')
    this.setState({ showPriceModal: false })
  }

  handlePriceCancel = () => {
    console.log('取消价格选择，关闭价格弹窗')
    this.setState({ showPriceModal: false })
  }

  handleHotelClick = (hotelId: string) => {
    const { searchParams } = this.state
    Taro.navigateTo({
      url: `/pages/hotel/detail?id=${hotelId}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`
    })
    setTimeout(() => {
      Taro.hideLoading()
    }, 100)
  }

  formatDateDisplay = (dateStr: string) => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return (
        <View className='date-display'>
          <Text className='date-month'>{parseInt(parts[1])}月</Text>
          <Text className='date-day'>{parseInt(parts[2])}日</Text>
        </View>
      )
    } else if (parts.length >= 2) {
      return (
        <View className='date-display'>
          <Text className='date-month'>{parts[0]}月</Text>
          <Text className='date-day'>{parts[1]}日</Text>
        </View>
      )
    }
    return <Text>{dateStr}</Text>
  }

  formatDateDisplaySimple = (dateStr: string): string => {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
    } else if (parts.length >= 2) {
      return `${parts[0]}月${parts[1]}日`
    }
    return dateStr
  }

  calculateNights = () => {
    const { checkIn, checkOut } = this.state.searchParams
    const parts1 = checkIn.split('-')
    const parts2 = checkOut.split('-')
    const currentYear = new Date().getFullYear()
    const start = new Date(currentYear, parseInt(parts1[0]) - 1, parseInt(parts1[1]))
    const end = new Date(currentYear, parseInt(parts2[0]) - 1, parseInt(parts2[1]))
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  renderPrice = (minPrice?: number) => {
    if (!minPrice) {
      return null
    }

    const nights = this.calculateNights()

    if (nights === 1) {
      return (
        <View className='hotel-price'>
          <Text className='price'>¥{minPrice}</Text>
          <Text className='price-unit'>起</Text>
        </View>
      )
    } else {
      const avgPrice = Math.round(minPrice)
      return (
        <View className='hotel-price'>
          <Text className='price-label'>均价</Text>
          <Text className='price'>¥{avgPrice}</Text>
          <Text className='price-unit'>起</Text>
        </View>
      )
    }
  }

  render() {
    const { hotels, searchParams, showCityDatePanel, showGuestPanel, showCalendar, loadingMore, hasMore, pendingOrder, remainingTime, bookmarkPosition, showPriceModal, showStarModal } = this.state

    return (
      <View className='hotel-list-page'>
        <View className='search-bar'>
          <View className='search-main-row'>
            <View className='search-city' onClick={this.handleCityDateClick}>
              <Text className='city-text'>{searchParams.city || '城市'}</Text>
              <Text className='arrow'>▼</Text>
            </View>
            <View className='search-dates' onClick={this.handleCityDateClick}>
              <View className='date-item'>
                <Text className='date-label'>入住</Text>
                {this.formatDateDisplay(searchParams.checkIn)}
              </View>
              <Text className='date-separator'>-</Text>
              <View className='date-item'>
                <Text className='date-label'>离店</Text>
                {this.formatDateDisplay(searchParams.checkOut)}
              </View>
            </View>
            <View className='search-hotel-name'>
              <Input
                className='hotel-name-input'
                placeholder='酒店名称'
                value={searchParams.hotelName}
                onInput={this.handleHotelNameChange}
              />
            </View>
          </View>

          {showCityDatePanel && (
            <View className='city-date-mask' onClick={this.handleCityDateMaskClick}>
              <View className='city-date-panel' onClick={(e) => e.stopPropagation()}>
                <ScrollView className='panel-scroll' scrollY>
                  <View className='panel-content'>
                    <View className='panel-row'>
                      <Text className='panel-label'>城市</Text>
                      <Picker mode='selector' range={['不限', '北京', '上海', '广州', '深圳', '杭州', '成都']} onChange={this.handleCitySelect}>
                        <View className='panel-picker'>
                          <Text>{searchParams.city || '不限'}</Text>
                          <Text className='picker-arrow'>▼</Text>
                        </View>
                      </Picker>
                    </View>
                    <View className='panel-row' onClick={this.handleCheckInClick}>
                      <Text className='panel-label'>入住日期</Text>
                      <View className='panel-picker'>
                        <Text>{this.formatDateDisplaySimple(searchParams.checkIn)}</Text>
                        <Text className='picker-arrow'>▼</Text>
                      </View>
                    </View>
                    <View className='panel-row' onClick={this.handleCheckOutClick}>
                      <Text className='panel-label'>离店日期</Text>
                      <View className='panel-picker'>
                        <Text>{this.formatDateDisplaySimple(searchParams.checkOut)}</Text>
                        <Text className='picker-arrow'>▼</Text>
                      </View>
                    </View>
                    <View className='panel-row' style={{flexWrap: 'wrap'}}>
                      <View className='panel-half-row' style={{width: '48%', marginRight: '4%'}}>
                        <Text className='panel-label'>价格</Text>
                        <View className='panel-picker'>
                          <Text>¥{searchParams.minPrice} - {searchParams.maxPrice >= 2000 ? '2000以上' : searchParams.maxPrice}</Text>
                          <Text className='picker-arrow'>▼</Text>
                        </View>
                      </View>
                      <View className='panel-half-row' style={{width: '48%'}}>
                        <Text className='panel-label'>星级</Text>
                        <View className='panel-picker' onClick={this.handleStarClick}>
                          <Text>{searchParams.starLevel > 0 ? searchParams.starLevel + '星' : '不限'}</Text>
                          <Text className='picker-arrow'>▼</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
                <View className='panel-footer'>
                  <Button className='panel-btn' onClick={this.handleSearch}>确认搜索</Button>
                </View>
              </View>
            </View>
          )}

          <View className='search-guest-row' onClick={this.handleGuestClick}>
            <Text className='guest-text'>{searchParams.rooms}间房 {searchParams.adults}成人 {searchParams.children}儿童</Text>
            <Text className='arrow'>▼</Text>
          </View>
        </View>

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
                      <Text>{searchParams.rooms}间</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </Picker>
                </View>
                <View className='guest-row'>
                  <Text className='guest-label'>成人</Text>
                  <Picker mode='selector' range={[1, 2, 3, 4, 5]} onChange={this.handleAdultsChange}>
                    <View className='guest-picker'>
                      <Text>{searchParams.adults}人</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </Picker>
                </View>
                <View className='guest-row'>
                  <Text className='guest-label'>儿童</Text>
                  <Picker mode='selector' range={[0, 1, 2, 3, 4]} onChange={this.handleChildrenChange}>
                    <View className='guest-picker'>
                      <Text>{searchParams.children}人</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </Picker>
                </View>
              </View>
              <View className='drawer-footer'>
                <Button className='drawer-btn' onClick={this.handleSearch}>完成</Button>
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
            onClick={this.handleBookmarkClick}
            onTouchStart={this.handleBookmarkTouchStart}
            onTouchMove={this.handleBookmarkTouchMove}
            onTouchEnd={this.handleBookmarkTouchEnd}
          >
            <Text className='bookmark-icon'>⏰</Text>
            <Text className='bookmark-time'>{this.formatCountdown(remainingTime)}</Text>
          </View>
        )}

        <ScrollView 
          scrollY 
          className='hotel-container'
          onScrollToLower={this.handleScrollToLower}
          lowerThreshold={100}
        >
          {hotels.length > 0 ? (
            <>
              {hotels.map((hotel) => (
                <View key={hotel.id} className='hotel-card' onClick={() => this.handleHotelClick(hotel.id)}>
                  <View className='hotel-left'>
                    {hotel.coverImage && <Image className='hotel-cover' src={hotel.coverImage} mode='aspectFill' lazyLoad />}
                  </View>
                  <View className='hotel-right'>
                    <Text className='hotel-name'>{hotel.hotelName}</Text>
                    <Text className='hotel-name-en'>{hotel.hotelNameEn}</Text>
                    <View className='hotel-info'>
                      <View className='hotel-stars'>
                        {this.renderStars(hotel.starLevel)}
                      </View>
                      <View className='hotel-address'>📍 {hotel.address}</View>
                    </View>
                    {hotel.facilities && Array.isArray(hotel.facilities) && hotel.facilities.length > 0 && (
                      <View className='hotel-facilities'>
                        {hotel.facilities.slice(0, 4).map((facility, index) => (
                          <Text key={index} className='facility-item'>{this.getFacilityLabel(facility)}</Text>
                        ))}
                      </View>
                    )}
                    {this.renderPrice(hotel.minPrice)}
                  </View>
                </View>
              ))}
              
              {loadingMore && (
                <>
                  <Skeleton type='card' showContent={true} />
                  <Skeleton type='card' showContent={true} />
                </>
              )}
            </>
          ) : loadingMore ? (
            <>
              <Skeleton type='card' showContent={true} />
              <Skeleton type='card' showContent={true} />
              <Skeleton type='card' showContent={true} />
            </>
          ) : (
            <View className='empty-state'>
              <Text className='empty-text'>暂无酒店数据</Text>
            </View>
          )}

          {loadingMore && (
            <View className='loading-more'>
              <Text className='loading-text'>加载中...</Text>
            </View>
          )}

          {!hasMore && hotels.length > 0 && (
            <View className='no-more'>
              <Text className='no-more-text'>没有更多了</Text>
            </View>
          )}
        </ScrollView>

        <Calendar
          visible={showCalendar}
          startDate={searchParams.checkIn}
          endDate={searchParams.checkOut}
          onConfirm={this.handleCalendarConfirm}
          onClose={this.handleCalendarClose}
        />

        {showPriceModal && (
          <View className='modal-mask' onClick={this.handlePriceCancel}>
            <View className='modal-content' onClick={(e) => e.stopPropagation()}>
              <View className='modal-header'>
                <Text className='modal-title'>选择价格区间</Text>
                <View className='modal-close' onClick={this.handlePriceCancel}>✕</View>
              </View>
              <View className='modal-body'>
                <View className='price-input-row'>
                  <View className='price-input-item'>
                    <Text className='price-label'>最低价格</Text>
                    <Input
                      className='price-input'
                      type='number'
                      value={searchParams.minPrice.toString()}
                      onChange={this.handleMinPriceChange}
                      placeholder='0'
                    />
                  </View>
                  <View className='price-input-item'>
                    <Text className='price-label'>最高价格</Text>
                    <Input
                      className='price-input'
                      type='number'
                      value={searchParams.maxPrice.toString()}
                      onChange={this.handleMaxPriceChange}
                      placeholder='2000'
                    />
                  </View>
                </View>
              </View>
              <View className='modal-footer'>
                <Button className='modal-btn cancel-btn' onClick={this.handlePriceCancel}>取消</Button>
                <Button className='modal-btn confirm-btn' onClick={this.handlePriceConfirm}>确定</Button>
              </View>
            </View>
          </View>
        )}

        {showStarModal && (
          <View className='modal-mask' onClick={this.handleStarCancel}>
            <View className='modal-content' onClick={(e) => e.stopPropagation()}>
              <View className='modal-header'>
                <Text className='modal-title'>选择星级</Text>
                <View className='modal-close' onClick={this.handleStarCancel}>✕</View>
              </View>
              <View className='modal-body'>
                <View className='star-rating-container'>
                  <Text className='star-rating-title'>请选择酒店星级</Text>
                  <View className='star-rating'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        className={`star ${searchParams.starLevel >= star ? 'active' : ''}`}
                        onClick={() => this.handleStarSelect(star)}
                      >
                        ⭐
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
              <View className='modal-footer'>
                <Button className='modal-btn cancel-btn' onClick={this.handleStarCancel}>取消</Button>
                <Button className='modal-btn confirm-btn' onClick={this.handleStarConfirm}>确定</Button>
              </View>
            </View>
          </View>
        )}

      </View>
    )
  }

  renderStars = (starLevel: number) => {
    const stars = []
    for (let i = 0; i < starLevel; i++) {
      stars.push(<Text key={i} className='star'>⭐</Text>)
    }
    return stars
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
}
