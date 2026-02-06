import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'

export default class HotelList extends Component {
  state = {
    hotels: [
      { id: 1, name: '豪华酒店', price: 299, rating: 4.8, image: '/assets/images/hotel1.jpg', address: '市中心' },
      { id: 2, name: '商务酒店', price: 199, rating: 4.5, image: '/assets/images/hotel2.jpg', address: '商业区' },
      { id: 3, name: '经济酒店', price: 99, rating: 4.2, image: '/assets/images/hotel3.jpg', address: '火车站' },
      { id: 4, name: '精品酒店', price: 399, rating: 4.9, image: '/assets/images/hotel4.jpg', address: '风景区' }
    ]
  }

  render() {
    return (
      <View className='hotel-list-page'>
        <View className='filter-bar'>
          <View className='filter-item active'>全部</View>
          <View className='filter-item'>价格最低</View>
          <View className='filter-item'>评分最高</View>
          <View className='filter-item'>距离最近</View>
        </View>

        <View className='hotel-container'>
          {this.state.hotels.map((hotel) => (
            <View key={hotel.id} className='hotel-card'>
              <Image className='hotel-image' src={hotel.image} mode='aspectFill' />
              <View className='hotel-content'>
                <Text className='hotel-name'>{hotel.name}</Text>
                <Text className='hotel-address'>📍 {hotel.address}</Text>
                <View className='hotel-bottom'>
                  <View className='hotel-rating'>⭐ {hotel.rating}</View>
                  <View className='hotel-price'>
                    <Text className='price'>¥{hotel.price}</Text>
                    <Text className='price-unit'>/晚</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    )
  }
}
