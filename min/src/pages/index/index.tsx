import React, { Component } from 'react'
import { View, Text, Swiper, SwiperItem, Picker, Input, Image, ScrollView, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { hotelService, Banner, Hotel } from '../../services/hotel.service'
import { orderService } from '../../services/order.service'
import { userService } from '../../services/user.service'
import Calendar from '../../components/calendar/calendar'
import Skeleton from '../../components/skeleton/skeleton'
import './index.scss'

interface SearchParams {
  city: string
  hotelName: string
  checkIn: string
  checkOut: string
  minPrice: number
  maxPrice: number
  starLevel: number
  tags: string[]
}

interface StarLevel {
  label: string
  value: number
}

interface IndexState {
  bannerList: Banner[]
  searchParams: SearchParams
  starLevels: StarLevel[]
  availableTags: string[]
  recommendHotels: Hotel[]
  loading: boolean
  showCalendar: boolean
  calendarType: 'checkIn' | 'checkOut'
  pendingOrder: any
  remainingTime: number
  showPriceModal: boolean
  showStarModal: boolean
  tempMinPrice: string
  tempMaxPrice: string
  locating: boolean
  locationBubble: {
    visible: boolean
    city: string
    address: string
  }
}

export default class Index extends Component<{}, IndexState> {
  countdownTimer: any = null

  getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  state = {
    bannerList: [],
    searchParams: {
      city: '',
      hotelName: '',
      checkIn: this.getTodayDate(),
      checkOut: this.getTomorrowDate(),
      minPrice: 0,
      maxPrice: 2000,
      starLevel: 0,
      tags: []
    },
    starLevels: [
      { label: '不限', value: 0 },
      { label: '三星级', value: 3 },
      { label: '四星级', value: 4 },
      { label: '五星级', value: 5 }
    ],
    hotelTags: [],
    availableTags: [],
    recommendHotels: [],
    loading: false,
    showCalendar: false,
    calendarType: 'checkIn',
    pendingOrder: null,
    remainingTime: 0,
    showPriceModal: false,
    showStarModal: false,
    tempMinPrice: '0',
    tempMaxPrice: '2000',
    locating: false,
    locationBubble: {
      visible: false,
      city: '',
      address: ''
    }
  }

  cityPinyinMap: { [key: string]: string } = {
    '北京': 'beijing',
    '上海': 'shanghai',
    '广州': 'guangzhou',
    '深圳': 'shenzhen',
    '杭州': 'hangzhou',
    '成都': 'chengdu'
  }

  componentDidShow() {
    this.loadBanners()
    this.loadRecommendHotels()
    this.loadAllTags()
    this.loadPendingOrder()
    
    const savedCheckIn = Taro.getStorageSync('selectedCheckIn')
    const savedCheckOut = Taro.getStorageSync('selectedCheckOut')
    if (savedCheckIn && savedCheckOut) {
      this.setState(prevState => ({
        searchParams: {
          ...prevState.searchParams,
          checkIn: savedCheckIn,
          checkOut: savedCheckOut
        }
      }))
    }
  }

  componentDidHide() {
    this.stopCountdown()
  }

  loadBanners = async () => {
    try {
      const startTime = Date.now()
      const banners = await hotelService.getBanners()
      console.log('Banners loaded:', banners)

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)

      setTimeout(() => {
        this.setState({ bannerList: banners || [] })
      }, delayTime)
    } catch (error) {
      console.error('加载Banner失败:', error)
      this.setState({ bannerList: [] })
    }
  }

  loadRecommendHotels = async () => {
    try {
      const startTime = Date.now()
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      console.log('查询日期:', dateStr)

      const hotels = await hotelService.getRecommendHotels(4, dateStr)
      console.log('Recommend hotels loaded:', hotels)

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)

      setTimeout(() => {
        this.setState({ recommendHotels: hotels || [] })
      }, delayTime)
    } catch (error) {
      console.error('加载推荐酒店失败:', error)
      this.setState({ recommendHotels: [] })
    }
  }

  loadAllTags = async () => {
    try {
      const startTime = Date.now()
      const tags = await hotelService.getAllTags()
      console.log('All tags loaded:', tags)

      const elapsedTime = Date.now() - startTime
      const minSkeletonTime = 800
      const delayTime = Math.max(0, minSkeletonTime - elapsedTime)

      setTimeout(() => {
        this.setState({ availableTags: tags || [] })
      }, delayTime)
    } catch (error) {
      console.error('加载标签失败:', error)
      this.setState({ availableTags: [] })
    }
  }

  loadPendingOrder = async () => {
    if (!userService.isLoggedIn()) {
      this.setState({ pendingOrder: null, remainingTime: 0 }, () => {
        this.startCountdown()
      })
      return
    }

    try {
      const order = await orderService.getPendingOrder()
      console.log('=== loadPendingOrder ===')
      console.log('order:', order)
      this.setState({ 
        pendingOrder: order,
        remainingTime: order?.remainingTime || 0
      }, () => {
        this.startCountdown()
      })
    } catch (error) {
      console.error('加载待支付订单失败:', error)
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

  handleBannerClick = (banner: Banner) => {
    console.log('Banner clicked:', banner)
    const hotelId = banner.hotel?.id || banner.hotelId
    console.log('Final hotelId:', hotelId)
    if (hotelId) {
      const { searchParams } = this.state
      Taro.redirectTo({
        url: `/pages/hotel/detail?id=${hotelId}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`
      })
      setTimeout(() => {
        Taro.hideLoading()
      }, 100)
    } else {
      Taro.showToast({
        title: '未找到关联酒店',
        icon: 'none'
      })
    }
  }

  handleHotelClick = (hotel: Hotel) => {
    const { searchParams } = this.state
    Taro.redirectTo({
      url: `/pages/hotel/detail?id=${hotel.id}&checkIn=${searchParams.checkIn}&checkOut=${searchParams.checkOut}`
    })
    setTimeout(() => {
      Taro.hideLoading()
    }, 100)
  }

  renderStars = (starLevel: number) => {
    const stars = []
    for (let i = 0; i < starLevel; i++) {
      stars.push(<Text key={i} className='star'>⭐</Text>)
    }
    return stars
  }

  getTagLabel = (tag: string) => {
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
    return labelMap[tag] || tag
  }

  handleCityChange = (e) => {
    const cityOptions = ['不限', '北京', '上海', '广州', '深圳', '杭州', '成都']
    const selectedCity = cityOptions[e.detail.value]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        city: selectedCity === '不限' ? '' : selectedCity
      }
    })
  }

  handleLocationClick = async () => {
    console.log('=== 开始定位流程 ===')
    
    try {
      console.log('1. 获取用户设置')
      const setting = await Taro.getSetting()
      console.log('用户设置:', setting)
      console.log('定位权限状态:', setting.authSetting['scope.userLocation'])

      if (setting.authSetting['scope.userLocation'] === false) {
        console.log('2. 用户之前拒绝过授权，引导到设置')
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
        this.setState({ locating: false })
        return
      }

      console.log('2. 直接获取位置（会自动触发授权）')
      this.setState({ locating: true })

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
        const city = (addressComponent.city && addressComponent.city.length > 0) ? addressComponent.city : addressComponent.province
        const district = addressComponent.district
        const township = addressComponent.township
        const street = addressComponent.streetNumber && addressComponent.street ? `${addressComponent.street}${addressComponent.streetNumber}` : addressComponent.street
        const formattedAddress = result.formatted_address

        const cityPinyin = this.cityPinyinMap[city] || city.toLowerCase()

        const isDirectCity = province === city
        const displayAddress = isDirectCity 
          ? `${city}，${district}` 
          : `${province}，${city}，${district}`

        this.setState({
          searchParams: {
            ...this.state.searchParams,
            city: cityPinyin
          },
          locationBubble: {
            visible: true,
            city: city,
            address: displayAddress
          },
          locating: false
        })

        setTimeout(() => {
          this.setState(prevState => ({
            locationBubble: {
              ...prevState.locationBubble,
              visible: false
            }
          }))
        }, 30000)
      } else {
        throw new Error('逆地理编码失败')
      }
    }).catch(err => {
      console.error('逆地理编码失败:', err)
      Taro.showToast({
        title: '获取位置信息失败',
        icon: 'none'
      })
      this.setState({ locating: false })
    })
  }

  handleHotelNameChange = (e) => {
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        hotelName: e.detail.value
      }
    })
  }

  handleStarChange = (e) => {
    const selectedStar = this.state.starLevels[e.detail.value]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        starLevel: selectedStar.value
      }
    })
  }

  handleTagToggle = (tag: { label: string, value: string }) => {
    const { tags } = this.state.searchParams
    const newTags = tags.includes(tag.value)
      ? tags.filter(t => t !== tag.value)
      : [...tags, tag.value]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        tags: newTags
      }
    })
  }

  handlePriceClick = () => {
    this.setState({ 
      showPriceModal: true,
      tempMinPrice: this.state.searchParams.minPrice.toString(),
      tempMaxPrice: this.state.searchParams.maxPrice.toString()
    })
  }

  handlePriceConfirm = () => {
    const { tempMinPrice, tempMaxPrice } = this.state
    this.setState({ 
      showPriceModal: false,
      searchParams: {
        ...this.state.searchParams,
        minPrice: tempMinPrice === '' ? 0 : parseInt(tempMinPrice) || 0,
        maxPrice: tempMaxPrice === '' ? 0 : parseInt(tempMaxPrice) || 0
      }
    })
  }

  handlePriceCancel = () => {
    this.setState({ showPriceModal: false })
  }

  handleMinPriceChange = (e) => {
    this.setState({ tempMinPrice: e.detail.value })
  }

  handleMaxPriceChange = (e) => {
    this.setState({ tempMaxPrice: e.detail.value })
  }

  handleStarClick = () => {
    this.setState({ showStarModal: true })
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
  }

  handleCalendarClose = () => {
    this.setState({ showCalendar: false })
  }

  formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  handlePendingBannerClick = () => {
    const { pendingOrder } = this.state
    if (pendingOrder && pendingOrder.orderId) {
      Taro.navigateTo({
        url: `/pages/order/detail?orderId=${pendingOrder.orderId}`
      })
    }
  }

  formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
    }
    return dateStr
  }

  handleSearch = async () => {
    const { searchParams } = this.state
    Taro.showToast({
      title: '搜索中...',
      icon: 'loading'
    })

    try {
      const hotels = await hotelService.searchHotels({
        city: searchParams.city,
        keyword: searchParams.hotelName,
        starLevel: searchParams.starLevel > 0 ? searchParams.starLevel : undefined,
        tags: searchParams.tags,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        minPrice: searchParams.minPrice > 0 ? searchParams.minPrice : undefined,
        maxPrice: searchParams.maxPrice < 2000 ? searchParams.maxPrice : undefined
      })

      Taro.hideToast()

      const hotelsStr = encodeURIComponent(JSON.stringify(hotels))
      const searchParamsStr = encodeURIComponent(JSON.stringify(searchParams))

      Taro.navigateTo({
        url: `/pages/hotel/list?hotels=${hotelsStr}&searchParams=${searchParamsStr}`
      })
    } catch (error) {
      console.error('搜索失败:', error)
      Taro.showToast({
        title: '搜索失败，请重试',
        icon: 'none'
      })
    }
  }



  render() {
    const { bannerList, recommendHotels, availableTags, pendingOrder, remainingTime, searchParams, showPriceModal, showStarModal, locationBubble } = this.state
    const isLoading = bannerList.length === 0 || recommendHotels.length === 0 || availableTags.length === 0

    return (
      <View className='index'>
        {locationBubble.visible && (
          <View className='location-bubble'>
            <Text className='bubble-text'>📍{locationBubble.address}</Text>
          </View>
        )}
        <View className='banner-section'>
          {bannerList.length > 0 ? (
            <Swiper className='banner-swiper' indicatorDots autoplay circular catchMove>
              {bannerList.map((banner) => (
                <SwiperItem key={banner.id}>
                  <View className='banner-item' onClick={() => this.handleBannerClick(banner)}>
                    {banner.coverImage && <Image className='banner-image' src={banner.coverImage} mode='aspectFill' lazyLoad />}
                  </View>
                </SwiperItem>
              ))}
            </Swiper>
          ) : (
            isLoading ? (
              <Skeleton type='banner' showContent={true} />
            ) : (
              <View className='banner-placeholder'>
                <Text>暂无轮播图</Text>
              </View>
            )
          )}
        </View>

        {pendingOrder && remainingTime > 0 && (
          <View className='pending-banner' onClick={() => this.handlePendingBannerClick()}>
            <Text className='banner-text'>您有一笔待支付的行程订单 倒计时</Text>
            <Text className='banner-time'>{this.formatCountdown(remainingTime)}</Text>
          </View>
        )}

        <View className='search-section'>
          <View className='search-title'>
            <Text className='title-text'>搜索酒店</Text>
          </View>

          <View className='search-form'>
            <View className='form-row'>
              <View className='form-item'>
                <Text className='form-label'>城市</Text>
                <View className='form-value-row'>
                  <Picker mode='selector' range={['不限', '北京', '上海', '广州', '深圳', '杭州', '成都']} onChange={this.handleCityChange}>
                    <View className='form-value'>
                      <Text>{this.state.searchParams.city || '不限'}</Text>
                      <Text className='arrow'>▼</Text>
                    </View>
                  </Picker>
                  <View className='location-btn' onClick={this.handleLocationClick}>
                    <Text className={`location-icon ${this.state.locating ? 'locating' : ''}`}>🌍</Text>
                  </View>
                </View>
              </View>

              <View className='form-item'>
                <Text className='form-label'>酒店名称</Text>
                <Input
                  className='form-input'
                  placeholder='请输入酒店名称'
                  value={this.state.searchParams.hotelName}
                  onInput={this.handleHotelNameChange}
                />
              </View>
            </View>

            <View className='form-row'>
              <View className='form-item' onClick={this.handleCheckInClick}>
                <Text className='form-label'>入住日期</Text>
                <View className='form-value'>
                  <Text>{this.formatDateDisplay(this.state.searchParams.checkIn)}</Text>
                  <Text className='arrow'>▼</Text>
                </View>
              </View>
              <View className='form-item' onClick={this.handleCheckOutClick}>
                <Text className='form-label'>退房日期</Text>
                <View className='form-value'>
                  <Text>{this.formatDateDisplay(this.state.searchParams.checkOut)}</Text>
                  <Text className='arrow'>▼</Text>
                </View>
              </View>
            </View>

            <View className='form-row'>
              <View className='form-item half-width'>
                <Text className='form-label'>价格</Text>
                <View className='form-value' onClick={this.handlePriceClick}>
                  <Text>¥{searchParams.minPrice} - {searchParams.maxPrice >= 2000 ? '2000以上' : searchParams.maxPrice}</Text>
                  <Text className='arrow'>▼</Text>
                </View>
              </View>
              <View className='form-item half-width'>
                <Text className='form-label'>星级</Text>
                <View className='form-value' onClick={this.handleStarClick}>
                  <Text>{this.state.starLevels.find(item => item.value === this.state.searchParams.starLevel)?.label}</Text>
                  <Text className='arrow'>▼</Text>
                </View>
              </View>
            </View>

            <View className='form-item'>
              <Text className='form-label'>酒店标签</Text>
              <View className='tags-container'>
                <View
                  className={`tag-item ${this.state.searchParams.tags.length === 0 ? 'active' : ''}`}
                  onClick={() => this.setState({ searchParams: { ...this.state.searchParams, tags: [] } })}
                >
                  <Text className='tag-text'>不限</Text>
                </View>
                {this.state.availableTags.map((tag, index) => (
                  <View
                    key={index}
                    className={`tag-item ${this.state.searchParams.tags.includes(tag) ? 'active' : ''}`}
                    onClick={() => this.handleTagToggle({ label: this.getTagLabel(tag), value: tag })}
                  >
                    <Text className='tag-text'>{this.getTagLabel(tag)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className='search-btn' onClick={this.handleSearch}>
            <Text className='search-btn-text'>立即查询</Text>
          </View>
        </View>

        <View className='recommend-section'>
          <View className='section-header'>
            <Text className='section-title'>为你推荐</Text>
            <View className='refresh-btn' onClick={this.loadRecommendHotels}>
              <Text className='refresh-icon'>↻</Text>
              <Text className='refresh-text'>换一批</Text>
            </View>
          </View>
          <View className='hotel-list'>
            {recommendHotels.length > 0 ? (
              recommendHotels.map((hotel) => (
                <View key={hotel.id} className='hotel-card' onClick={() => this.handleHotelClick(hotel)}>
                  {hotel.coverImage && <Image className='hotel-cover' src={hotel.coverImage} mode='aspectFill' lazyLoad />}
                  <View className='hotel-content'>
                    <Text className='hotel-name'>{hotel.hotelName}</Text>
                    <Text className='hotel-name-en'>{hotel.hotelNameEn}</Text>
                    <View className='hotel-stars'>
                      {this.renderStars(hotel.starLevel)}
                    </View>
                    {hotel.tags && Array.isArray(hotel.tags) && hotel.tags.length > 0 && (
                      <View className='hotel-tags'>
                        {hotel.tags.map((tag, index) => (
                          <Text key={index} className='hotel-tag'>{this.getTagLabel(tag)}</Text>
                        ))}
                      </View>
                    )}
                    <View className='hotel-address'>📍 {hotel.address}</View>
                    {hotel.minPrice && (
                      <View className='hotel-price'>
                        <Text className='price'>¥{hotel.minPrice}</Text>
                        <Text className='price-unit'>起</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : isLoading ? (
              <>
                <Skeleton type='card' showContent={true} />
                <Skeleton type='card' showContent={true} />
                <Skeleton type='card' showContent={true} />
                <Skeleton type='card' showContent={true} />
              </>
            ) : (
              <View className='empty-tip'>
                <Text>暂无推荐酒店</Text>
              </View>
            )}
          </View>
        </View>

        <Calendar
          visible={this.state.showCalendar}
          startDate={this.state.searchParams.checkIn}
          endDate={this.state.searchParams.checkOut}
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
                      value={this.state.tempMinPrice}
                      onInput={this.handleMinPriceChange}
                    />
                  </View>
                  <View className='price-input-item'>
                    <Text className='price-label'>最高价格</Text>
                    <Input
                      className='price-input'
                      type='number'
                      value={this.state.tempMaxPrice}
                      onInput={this.handleMaxPriceChange}
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
}
