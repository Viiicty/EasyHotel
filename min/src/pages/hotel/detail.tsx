import { Component } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import './index.scss'

export default class HotelDetail extends Component {
  state = {
    hotel: {
      id: 1,
      name: '豪华酒店',
      price: 299,
      rating: 4.8,
      image: '/assets/images/hotel1.jpg',
      address: '市中心商业区',
      description: '位于市中心，交通便利，设施齐全，服务周到。',
      facilities: ['免费WiFi', '免费停车', '24小时前台', '健身房', '游泳池', '餐厅']
    }
  }

  render() {
    const { hotel } = this.state

    return (
      <View className='hotel-detail'>
        <Image className='hotel-banner' src={hotel.image} mode='aspectFill' />

        <View className='hotel-info'>
          <View className='hotel-header'>
            <Text className='hotel-name'>{hotel.name}</Text>
            <View className='hotel-rating'>⭐ {hotel.rating}</View>
          </View>

          <View className='hotel-address'>📍 {hotel.address}</View>

          <View className='hotel-description'>
            <Text className='section-title'>酒店介绍</Text>
            <Text className='description-text'>{hotel.description}</Text>
          </View>

          <View className='hotel-facilities'>
            <Text className='section-title'>酒店设施</Text>
            <View className='facilities-list'>
              {hotel.facilities.map((facility, index) => (
                <View key={index} className='facility-item'>
                  <Text className='facility-text'>{facility}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className='bottom-bar'>
          <View className='price-info'>
            <Text className='price'>¥{hotel.price}</Text>
            <Text className='price-unit'>/晚</Text>
          </View>
          <Button className='book-btn'>立即预订</Button>
        </View>
      </View>
    )
  }
}
