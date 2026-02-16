import React, { Component } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { orderService } from '../../services/order.service'
import './index.scss'

interface OrderDetailState {
  orderId: string
  order: any
  loading: boolean
  remainingTime: number
}

export default class OrderDetailPage extends Component<{}, OrderDetailState> {
  countdownTimer: any = null

  state: OrderDetailState = {
    orderId: '',
    order: null,
    loading: true,
    remainingTime: 0
  }

  componentDidShow() {
    const instance = getCurrentInstance()
    const { orderId } = instance.router?.params || {}

    if (orderId) {
      this.setState({ orderId })
      this.loadOrderDetail(orderId)
    } else {
      Taro.showToast({
        title: '订单ID不存在',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }

  componentDidHide() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  }

  loadOrderDetail = async (orderId: string) => {
    try {
      this.setState({ loading: true })
      const order = await orderService.getOrderById(orderId)
      this.setState({ order })
      
      if (order.status === 'PAID') {
        this.startCountdown()
      }
    } catch (error) {
      console.error('加载订单详情失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  startCountdown = () => {
    this.countdownTimer = setInterval(async () => {
      try {
        const status = await orderService.getOrderStatus(this.state.orderId)
        this.setState({ remainingTime: status.remainingTime })
        
        if (status.remainingTime <= 0) {
          clearInterval(this.countdownTimer)
          this.loadOrderDetail(this.state.orderId)
        }
      } catch (error) {
        console.error('获取订单状态失败:', error)
      }
    }, 1000)
  }

  handleConfirmOrder = async () => {
    try {
      Taro.showLoading({ title: '确认中...' })
      await orderService.confirmOrder(this.state.orderId)
      Taro.hideLoading()
      
      Taro.showToast({
        title: '确认成功',
        icon: 'success'
      })
      
      this.loadOrderDetail(this.state.orderId)
    } catch (error) {
      Taro.hideLoading()
      console.error('确认订单失败:', error)
      Taro.showToast({
        title: error.message || '确认失败',
        icon: 'none'
      })
    }
  }

  handleCancelOrder = async () => {
    Taro.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            Taro.showLoading({ title: '取消中...' })
            await orderService.cancelOrder(this.state.orderId)
            Taro.hideLoading()
            
            Taro.showToast({
              title: '取消成功',
              icon: 'success'
            })
            
            this.loadOrderDetail(this.state.orderId)
          } catch (error) {
            Taro.hideLoading()
            console.error('取消订单失败:', error)
            Taro.showToast({
              title: error.message || '取消失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }

  handleDeleteOrder = async () => {
    Taro.showModal({
      title: '删除订单',
      content: '确定要删除此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            Taro.showLoading({ title: '删除中...' })
            await orderService.deleteOrder(this.state.orderId)
            Taro.hideLoading()
            
            Taro.showToast({
              title: '删除成功',
              icon: 'success'
            })
            
            Taro.navigateBack()
          } catch (error) {
            Taro.hideLoading()
            console.error('删除订单失败:', error)
            Taro.showToast({
              title: error.message || '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
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

  formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  render() {
    const { order, loading, remainingTime } = this.state

    if (loading) {
      return (
        <View className='order-detail-page'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      )
    }

    if (!order) {
      return (
        <View className='order-detail-page'>
          <Text className='error-text'>订单不存在</Text>
        </View>
      )
    }

    return (
      <View className='order-detail-page'>
        <ScrollView className='order-content' scrollY>
          <View className='order-header'>
            <Text className='order-no'>订单号：{order.orderNo}</Text>
            <View className='order-status'>
              <Text 
                className='status-text' 
                style={{ color: this.getStatusColor(order.status) }}
              >
                {this.getStatusText(order.status)}
              </Text>
            </View>
          </View>

          <View className='order-section'>
            <Text className='section-title'>酒店信息</Text>
            <View className='info-row'>
              <Text className='info-label'>酒店名称</Text>
              <Text className='info-value'>{order.hotel?.nameZh || ''}</Text>
            </View>
            <View className='info-row'>
              <Text className='info-label'>房型名称</Text>
              <Text className='info-value'>{order.roomType?.name || ''}</Text>
            </View>
            <View className='info-row'>
              <Text className='info-label'>入住日期</Text>
              <Text className='info-value'>
                {order.checkinDate ? String(order.checkinDate).split('T')[0] : ''}
              </Text>
            </View>
            <View className='info-row'>
              <Text className='info-label'>退房日期</Text>
              <Text className='info-value'>
                {order.checkoutDate ? String(order.checkoutDate).split('T')[0] : ''}
              </Text>
            </View>
            <View className='info-row'>
              <Text className='info-label'>晚数</Text>
              <Text className='info-value'>{order.nights || 0}晚</Text>
            </View>
            <View className='info-row'>
              <Text className='info-label'>房间数量</Text>
              <Text className='info-value'>{order.rooms || 0}间</Text>
            </View>
          </View>

          <View className='order-section'>
            <Text className='section-title'>住客信息</Text>
            <View className='info-row'>
              <Text className='info-label'>住客姓名</Text>
              <Text className='info-value'>{order.guestName || ''}</Text>
            </View>
            <View className='info-row'>
              <Text className='info-label'>联系手机</Text>
              <Text className='info-value'>{order.guestPhone || ''}</Text>
            </View>
            <View className='info-row'>
              <Text className='info-label'>身份证号</Text>
              <Text className='info-value'>{order.idCard || ''}</Text>
            </View>
          </View>

          <View className='order-section'>
            <Text className='section-title'>价格明细</Text>
            {order.priceDetail && Array.isArray(order.priceDetail) && order.priceDetail.length > 0 ? (
              order.priceDetail.map((item: any, index: number) => (
                <View key={index} className='price-row'>
                  <Text className='price-date'>{item.date}</Text>
                  <Text className='price-value'>¥{item.price}</Text>
                </View>
              ))
            ) : (
              <View className='price-row'>
                <Text className='price-date'>总价</Text>
                <Text className='price-value'>¥{order.totalAmount || 0}</Text>
              </View>
            )}
            <View className='total-row'>
              <Text className='total-label'>订单总价</Text>
              <Text className='total-value'>¥{order.totalAmount || 0}</Text>
            </View>
          </View>

          {order.status === 'PAID' && remainingTime > 0 && (
            <View className='countdown-section'>
              <Text className='countdown-text'>
                剩余时间：{this.formatCountdown(remainingTime)}
              </Text>
            </View>
          )}

          <View className='order-section'>
            <Text className='section-title'>订单信息</Text>
            <View className='info-row'>
              <Text className='info-label'>创建时间</Text>
              <Text className='info-value'>
                {order.createdTime ? String(order.createdTime).split('T')[0] : ''}
              </Text>
            </View>
            <View className='info-row'>
              <Text className='info-label'>更新时间</Text>
              <Text className='info-value'>
                {order.updatedTime ? String(order.updatedTime).split('T')[0] : ''}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className='order-actions'>
          {order.status === 'PAID' && (
            <>
              <Button 
                className='action-btn confirm-btn' 
                onClick={this.handleConfirmOrder}
              >
                确认订单
              </Button>
              <Button 
                className='action-btn cancel-btn' 
                onClick={this.handleCancelOrder}
              >
                取消订单
              </Button>
            </>
          )}
          {(order.status === 'CANCELLED' || order.status === 'COMPLETED') && (
            <Button 
              className='action-btn delete-btn' 
              onClick={this.handleDeleteOrder}
            >
              删除订单
            </Button>
          )}
        </View>
      </View>
    )
  }
}
