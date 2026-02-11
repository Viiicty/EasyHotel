import React, { Component } from 'react'
import { View, Text, Image, Button, ScrollView } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { hotelService, HotelDetail, RoomType } from '../../services/hotel.service'
import './index.scss'

interface HotelDetailState {
  hotel: HotelDetail | null
  roomTypes: RoomType[]
  loading: boolean
  error: string | null
}

export default class HotelDetailPage extends Component<{}, HotelDetailState> {
  state: HotelDetailState = {
    hotel: null,
    roomTypes: [],
    loading: true,
    error: null
  }

  componentDidShow() {
    this.loadHotelDetail()
  }

  componentDidHide() {}

  loadHotelDetail = async () => {
    const instance = getCurrentInstance()
    const { id } = instance.router?.params || {}

    if (!id) {
      this.setState({ error: '酒店ID不存在', loading: false })
      return
    }

    try {
      this.setState({ loading: true })

      const hotelDetail = await hotelService.getHotelDetail(id)
      const roomTypes = await hotelService.getRoomTypesByHotel(id)

      this.setState({
        hotel: hotelDetail,
        roomTypes: roomTypes,
        loading: false
      })
    } catch (error) {
      console.error('获取酒店详情失败:', error)
      this.setState({
        error: '获取酒店详情失败',
        loading: false
      })
    }
  }

  handleBook = () => {
    Taro.showToast({
      title: '预订功能开发中',
      icon: 'none'
    })
  }

  renderStars = (starLevel: number) => {
    const stars = []
    for (let i = 0; i < starLevel; i++) {
      stars.push(<Text key={i} className='star'>★</Text>)
    }
    return stars
  }

  getFacilityIcon = (facility: string) => {
    const iconMap: { [key: string]: string } = {
      'wifi': '📶',
      'parking': '🅿️',
      'swimming': '🏊',
      'gym': '🏋️',
      'restaurant': '🍽️',
      'spa': '💆',
      'family': '👨‍👩‍👧‍👦',
      'luxury': '👑',
      'business': '💼',
      'airport': '✈️',
      'subway': '🚇'
    }
    return iconMap[facility] || '🏷️'
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

  render() {
    const { hotel, roomTypes, loading, error } = this.state

    if (loading) {
      return (
        <View className='hotel-detail'>
          <View className='loading'>加载中...</View>
        </View>
      )
    }

    if (error) {
      return (
        <View className='hotel-detail'>
          <View className='error'>{error}</View>
        </View>
      )
    }

    if (!hotel) {
      return null
    }

    return (
      <View className='hotel-detail'>
        {hotel.coverImage && (
          <Image className='hotel-banner' src={hotel.coverImage} mode='aspectFill' />
        )}

        <View className='hotel-info-card'>
          <View className='hotel-header'>
            <View className='hotel-name-section'>
              <Text className='hotel-name'>{hotel.hotelName}</Text>
              <Text className='hotel-name-en'>{hotel.hotelNameEn}</Text>
            </View>
            <View className='hotel-rating'>
              {this.renderStars(hotel.starLevel)}
            </View>
          </View>

          <View className='facilities-scroll'>
            <ScrollView scrollX className='scroll-container'>
              <View className='facilities-list'>
                {hotel.facilities && Array.isArray(hotel.facilities) && hotel.facilities.length > 0 && hotel.facilities.map((facility, index) => (
                  <View key={`facility-${index}`} className='facility-item'>
                    <Text className='facility-icon'>{this.getFacilityIcon(facility)}</Text>
                    <Text className='facility-label'>{this.getFacilityLabel(facility)}</Text>
                  </View>
                ))}
                {hotel.tags && Array.isArray(hotel.tags) && hotel.tags.length > 0 && hotel.tags.map((tag, index) => (
                  <View key={`tag-${index}`} className='facility-item'>
                    <Text className='facility-icon'>{this.getFacilityIcon(tag)}</Text>
                    <Text className='facility-label'>{this.getFacilityLabel(tag)}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View className='hotel-meta'>
            <View className='meta-item'>
              <Text className='meta-label'>开业时间</Text>
              <Text className='meta-value'>{hotel.createdAt ? hotel.createdAt.split('T')[0] : ''}</Text>
            </View>
            <View className='meta-item'>
              <Text className='meta-label'>地址</Text>
              <Text className='meta-value'>📍 {hotel.address}</Text>
            </View>
          </View>
        </View>

        <View className='room-types-section'>
          <Text className='section-title'>房型列表</Text>
          <View className='room-types-list'>
            {roomTypes.length > 0 ? (
              roomTypes.map((roomType) => (
                <View key={roomType.id} className='room-type-card'>
                  <Text className='room-name'>{roomType.name}</Text>
                  <View className='room-details'>
                    {roomType.bedType && (
                      <View className='room-detail-item'>
                        <Text className='detail-icon'>🛏️</Text>
                        <Text className='detail-text'>{roomType.bedType}</Text>
                      </View>
                    )}
                    {roomType.areaSqm && (
                      <View className='room-detail-item'>
                        <Text className='detail-icon'>📐</Text>
                        <Text className='detail-text'>{roomType.areaSqm}㎡</Text>
                      </View>
                    )}
                    {roomType.maxGuests && (
                      <View className='room-detail-item'>
                        <Text className='detail-icon'>👥</Text>
                        <Text className='detail-text'>最多{roomType.maxGuests}人入住</Text>
                      </View>
                    )}
                    {roomType.breakfast && (
                      <View className='room-detail-item'>
                        <Text className='detail-icon'>🍳</Text>
                        <Text className='detail-text'>{roomType.breakfast}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View className='empty-room-types'>
                <Text>暂无房型数据</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }
}
