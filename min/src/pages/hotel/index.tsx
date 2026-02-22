import React, { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import './index.scss'

export default class HotelIndex extends Component {
  render() {
    return (
      <View className='hotel-index'>
        <ScrollView className='content' scrollY>
          <Text>酒店页面</Text>
        </ScrollView>
      </View>
    )
  }
}
