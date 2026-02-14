import React, { Component } from 'react'
import { View, Text, Image, Input, Picker, Button, ScrollView } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { Hotel, hotelService } from '../../services/hotel.service'
import Calendar from '../../components/calendar/calendar'
import Skeleton from '../../components/skeleton/skeleton'
import { debounce } from '../../utils/debounce'
import './list.scss'

interface SearchParams {
  city: string
  hotelName: string
  checkIn: string
  checkOut: string
  priceRange: number[]
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
}

export default class HotelList extends Component<{}, HotelListState> {
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
      checkIn: '02-10',
      checkOut: '02-11',
      priceRange: [0, 1000],
      starLevel: 0,
      tags: [],
      rooms: 1,
      adults: 1,
      children: 0
    },
    showCityDatePanel: false,
    showGuestPanel: false,
    showCalendar: false,
    calendarType: 'checkIn'
  }

  componentDidShow() {
    const instance = getCurrentInstance()
    const { hotels, searchParams } = instance.router?.params || {}
    
    console.log('接收到的参数:', { hotels, searchParams })
    
    if (hotels) {
      try {
        const parsedHotels = JSON.parse(decodeURIComponent(hotels))
        console.log('解析后的酒店数据:', parsedHotels)
        this.setState({ 
          hotels: parsedHotels,
          hasMore: parsedHotels.length >= this.state.pageSize
        })
      } catch (error) {
        console.error('解析酒店数据失败:', error)
      }
    }
    
    if (searchParams) {
      try {
        const parsedParams = JSON.parse(decodeURIComponent(searchParams))
        this.setState({ searchParams: parsedParams })
      } catch (error) {
        console.error('解析搜索参数失败:', error)
      }
    }
  }

  componentDidHide() {}

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
        pageSize: pageSize
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
    console.log('搜索参数:', searchParams)
    this.setState({ showCityDatePanel: false, showGuestPanel: false })
  }

  handleHotelClick = (hotelId: string) => {
    Taro.navigateTo({
      url: `/pages/hotel/detail?id=${hotelId}`
    })
  }

  formatDateDisplay = (dateStr: string) => {
    const parts = dateStr.split('-')
    if (parts.length >= 2) {
      return (
        <View className='date-display'>
          <Text className='date-month'>{parts[0]}月</Text>
          <Text className='date-day'>{parts[1]}日</Text>
        </View>
      )
    }
    return <Text>{dateStr}</Text>
  }

  render() {
    const { hotels, searchParams, showCityDatePanel, showGuestPanel, showCalendar, loadingMore, hasMore } = this.state

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
                      <Text>{searchParams.checkIn}</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </View>
                  <View className='panel-row' onClick={this.handleCheckOutClick}>
                    <Text className='panel-label'>离店日期</Text>
                    <View className='panel-picker'>
                      <Text>{searchParams.checkOut}</Text>
                      <Text className='picker-arrow'>▼</Text>
                    </View>
                  </View>
                </View>
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
                    <View className='hotel-price'>
                      <Text className='price'>¥{Math.floor(Math.random() * 500 + 300)}</Text>
                      <Text className='price-unit'>/晚</Text>
                    </View>
                  </View>
                </View>
              ))}
              
              {loadingMore && (
                <>
                  <Skeleton type='card' />
                  <Skeleton type='card' />
                </>
              )}
            </>
          ) : loadingMore ? (
            <>
              <Skeleton type='card' />
              <Skeleton type='card' />
              <Skeleton type='card' />
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
