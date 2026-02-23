import React, { Component } from 'react'
import { View, Text, Image, Input, Picker, Button, ScrollView } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { Hotel, hotelService } from '../../services/hotel.service'
import { orderService } from '../../services/order.service'
import Calendar from '../../components/calendar/calendar'
import CitySelector from '../../components/city-selector/city-selector'
import PriceSelector from '../../components/price-selector/price-selector'
import StarSelector from '../../components/star-selector/star-selector'
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
  displayCity: string
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
  showCityModal: boolean
  isHotelNameFocused: boolean
  locating: boolean
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

  cityPinyinMap: { [key: string]: string } = {
    '北京': 'beijing',
    '上海': 'shanghai',
    '广州': 'guangzhou',
    '深圳': 'shenzhen',
    '杭州': 'hangzhou',
    '成都': 'chengdu',
    '重庆': 'chongqing',
    '武汉': 'wuhan',
    '西安': 'xian',
    '南京': 'nanjing',
    '苏州': 'suzhou',
    '天津': 'tianjin',
    '青岛': 'qingdao',
    '厦门': 'xiamen',
    '大连': 'dalian',
    '三亚': 'sanya',
    '丽江': 'lijiang',
    '桂林': 'guilin',
    '昆明': 'kunming',
    '长沙': 'changsha',
    '郑州': 'zhengzhou',
    '济南': 'jinan',
    '沈阳': 'shenyang',
    '哈尔滨': 'harbin'
  }

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
    displayCity: '',
    showCityDatePanel: false,
    showGuestPanel: false,
    showCalendar: false,
    calendarType: 'checkIn',
    pendingOrder: null,
    remainingTime: 0,
    bookmarkPosition: { x: 300, y: 600 },
    isDragging: false,
    showPriceModal: false,
    showStarModal: false,
    showCityModal: false,
    isHotelNameFocused: false,
    locating: false
  }

  componentDidShow() {
    const instance = getCurrentInstance()
    const { hotels, searchParams } = instance.router?.params || {}

    this.loadPendingOrder()

    const savedCheckIn = Taro.getStorageSync('selectedCheckIn')
    const savedCheckOut = Taro.getStorageSync('selectedCheckOut')
    const savedRooms = Taro.getStorageSync('selectedRooms')
    const savedAdults = Taro.getStorageSync('selectedAdults')
    const savedChildren = Taro.getStorageSync('selectedChildren')

    if (searchParams) {
      try {
        const parsedParams = JSON.parse(decodeURIComponent(searchParams))
        if (savedCheckIn && savedCheckOut) {
          parsedParams.checkIn = savedCheckIn
          parsedParams.checkOut = savedCheckOut
        }
        if (savedRooms) {
          parsedParams.rooms = savedRooms
        }
        if (savedAdults) {
          parsedParams.adults = savedAdults
        }
        if (savedChildren) {
          parsedParams.children = savedChildren
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
      }
      if (savedRooms || savedAdults || savedChildren) {
        shouldReload = true
      }
      this.setState(prevState => ({
        searchParams: {
          ...prevState.searchParams,
          checkIn: savedCheckIn || prevState.searchParams.checkIn,
          checkOut: savedCheckOut || prevState.searchParams.checkOut,
          rooms: savedRooms || prevState.searchParams.rooms,
          adults: savedAdults || prevState.searchParams.adults,
          children: savedChildren !== undefined ? savedChildren : prevState.searchParams.children
        }
      }), () => {
        if (shouldReload) {
          this.loadInitialHotels()
        }
      })
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

      const systemInfo = Taro.getSystemInfoSync()
      const screenWidth = systemInfo.windowWidth
      const screenHeight = systemInfo.windowHeight
      const bookmarkSize = 65
      const margin = 5

      const savedPosition = Taro.getStorageSync('pendingBookmarkPosition')

      this.setState({
        bookmarkPosition: savedPosition || {
          x: screenWidth - bookmarkSize - margin,
          y: screenHeight - bookmarkSize - margin
        }
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

    Taro.setStorageSync('pendingBookmarkPosition', { x: finalX, y: bookmarkPosition.y })
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

  handleHotelNameFocus = () => {
    this.setState({ isHotelNameFocused: true })
  }

  handleHotelNameBlur = () => {
    this.setState({ isHotelNameFocused: false })
  }

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

  handleCityClick = async () => {
    this.setState({ locating: true })
    await this.getCurrentLocation()
  }

  handleCityPickerClick = () => {
    this.setState({ showCityModal: true })
  }

  handleCityCancel = () => {
    this.setState({ showCityModal: false })
  }

  getCurrentLocation = async () => {
    try {
      const res = await Taro.getLocation({
        type: 'wgs84'
      })
      console.log('位置获取成功:', res)
      console.log('经纬度:', { latitude: res.latitude, longitude: res.longitude })

      const { latitude, longitude } = res
      this.reverseGeocode(latitude, longitude)
    } catch (err) {
      console.error('=== 定位流程失败 ===')
      console.error('错误信息:', err)
      console.error('错误详情:', JSON.stringify(err))
      
      if (err.errMsg && err.errMsg.includes('no permission')) {
        console.log('错误类型: 无权限')
        Taro.showModal({
          title: '提示',
          content: '需要获取您的位置信息来推荐附近酒店，请在设置中开启定位权限',
          confirmText: '去设置',
          success: (modalRes) => {
            if (modalRes.confirm) {
              Taro.openSetting()
            }
          }
        })
      } else if (err.errMsg && err.errMsg.includes('authorize:fail')) {
        console.log('错误类型: 授权失败')
        Taro.showToast({
          title: '授权失败，请重试',
          icon: 'none'
        })
      } else {
        console.log('错误类型: 其他错误')
        Taro.showToast({
          title: '定位失败，请检查定位权限',
          icon: 'none'
        })
      }
      
      this.setState({ locating: false })
    }
  }

  reverseGeocode = (latitude: number, longitude: number) => {
    const BASE_URL = 'http://localhost:8888'
    const AMAP_KEY = 'cbb0e9da5dc2bd7edb1d5cb63af8e039'
    const url = `${BASE_URL}/mini/hotel/location?location=${longitude},${latitude}&key=${AMAP_KEY}`

    Taro.request({
      url: url,
      method: 'GET'
    }).then(res => {
      if (res.statusCode === 200 && res.data.code === 200 && res.data.data.status === '1') {
        const result = res.data.data.regeocode
        const addressComponent = result.addressComponent
        const province = addressComponent.province
        const originalCity = (addressComponent.city && addressComponent.city.length > 0) ? addressComponent.city : addressComponent.province
        let city = originalCity.replace(/市$/, '')
        const district = addressComponent.district
        const township = addressComponent.township
        const street = addressComponent.streetNumber && addressComponent.street ? `${addressComponent.street}${addressComponent.streetNumber}` : addressComponent.street
        const formattedAddress = result.formatted_address

        const cityPinyin = this.cityPinyinMap[city] || city.toLowerCase()

        const isDirectCity = province === originalCity
        const displayAddress = isDirectCity 
          ? `${originalCity}，${district}` 
          : `${province}，${originalCity}，${district}`

        this.setState({
          searchParams: {
            ...this.state.searchParams,
            city: cityPinyin
          },
          displayCity: city,
          locating: false
        })

        Taro.showToast({
          title: `已定位到${city}`,
          icon: 'success'
        })
      } else {
        console.error('逆地理编码失败:', res)
        Taro.showToast({
          title: '定位失败，请重试',
          icon: 'none'
        })
        this.setState({ locating: false })
      }
    }).catch(err => {
      console.error('请求失败:', err)
      Taro.showToast({
        title: '定位失败，请重试',
        icon: 'none'
      })
      this.setState({ locating: false })
    })
  }

  handleCheckInClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkIn' })
  }

  handleCheckOutClick = () => {
    this.setState({ showCalendar: true, calendarType: 'checkOut' })
  }

  handleCalendarConfirm = (startDate: string, endDate: string) => {
    this.setState({
      showCityDatePanel: false,
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

  handleCitySelect = (city) => {
    const cityPinyin = city === '不限' ? '' : (this.cityPinyinMap[city] || city.toLowerCase())
    this.setState(prevState => ({
      showCityDatePanel: false,
      searchParams: {
        ...prevState.searchParams,
        city: cityPinyin
      },
      displayCity: city === '不限' ? '' : city
    }))
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
    const roomOptions = [1, 2, 3, 4, 5]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        rooms: roomOptions[e.detail.value]
      }
    })
  }

  handleAdultsChange = (e) => {
    const adultOptions = [1, 2, 3, 4, 5]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        adults: adultOptions[e.detail.value]
      }
    })
  }

  handleChildrenChange = (e) => {
    const childOptions = [0, 1, 2, 3, 4]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        children: childOptions[e.detail.value]
      }
    })
  }

  handleSearch = () => {
    const { searchParams } = this.state
    this.setState({ showCityDatePanel: false, showGuestPanel: false })
    this.loadInitialHotels()
  }

  handleStarConfirm = (starLevel: number) => {
    this.setState({
      showStarModal: false,
      showCityDatePanel: false,
      searchParams: {
        ...this.state.searchParams,
        starLevel
      }
    })
  }

  handleStarCancel = () => {
    this.setState({ showStarModal: false })
  }

  handlePriceConfirm = (minPrice: number, maxPrice: number) => {
    this.setState({
      showPriceModal: false,
      showCityDatePanel: false,
      searchParams: {
        ...this.state.searchParams,
        minPrice,
        maxPrice
      }
    })
  }

  handlePriceCancel = () => {
    this.setState({ showPriceModal: false })
  }

  handleHotelClick = (hotelId: string) => {
    const { searchParams } = this.state
    Taro.navigateTo({
      url: `/pages/hotel/detail?id=${hotelId}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}&rooms=${searchParams.rooms}&adults=${searchParams.adults}&children=${searchParams.children}`
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
    const { hotels, searchParams, displayCity, showCityDatePanel, showGuestPanel, showCalendar, loadingMore, hasMore, pendingOrder, remainingTime, bookmarkPosition, showPriceModal, showStarModal, showCityModal, locating } = this.state

    return (
      <View className='hotel-list-page'>
        <View className='search-bar'>
          <View className='search-main-row'>
            <View className='search-city' onClick={this.handleCityDateClick}>
              <Text className='city-text'>{displayCity || '城市'}</Text>
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
              <View className='hotel-name-wrapper'>
                {!searchParams.hotelName && !this.state.isHotelNameFocused && (
                  <Text className='hotel-name-placeholder'>酒店名称</Text>
                )}
                <Input
                  className='hotel-name-input'
                  value={searchParams.hotelName}
                  onInput={this.handleHotelNameChange}
                  onFocus={this.handleHotelNameFocus}
                  onBlur={this.handleHotelNameBlur}
                />
              </View>
            </View>
          </View>

          {showCityDatePanel && (
            <View className='city-date-mask' onClick={() => this.setState({ showCityDatePanel: false })}>
              <View className='city-date-panel' onClick={(e) => e.stopPropagation()}>
                <ScrollView className='panel-scroll' scrollY>
                  <View className='panel-content'>
                    <View className='panel-row'>
                      <Text className='panel-label'>城市</Text>
                      <View className='location-icon' onClick={locating ? null : this.handleCityClick}>🌏</View>
                      <View className='panel-picker' onClick={locating ? null : this.handleCityPickerClick}>
                        <Text>{locating ? '定位中...' : (displayCity || '不限')}</Text>
                        <Text className='picker-arrow'>▼</Text>
                      </View>
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
                        <View className='panel-picker' onClick={() => this.setState({ showPriceModal: true })}>
                          <Text>¥{searchParams.minPrice} - {searchParams.maxPrice >= 2000 ? '2000以上' : searchParams.maxPrice}</Text>
                          <Text className='picker-arrow'>▼</Text>
                        </View>
                      </View>
                      <View className='panel-half-row' style={{width: '48%'}}>
                        <Text className='panel-label'>星级</Text>
                        <View className='panel-picker' onClick={() => this.setState({ showStarModal: true })}>
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

        <CitySelector
          visible={showCityModal}
          selectedCity={searchParams.city}
          onConfirm={this.handleCitySelect}
          onClose={this.handleCityCancel}
        />

        <PriceSelector
          visible={showPriceModal}
          minPrice={searchParams.minPrice}
          maxPrice={searchParams.maxPrice}
          onConfirm={this.handlePriceConfirm}
          onClose={this.handlePriceCancel}
        />

        <StarSelector
          visible={showStarModal}
          starLevel={searchParams.starLevel}
          onConfirm={this.handleStarConfirm}
          onClose={this.handleStarCancel}
        />

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
