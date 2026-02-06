import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'

export default class OrderList extends Component {
  state = {
    orders: [
      { id: 1, hotelName: '豪华酒店', status: '待支付', price: 299, date: '2026-02-10' },
      { id: 2, hotelName: '商务酒店', status: '已完成', price: 199, date: '2026-01-15' },
      { id: 3, hotelName: '经济酒店', status: '已取消', price: 99, date: '2026-01-10' }
    ]
  }

  render() {
    return (
      <View className='order-list'>
        <View className='tabs'>
          <View className='tab active'>全部</View>
          <View className='tab'>待支付</View>
          <View className='tab'>待入住</View>
          <View className='tab'>已完成</View>
        </View>

        <View className='order-container'>
          {this.state.orders.map((order) => (
            <View key={order.id} className='order-card'>
              <View className='order-header'>
                <Text className='hotel-name'>{order.hotelName}</Text>
                <Text className={`order-status status-${order.status}`}>{order.status}</Text>
              </View>
              <View className='order-body'>
                <View className='order-item'>
                  <Text className='label'>入住日期</Text>
                  <Text className='value'>{order.date}</Text>
                </View>
                <View className='order-item'>
                  <Text className='label'>订单金额</Text>
                  <Text className='value price'>¥{order.price}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    )
  }
}
