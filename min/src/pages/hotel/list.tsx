import React, { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { Hotel } from '../../services/hotel.service'
import './index.scss'

interface HotelListState {
  hotels: Hotel[]
  loading: boolean
}

export default class HotelList extends Component<{}, HotelListState> {
  state: HotelListState = {
    hotels: [],
    loading: false
  }

  componentDidShow() {
    const instance = getCurrentInstance()
    const { hotels, searchParams } = instance.router?.params || {}
    
    console.log('接收到的参数:', { hotels, searchParams })
    
    if (hotels) {
      try {
        const parsedHotels = JSON.parse(decodeURIComponent(hotels))
        console.log('解析后的酒店数据:', parsedHotels)
        this.setState({ hotels: parsedHotels })
      } catch (error) {
        console.error('解析酒店数据失败:', error)
      }
    }
  }

  componentDidHide() {}

  handleHotelClick = (hotelId: string) => {
    Taro.navigateTo({
      url: `/pages/hotel/detail?id=${hotelId}`
    })
  }

  render() {
    const { hotels } = this.state

    return (
      <View className='hotel-list-page'>
        <View className='filter-bar'>
          <View className='filter-item active'>全部</View>
          <View className='filter-item'>价格最低</View>
          <View className='filter-item'>评分最高</View>
          <View className='filter-item'>距离最近</View>
        </View>

        <View className='hotel-container'>
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <View key={hotel.id} className='hotel-card' onClick={() => this.handleHotelClick(hotel.id)}>
                <Image className='hotel-image' src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop' mode='aspectFill' />
                <View className='hotel-content'>
                  <Text className='hotel-name'>{hotel.hotelName}</Text>
                  <Text className='hotel-address'>📍 {hotel.city}</Text>
                  <View className='hotel-bottom'>
                    <View className='hotel-rating'>{hotel.starLevel}星级</View>
                    <View className='hotel-status'>{hotel.status === 'ONLINE' ? '在线' : '离线'}</View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className='empty-state'>
              <Text className='empty-text'>暂无酒店数据</Text>
            </View>
          )}
        </View>
      </View>
    )
  }
}
