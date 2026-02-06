import { Component } from 'react'
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import './index.scss'

export default class Index extends Component {
  state = {
    searchInfo: {
      destination: '北京',
      checkIn: '02-10',
      checkOut: '02-11'
    },
    quickActions: [
      { id: 1, name: '酒店', icon: '🏨', color: '#1890ff' },
      { id: 2, name: '机票', icon: '✈️', color: '#52c41a' },
      { id: 3, name: '火车票', icon: '🚄', color: '#faad14' },
      { id: 4, name: '景点门票', icon: '🎫', color: '#f5222d' },
      { id: 5, name: '汽车票', icon: '🚌', color: '#722ed1' },
      { id: 6, name: '船票', icon: '⛴️', color: '#13c2c2' },
      { id: 7, name: '度假', icon: '🏖️', color: '#eb2f96' },
      { id: 8, name: '更多', icon: '➕', color: '#8c8c8c' }
    ],
    bannerList: [
      { id: 1, image: '/assets/images/banner1.jpg', title: '酒店特惠' },
      { id: 2, image: '/assets/images/banner2.jpg', title: '春节大促' },
      { id: 3, image: '/assets/images/banner3.jpg', title: '会员专享' }
    ],
    hotCities: [
      { id: 1, name: '北京', image: '/assets/images/city1.jpg' },
      { id: 2, name: '上海', image: '/assets/images/city2.jpg' },
      { id: 3, name: '广州', image: '/assets/images/city3.jpg' },
      { id: 4, name: '深圳', image: '/assets/images/city4.jpg' }
    ],
    recommendHotels: [
      { id: 1, name: '北京建国饭店', price: 588, rating: 4.8, reviews: 2341, tags: ['五星级', '市中心'], image: '/assets/images/hotel1.jpg', location: '朝阳区建国门外大街' },
      { id: 2, name: '上海和平饭店', price: 1288, rating: 4.9, reviews: 5621, tags: ['历史建筑', '外滩'], image: '/assets/images/hotel2.jpg', location: '黄浦区南京东路' },
      { id: 3, name: '广州白天鹅宾馆', price: 899, rating: 4.7, reviews: 1890, tags: ['江景', '老字号'], image: '/assets/images/hotel3.jpg', location: '荔湾区沙面南街' }
    ]
  }

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <View className='index'>
        <View className='header'>
          <View className='location'>
            <Text className='location-text'>{this.state.searchInfo.destination}</Text>
            <Text className='location-arrow'>▼</Text>
          </View>
          <View className='header-right'>
            <Text className='scan-icon'>📷</Text>
            <Text className='message-icon'>🔔</Text>
          </View>
        </View>

        <View className='search-section'>
          <View className='search-bar'>
            <View className='search-row'>
              <Text className='search-label'>目的地</Text>
              <Text className='search-value'>{this.state.searchInfo.destination}</Text>
            </View>
            <View className='search-divider'></View>
            <View className='search-row'>
              <Text className='search-label'>入住</Text>
              <Text className='search-value'>{this.state.searchInfo.checkIn}</Text>
            </View>
            <View className='search-divider'></View>
            <View className='search-row'>
              <Text className='search-label'>退房</Text>
              <Text className='search-value'>{this.state.searchInfo.checkOut}</Text>
            </View>
          </View>
          <View className='search-btn'>
            <Text className='search-btn-text'>搜索酒店</Text>
          </View>
        </View>

        <View className='quick-actions'>
          {this.state.quickActions.map((action) => (
            <View key={action.id} className='action-item'>
              <View className='action-icon' style={{ backgroundColor: action.color }}>
                <Text className='icon-text'>{action.icon}</Text>
              </View>
              <Text className='action-name'>{action.name}</Text>
            </View>
          ))}
        </View>

        <View className='banner-section'>
          <Swiper className='banner-swiper' indicatorDots autoplay circular>
            {this.state.bannerList.map((banner) => (
              <SwiperItem key={banner.id}>
                <Image className='banner-image' src={banner.image} mode='aspectFill' />
              </SwiperItem>
            ))}
          </Swiper>
        </View>

        <View className='hot-cities'>
          <View className='section-header'>
            <Text className='section-title'>热门目的地</Text>
            <Text className='section-more'>更多 {'>'}</Text>
          </View>
          <View className='city-list'>
            {this.state.hotCities.map((city) => (
              <View key={city.id} className='city-item'>
                <Image className='city-image' src={city.image} mode='aspectFill' />
                <Text className='city-name'>{city.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='recommend-section'>
          <View className='section-header'>
            <Text className='section-title'>为你推荐</Text>
            <Text className='section-more'>更多 {'>'}</Text>
          </View>
          <View className='hotel-list'>
            {this.state.recommendHotels.map((hotel) => (
              <View key={hotel.id} className='hotel-card'>
                <Image className='hotel-image' src={hotel.image} mode='aspectFill' />
                <View className='hotel-content'>
                  <Text className='hotel-name'>{hotel.name}</Text>
                  <View className='hotel-tags'>
                    {hotel.tags.map((tag, index) => (
                      <Text key={index} className='tag'>{tag}</Text>
                    ))}
                  </View>
                  <View className='hotel-rating'>
                    <Text className='rating-score'>{hotel.rating}</Text>
                    <Text className='rating-text'>分</Text>
                    <Text className='rating-reviews'>{hotel.reviews}条评价</Text>
                  </View>
                  <View className='hotel-location'>📍 {hotel.location}</View>
                  <View className='hotel-price-row'>
                    <View className='price-info'>
                      <Text className='price-symbol'>¥</Text>
                      <Text className='price-value'>{hotel.price}</Text>
                    </View>
                    <View className='book-btn'>预订</View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }
}
