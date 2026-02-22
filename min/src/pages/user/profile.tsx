import React, { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { userService } from '../../services/user.service'
import './index.scss'

interface UserInfo {
  avatar: string
  nickname: string
  phone: string
}

interface UserProfileState {
  userInfo: UserInfo
  menuItems: Array<{ icon: string, title: string, path: string }>
}

export default class UserProfile extends Component<{}, UserProfileState> {
  state: UserProfileState = {
    userInfo: {
      avatar: '/assets/images/avatar.png',
      nickname: '用户昵称',
      phone: '138****8888'
    },
    menuItems: [
      { icon: '📋', title: '我的订单', path: '/pages/order/index' },
      { icon: '❤️', title: '我的收藏', path: '' },
      { icon: '🎫', title: '优惠券', path: '' },
      { icon: '📍', title: '收货地址', path: '' },
      { icon: '⚙️', title: '设置', path: '' },
      { icon: '📞', title: '联系客服', path: '' }
    ]
  }

  componentDidShow() {
    console.log('=== UserProfile componentDidShow ===')
    this.loadUserInfo()
  }

  loadUserInfo = () => {
    const userInfo = userService.getUserInfo()
    console.log('用户信息:', userInfo)

    if (userInfo) {
      this.setState({
        userInfo: {
          avatar: '/assets/images/avatar.png',
          nickname: userInfo.name || '用户昵称',
          phone: userInfo.phone ? userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '138****8888'
        }
      })
    }
  }

  handleMenuClick = (item: { icon: string, title: string, path: string }) => {
    if (item.path) {
      Taro.navigateTo({
        url: item.path
      })
    } else {
      Taro.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
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
            <View key={index} className='menu-item' onClick={() => this.handleMenuClick(item)}>
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
