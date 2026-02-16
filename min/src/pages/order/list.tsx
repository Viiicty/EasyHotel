import React, { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { orderService } from '../../services/order.service'
import './index.scss'

interface OrderListState {
  orders: any[]
  loading: boolean
  currentStatus: string
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export default class OrderListPage extends Component<{}, OrderListState> {
  state: OrderListState = {
    orders: [],
    loading: true,
    currentStatus: 'ALL',
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true
  }

  componentDidShow() {
    this.loadOrders()
  }

  loadOrders = async (refresh = false) => {
    try {
      if (refresh) {
        this.setState({ page: 1, orders: [] })
      }

      this.setState({ loading: true })

      const result = await orderService.getUserOrders({
        status: this.state.currentStatus === 'ALL' ? undefined : this.state.currentStatus,
        page: this.state.page,
        pageSize: this.state.pageSize
      })

      const newOrders = refresh ? result.orders : [...this.state.orders, ...result.orders]

      this.setState({
        orders: newOrders,
        total: result.total,
        hasMore: newOrders.length < result.total,
        loading: false
      })
    } catch (error) {
      console.error('加载订单列表失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setState({ loading: false })
    }
  }

  handleStatusChange = (status: string) => {
    this.setState({ currentStatus: status }, () => {
      this.loadOrders(true)
    })
  }

  handleOrderClick = (orderId: string) => {
    Taro.navigateTo({
      url: `/pages/order/detail?id=${orderId}`
    })
  }

  handleScrollToLower = () => {
    if (!this.state.loading && this.state.hasMore) {
      this.setState({ page: this.state.page + 1 }, () => {
        this.loadOrders()
      })
    }
  }

  handleRefresh = () => {
    this.loadOrders(true)
  }

  getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': '待支付',
      'PAID': '已支付',
      'CONFIRMED': '已确认',
      'CANCELLED': '已取消',
      'REFUNDED': '已退款',
      'COMPLETED': '已完成'
    }
    return statusMap[status] || status
  }

  getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'PENDING': '#faad14',
      'PAID': '#1890ff',
      'CONFIRMED': '#52c41a',
      'CANCELLED': '#999',
      'REFUNDED': '#ff4d4f',
      'COMPLETED': '#52c41a'
    }
    return colorMap[status] || '#999'
  }

  render() {
    const { orders, loading, currentStatus, hasMore } = this.state

    return (
      <View className='order-list-page'>
        <View className='status-tabs'>
          {['ALL', 'PENDING', 'PAID', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((status) => (
            <View
              key={status}
              className={`status-tab ${currentStatus === status ? 'active' : ''}`}
              onClick={() => this.handleStatusChange(status)}
            >
              <Text className='status-text'>
                {status === 'ALL' ? '全部' : this.getStatusText(status)}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView
          className='order-list'
          scrollY
          onScrollToLower={this.handleScrollToLower}
          refresherEnabled
          onRefresherRefresh={this.handleRefresh}
          lowerThreshold={100}
        >
          {orders.length > 0 ? (
            orders.map((order: any) => (
              <View
                key={order.id}
                className='order-card'
                onClick={() => this.handleOrderClick(order.id)}
              >
                <View className='order-header'>
                  <Text className='hotel-name'>{order.hotel?.nameZh || ''}</Text>
                  <View className='order-status'>
                    <Text
                      className='status-text'
                      style={{ color: this.getStatusColor(order.status) }}
                    >
                      {this.getStatusText(order.status)}
                    </Text>
                  </View>
                </View>

                <View className='order-body'>
                  <View className='order-info'>
                    <Text className='info-label'>房型</Text>
                    <Text className='info-value'>{order.roomType?.name || ''}</Text>
                  </View>
                  <View className='order-info'>
                    <Text className='info-label'>入住日期</Text>
                    <Text className='info-value'>
                      {order.checkinDate ? String(order.checkinDate).split('T')[0] : ''}
                    </Text>
                  </View>
                  <View className='order-info'>
                    <Text className='info-label'>退房日期</Text>
                    <Text className='info-value'>
                      {order.checkoutDate ? String(order.checkoutDate).split('T')[0] : ''}
                    </Text>
                  </View>
                  <View className='order-info'>
                    <Text className='info-label'>晚数</Text>
                    <Text className='info-value'>{order.nights || 0}晚</Text>
                  </View>
                </View>

                <View className='order-footer'>
                  <Text className='total-price'>¥{order.totalAmount || 0}</Text>
                  <Text className='order-no'>{order.orderNo}</Text>
                </View>
              </View>
            ))
          ) : (
            <View className='empty-orders'>
              <Text className='empty-text'>暂无订单</Text>
            </View>
          )}

          {hasMore && (
            <View className='load-more'>
              <Text className='load-more-text'>
                {loading ? '加载中...' : '上拉加载更多'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}
