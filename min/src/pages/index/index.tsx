import React, { Component } from 'react'
import { View, Text, Swiper, SwiperItem, Picker, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { hotelService, Banner, Hotel } from '../../services/hotel.service'
import './index.scss'

interface SearchParams {
  city: string
  hotelName: string
  checkIn: string
  checkOut: string
  priceRange: number[]
  starLevel: number
  tags: string[]
}

interface PriceRange {
  label: string
  value: number[]
}

interface StarLevel {
  label: string
  value: number
}

interface HotelTag {
  label: string
  value: string
}

interface IndexState {
  bannerList: Banner[]
  searchParams: SearchParams
  priceRanges: PriceRange[]
  starLevels: StarLevel[]
  hotelTags: HotelTag[]
  recommendHotels: Hotel[]
  loading: boolean
}

export default class Index extends Component<{}, IndexState> {
  state = {
    bannerList: [],
    searchParams: {
      city: '北京',
      hotelName: '',
      checkIn: '02-10',
      checkOut: '02-11',
      priceRange: [0, 1000],
      starLevel: 0,
      tags: []
    },
    priceRanges: [
      { label: '不限', value: [0, 9999] },
      { label: '0-300元', value: [0, 300] },
      { label: '300-500元', value: [300, 500] },
      { label: '500-800元', value: [500, 800] },
      { label: '800-1000元', value: [800, 1000] },
      { label: '1000元以上', value: [1000, 9999] }
    ],
    starLevels: [
      { label: '不限', value: 0 },
      { label: '三星级', value: 3 },
      { label: '四星级', value: 4 },
      { label: '五星级', value: 5 }
    ],
    hotelTags: [
      { label: '不限', value: '' },
      { label: '市中心', value: '市中心' },
      { label: '近地铁', value: '近地铁' },
      { label: '江景', value: '江景' },
      { label: '海景', value: '海景' },
      { label: '山景', value: '山景' },
      { label: '商务', value: '商务' },
      { label: '度假', value: '度假' }
    ],
    recommendHotels: [],
    loading: false
  }

  componentDidShow() {
    this.loadBanners()
    this.loadRecommendHotels()
  }

  componentDidHide() {}

  loadBanners = async () => {
    try {
      const banners = await hotelService.getBanners()
      console.log('Banners loaded:', banners)
      this.setState({ bannerList: banners || [] })
    } catch (error) {
      console.error('加载Banner失败:', error)
      this.setState({ bannerList: [] })
    }
  }

  loadRecommendHotels = async () => {
    try {
      const hotels = await hotelService.getRecommendHotels(4)
      console.log('Recommend hotels loaded:', hotels)
      this.setState({ recommendHotels: hotels || [] })
    } catch (error) {
      console.error('加载推荐酒店失败:', error)
      this.setState({ recommendHotels: [] })
    }
  }

  handleBannerClick = (banner: Banner) => {
    console.log('Banner clicked:', banner)
    const hotelId = banner.hotel?.id || banner.hotelId
    console.log('Final hotelId:', hotelId)
    if (hotelId) {
      Taro.navigateTo({
        url: `/pages/hotel/detail?id=${hotelId}`
      })
    } else {
      Taro.showToast({
        title: '未找到关联酒店',
        icon: 'none'
      })
    }
  }

  handleHotelClick = (hotel: Hotel) => {
    Taro.navigateTo({
      url: `/pages/hotel/detail?id=${hotel.id}`
    })
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

  handleCityChange = async (e) => {
    const cityCode = e.detail.value
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        city: cityCode
      }
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

  handlePriceChange = (e) => {
    const selectedPrice = this.state.priceRanges[e.detail.value]
    this.setState({
      searchParams: {
        ...this.state.searchParams,
        priceRange: selectedPrice.value
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

  handleTagToggle = (tag) => {
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

  handleSearch = async () => {
    const { searchParams } = this.state
    Taro.showToast({
      title: '搜索中...',
      icon: 'loading'
    })

    try {
      const hotels = await hotelService.searchHotels({
        keyword: searchParams.hotelName || undefined,
        starLevel: searchParams.starLevel > 0 ? searchParams.starLevel : undefined,
        status: 'APPROVED',
        available: 'UP'
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
    return (
      <View className='index'>
        <View className='banner-section'>
          {this.state.bannerList.length > 0 ? (
            <Swiper className='banner-swiper' indicatorDots autoplay circular catchMove>
              {this.state.bannerList.map((banner) => (
                <SwiperItem key={banner.id}>
                  <View className='banner-item' onClick={() => this.handleBannerClick(banner)}>
                    {banner.coverImage && <Image className='banner-image' src={banner.coverImage} mode='aspectFill' />}
                  </View>
                </SwiperItem>
              ))}
            </Swiper>
          ) : (
            <View className='banner-placeholder'>
              <Text>暂无轮播图</Text>
            </View>
          )}
        </View>

        <View className='search-section'>
          <View className='search-title'>
            <Text className='title-text'>搜索酒店</Text>
          </View>

          <View className='search-form'>
            <View className='form-item'>
              <Text className='form-label'>城市</Text>
              <Picker mode='selector' range={['北京', '上海', '广州', '深圳', '杭州', '成都']} onChange={this.handleCityChange}>
                <View className='form-value'>
                  <Text>{this.state.searchParams.city}</Text>
                  <Text className='arrow'>▼</Text>
                </View>
              </Picker>
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

            <View className='form-row'>
              <View className='form-item'>
                <Text className='form-label'>入住日期</Text>
                <Picker mode='date' onChange={(e) => this.setState({ searchParams: { ...this.state.searchParams, checkIn: e.detail.value } })}>
                  <View className='form-value'>
                    <Text>{this.state.searchParams.checkIn}</Text>
                    <Text className='arrow'>▼</Text>
                  </View>
                </Picker>
              </View>

              <View className='form-item'>
                <Text className='form-label'>退房日期</Text>
                <Picker mode='date' onChange={(e) => this.setState({ searchParams: { ...this.state.searchParams, checkOut: e.detail.value } })}>
                  <View className='form-value'>
                    <Text>{this.state.searchParams.checkOut}</Text>
                    <Text className='arrow'>▼</Text>
                  </View>
                </Picker>
              </View>
            </View>

            <View className='form-row'>
              <View className='form-item'>
                <Text className='form-label'>价格区间</Text>
                <Picker mode='selector' range={this.state.priceRanges.map(item => item.label)} onChange={this.handlePriceChange}>
                  <View className='form-value'>
                    <Text>{this.state.priceRanges.find(item => item.value[0] === this.state.searchParams.priceRange[0])?.label}</Text>
                    <Text className='arrow'>▼</Text>
                  </View>
                </Picker>
              </View>

              <View className='form-item'>
                <Text className='form-label'>星级</Text>
                <Picker mode='selector' range={this.state.starLevels.map(item => item.label)} onChange={this.handleStarChange}>
                  <View className='form-value'>
                    <Text>{this.state.starLevels.find(item => item.value === this.state.searchParams.starLevel)?.label}</Text>
                    <Text className='arrow'>▼</Text>
                  </View>
                </Picker>
              </View>
            </View>

            <View className='form-item'>
              <Text className='form-label'>酒店标签</Text>
              <View className='tags-container'>
                {this.state.hotelTags.map((tag, index) => (
                  <View
                    key={index}
                    className={`tag-item ${this.state.searchParams.tags.includes(tag.value) ? 'active' : ''}`}
                    onClick={() => this.handleTagToggle(tag)}
                  >
                    <Text className='tag-text'>{tag.label}</Text>
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
            {this.state.recommendHotels.length > 0 ? (
              this.state.recommendHotels.map((hotel) => (
                <View key={hotel.id} className='hotel-card' onClick={() => this.handleHotelClick(hotel)}>
                  {hotel.coverImage && <Image className='hotel-cover' src={hotel.coverImage} mode='aspectFill' />}
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
                  </View>
                </View>
              ))
            ) : (
              <View className='empty-tip'>
                <Text>暂无推荐酒店</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }
}
