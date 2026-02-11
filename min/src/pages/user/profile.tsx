import React, { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'

export default class UserProfile extends Component {
  state = {
    userInfo: {
      avatar: '/assets/images/avatar.png',
      nickname: '用户昵称',
      phone: '138****8888'
    },
    menuItems: [
      { icon: '📋', title: '我的订单', path: '/pages/order/list' },
      { icon: '❤️', title: '我的收藏', path: '' },
      { icon: '🎫', title: '优惠券', path: '' },
      { icon: '📍', title: '收货地址', path: '' },
      { icon: '⚙️', title: '设置', path: '' },
      { icon: '📞', title: '联系客服', path: '' }
    ]
  }

  render() {
    return (
      <View className='user-profile'>
        <View className='user-header'>
          <Image className='avatar' src={this.state.userInfo.avatar} mode='aspectFill' />
          <View className='user-info'>
            <Text className='nickname'>{this.state.userInfo.nickname}</Text>
            <Text className='phone'>{this.state.userInfo.phone}</Text>
          </View>
        </View>

        <View className='menu-list'>
          {this.state.menuItems.map((item, index) => (
            <View key={index} className='menu-item'>
              <Text className='menu-icon'>{item.icon}</Text>
              <Text className='menu-title'>{item.title}</Text>
              <Text className='menu-arrow'>{'>'}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }
}
